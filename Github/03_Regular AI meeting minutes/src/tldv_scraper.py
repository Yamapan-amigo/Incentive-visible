"""
tldv Transcript Scraper using undetected-chromedriver

Automatically logs into tldv and extracts meeting transcripts.
Supports Microsoft SSO login with session persistence.
Uses undetected-chromedriver to avoid bot detection.
"""

import json
import os
import pickle
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Session files
SESSION_DIR = Path(__file__).parent.parent / ".chrome_profile"
COOKIES_FILE = Path(__file__).parent.parent / ".tldv_cookies.pkl"
STORAGE_FILE = Path(__file__).parent.parent / ".tldv_storage.json"

# Session validity period (12 hours)
SESSION_MAX_AGE = 12 * 60 * 60


class TldvScraper:
    """Scrapes meeting transcripts from tldv using undetected-chromedriver."""

    def __init__(self, email: str = "", password: str = "", headless: bool = True):
        """
        Initialize the scraper.

        Args:
            email: tldv account email (optional for SSO)
            password: tldv account password (optional for SSO)
            headless: Run browser in headless mode (default: True)
        """
        self.email = email
        self.password = password
        self.headless = headless
        self.driver = None

    def _is_session_valid(self) -> bool:
        """Check if session cookies exist and are not too old."""
        if not COOKIES_FILE.exists():
            return False
        age = time.time() - COOKIES_FILE.stat().st_mtime
        return age < SESSION_MAX_AGE

    def _create_driver(self, headless: bool = None, use_profile: bool = True):
        """Create undetected Chrome driver."""
        if headless is None:
            headless = self.headless

        options = uc.ChromeOptions()

        # Don't use headless mode - tldv detects it
        # Use offscreen window position instead
        if headless:
            options.add_argument('--window-position=-10000,-10000')

        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--lang=ja-JP')
        options.add_argument('--disable-blink-features=AutomationControlled')

        # Use persistent profile to maintain session
        if use_profile:
            SESSION_DIR.mkdir(exist_ok=True)
            options.add_argument(f'--user-data-dir={SESSION_DIR}')

        driver = uc.Chrome(options=options, version_main=144, headless=False)
        return driver

    def _save_cookies(self):
        """Save cookies and local storage to files."""
        if self.driver:
            # Save cookies
            cookies = self.driver.get_cookies()
            with open(COOKIES_FILE, 'wb') as f:
                pickle.dump(cookies, f)
            print(f"Cookies saved to {COOKIES_FILE}")

            # Save local storage
            local_storage = self.driver.execute_script(
                "return JSON.stringify(localStorage);"
            )
            session_storage = self.driver.execute_script(
                "return JSON.stringify(sessionStorage);"
            )
            storage_data = {
                "localStorage": json.loads(local_storage) if local_storage else {},
                "sessionStorage": json.loads(session_storage) if session_storage else {}
            }
            with open(STORAGE_FILE, 'w') as f:
                json.dump(storage_data, f)
            print(f"Storage saved to {STORAGE_FILE}")

    def _load_cookies(self):
        """Load cookies from file."""
        if COOKIES_FILE.exists() and self.driver:
            try:
                with open(COOKIES_FILE, 'rb') as f:
                    cookies = pickle.load(f)
                for cookie in cookies:
                    try:
                        self.driver.add_cookie(cookie)
                    except Exception:
                        pass
                return True
            except Exception as e:
                print(f"Error loading cookies: {e}")
        return False

    def _load_storage(self):
        """Load local storage from file."""
        if STORAGE_FILE.exists() and self.driver:
            try:
                with open(STORAGE_FILE, 'r') as f:
                    storage_data = json.load(f)

                # Restore local storage
                for key, value in storage_data.get("localStorage", {}).items():
                    self.driver.execute_script(
                        f"localStorage.setItem('{key}', '{value}');"
                    )
                print("Local storage restored")
                return True
            except Exception as e:
                print(f"Error loading storage: {e}")
        return False

    def _is_logged_in(self) -> bool:
        """Check if already logged in."""
        try:
            # Try to access meetings directly - profile should have session
            self.driver.get("https://tldv.io/app/meetings")
            time.sleep(5)
            current_url = self.driver.current_url
            print(f"Current URL: {current_url}")
            return "signin" not in current_url and "login" not in current_url
        except Exception as e:
            print(f"Error checking login status: {e}")
            return False

    def _wait_for_login(self, timeout: int = 180) -> bool:
        """Wait for user to complete login."""
        print("\n" + "=" * 50)
        print("ブラウザでログインを完了してください。")
        print("Microsoft アカウントを選択してログインします。")
        print("ログイン完了後、自動的に続行します。")
        print("=" * 50 + "\n")

        try:
            WebDriverWait(self.driver, timeout).until(
                EC.url_contains("/app/")
            )
            return True
        except TimeoutException:
            print("Login timeout")
            return False

    def find_target_meeting(self, meeting_name: str = "AI定例") -> Optional[str]:
        """
        Find a meeting containing the specified name.

        Args:
            meeting_name: Name to search for in meeting titles

        Returns:
            Meeting URL if found, None otherwise
        """
        print(f"Searching for meeting containing: {meeting_name}")

        self.driver.get("https://tldv.io/app/meetings")
        time.sleep(5)

        try:
            # Find all meeting links
            links = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/app/meetings/']")

            for link in links:
                try:
                    href = link.get_attribute("href") or ""
                    if "/app/meetings/" in href:
                        meeting_id = href.split("/")[-1]
                        if len(meeting_id) < 10:
                            continue

                        text = link.text.strip()
                        if meeting_name in text:
                            print(f"Found matching meeting: {text}")
                            return href
                except Exception:
                    continue

        except Exception as e:
            print(f"Error finding meeting: {e}")

        print(f"No meeting found containing: {meeting_name}")
        return None

    def _extract_transcript(self) -> Optional[str]:
        """Extract transcript from current meeting page."""
        # Click transcript tab
        transcript_tabs = [
            "//button[contains(text(), 'Transcript')]",
            "//button[contains(text(), '文字起こし')]",
            "//*[contains(@data-testid, 'transcript')]",
        ]

        for xpath in transcript_tabs:
            try:
                tab = self.driver.find_element(By.XPATH, xpath)
                if tab.is_displayed():
                    tab.click()
                    time.sleep(2)
                    break
            except NoSuchElementException:
                continue

        # Extract transcript text
        transcript_selectors = [
            "[data-testid='transcript']",
            "[data-testid='transcript-container']",
            "[class*='transcript']",
            "[class*='Transcript']",
            "div[class*='transcription']",
        ]

        for selector in transcript_selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.is_displayed():
                    text = element.text
                    if text and len(text) > 50:
                        return text
            except NoSuchElementException:
                continue

        # Fallback: get main content
        try:
            main = self.driver.find_element(By.CSS_SELECTOR, "main, [role='main']")
            return main.text
        except NoSuchElementException:
            pass

        return None

    def _save_debug_screenshot(self, name: str) -> None:
        """Save screenshot for debugging."""
        try:
            output_dir = Path(__file__).parent.parent / "output"
            output_dir.mkdir(exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = output_dir / f"tldv_debug_{name}_{timestamp}.png"
            self.driver.save_screenshot(str(filepath))
            print(f"Debug screenshot saved to {filepath}")
        except Exception as e:
            print(f"Failed to save screenshot: {e}")

    def get_transcript_from_url(self, meeting_url: str) -> Optional[str]:
        """Get transcript from a specific meeting URL."""
        try:
            self.driver = self._create_driver()

            if not self._is_logged_in():
                print("Session expired or not found.")
                if self.headless:
                    print("Please run with --login option to re-authenticate.")
                    return None
                else:
                    self.driver.get("https://tldv.io/app/signin")
                    if not self._wait_for_login():
                        print("Login failed or timed out.")
                        return None
                    self._save_cookies()

            if not meeting_url.startswith("http"):
                meeting_url = f"https://tldv.io/app/meetings/{meeting_url}"

            self.driver.get(meeting_url)
            time.sleep(5)

            return self._extract_transcript()

        except Exception as e:
            print(f"Error getting transcript: {e}")
            self._save_debug_screenshot("error")
            return None
        finally:
            if self.driver:
                self.driver.quit()

    def get_latest_transcript(self, meeting_id: Optional[str] = None,
                              meeting_name: Optional[str] = None) -> Optional[str]:
        """Get transcript from the latest or specified meeting."""
        try:
            self.driver = self._create_driver()

            if not self._is_logged_in():
                print("Session expired or not found. Login required...")

                if self.headless:
                    print("Please run with --login option to authenticate first.")
                    return None

                self.driver.get("https://tldv.io/app/signin")
                if not self._wait_for_login():
                    print("Login failed or timed out.")
                    return None

                self._save_cookies()
                print("Login successful. Session saved.")
            else:
                print("Using saved session.")

            # Find meeting
            if meeting_name:
                meeting_url = self.find_target_meeting(meeting_name)
                if meeting_url:
                    self.driver.get(meeting_url)
                    time.sleep(5)
                else:
                    print(f"Could not find meeting: {meeting_name}")
                    return None
            elif meeting_id:
                self.driver.get(f"https://tldv.io/app/meetings/{meeting_id}")
                time.sleep(5)
            else:
                # Get first meeting
                self.driver.get("https://tldv.io/app/meetings")
                time.sleep(5)

                links = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/app/meetings/']")
                for link in links:
                    href = link.get_attribute("href") or ""
                    if "/app/meetings/" in href and len(href.split("/")[-1]) > 10:
                        link.click()
                        time.sleep(5)
                        break

            return self._extract_transcript()

        except Exception as e:
            print(f"Error getting transcript: {e}")
            self._save_debug_screenshot("error")
            return None
        finally:
            if self.driver:
                self.driver.quit()

    def interactive_login(self) -> bool:
        """Perform interactive login with visible browser."""
        try:
            self.driver = self._create_driver(headless=False)
            self.driver.get("https://tldv.io/app/signin")

            print("\n" + "=" * 50)
            print("ブラウザが開きました。")
            print("Microsoft アカウントでログインしてください。")
            print("ログイン完了後、自動的にセッションを保存します。")
            print("=" * 50 + "\n")

            if self._wait_for_login(timeout=180):
                time.sleep(3)
                self._save_cookies()
                print("\n✅ ログイン成功！セッションを保存しました。")
                print(f"プロファイル保存先: {SESSION_DIR}")
                print("次回以降は自動的にログインされます。")
                return True
            else:
                print("\n❌ ログインに失敗しました。")
                return False

        except Exception as e:
            print(f"\n❌ ログインに失敗しました: {e}")
            return False
        finally:
            if self.driver:
                self.driver.quit()


def main():
    """Interactive setup for tldv scraper."""
    print("tldv Scraper - セットアップ")
    print("-" * 30)

    scraper = TldvScraper(headless=False)
    scraper.interactive_login()


if __name__ == "__main__":
    main()
