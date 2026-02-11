"""
OneNote Writer using Microsoft Graph API

Appends meeting minutes to a OneNote page using delegated authentication.
Uses MSAL for device code flow authentication.
"""

import json
import os
from pathlib import Path
from typing import Optional
import requests
import msal

# Token cache file
TOKEN_CACHE_FILE = Path(__file__).parent.parent / ".msal_token_cache.json"

# Required Graph API scopes
SCOPES = ["Notes.ReadWrite.All", "Sites.Read.All"]


class OneNoteWriter:
    """Writes content to OneNote via Graph API."""

    def __init__(
        self,
        tenant_id: Optional[str] = None,
        client_id: Optional[str] = None,
        notebook_id: Optional[str] = None,
        section_id: Optional[str] = None,
        sharepoint_site_host: Optional[str] = None,
    ):
        """
        Initialize the writer.

        Args:
            tenant_id: Azure AD tenant ID
            client_id: Azure AD application client ID
            notebook_id: OneNote notebook ID
            section_id: OneNote section ID
            sharepoint_site_host: SharePoint site host for shared notebooks
        """
        self.tenant_id = tenant_id or os.getenv("AZURE_TENANT_ID")
        self.client_id = client_id or os.getenv("AZURE_CLIENT_ID")
        self.notebook_id = notebook_id or os.getenv("ONENOTE_NOTEBOOK_ID")
        self.section_id = section_id or os.getenv("ONENOTE_SECTION_ID")
        self.sharepoint_site_host = sharepoint_site_host or os.getenv("SHAREPOINT_SITE_HOST")
        self.site_id = None
        self.access_token = None
        self._app = None

    def _get_msal_app(self) -> msal.PublicClientApplication:
        """Get or create MSAL application."""
        if self._app is None:
            cache = msal.SerializableTokenCache()

            # Load existing cache if available
            if TOKEN_CACHE_FILE.exists():
                cache.deserialize(TOKEN_CACHE_FILE.read_text())

            self._app = msal.PublicClientApplication(
                self.client_id,
                authority=f"https://login.microsoftonline.com/{self.tenant_id}",
                token_cache=cache
            )

        return self._app

    def _save_cache(self) -> None:
        """Save token cache to file."""
        if self._app and self._app.token_cache.has_state_changed:
            TOKEN_CACHE_FILE.write_text(
                self._app.token_cache.serialize()
            )

    def authenticate(self) -> bool:
        """
        Authenticate using device code flow.

        Returns:
            True if successful, False otherwise
        """
        if not self.tenant_id or not self.client_id:
            print("Error: Azure credentials not configured")
            return False

        app = self._get_msal_app()

        # Try to get token from cache first
        accounts = app.get_accounts()
        if accounts:
            result = app.acquire_token_silent(SCOPES, account=accounts[0])
            if result and "access_token" in result:
                self.access_token = result["access_token"]
                self._save_cache()
                self._get_site_id()
                return True

        # If no cached token, use device code flow
        flow = app.initiate_device_flow(scopes=SCOPES)

        if "user_code" not in flow:
            print(f"Failed to create device flow: {flow.get('error')}")
            return False

        print(flow["message"])  # Shows URL and code for user

        # Wait for user to complete authentication
        result = app.acquire_token_by_device_flow(flow)

        if "access_token" in result:
            self.access_token = result["access_token"]
            self._save_cache()
            self._get_site_id()
            return True

        print(f"Authentication failed: {result.get('error_description')}")
        return False

    def _get_site_id(self) -> None:
        """Get SharePoint site ID if using shared notebook."""
        if not self.sharepoint_site_host:
            return

        try:
            response = requests.get(
                f"https://graph.microsoft.com/v1.0/sites/{self.sharepoint_site_host}:/",
                headers={"Authorization": f"Bearer {self.access_token}"},
                timeout=30
            )
            if response.status_code == 200:
                self.site_id = response.json()["id"]
        except requests.RequestException:
            pass

    def _markdown_to_html(self, markdown: str) -> str:
        """
        Convert markdown to basic HTML for OneNote.

        Args:
            markdown: Markdown content

        Returns:
            HTML string
        """
        import re

        html = markdown

        # Headers
        html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        html = re.sub(r'^■ (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)

        # Bold
        html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)

        # Italic
        html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)

        # Lists
        lines = html.split('\n')
        result_lines = []
        in_list = False

        for line in lines:
            if line.startswith('- '):
                if not in_list:
                    result_lines.append('<ul>')
                    in_list = True
                result_lines.append(f'<li>{line[2:]}</li>')
            else:
                if in_list:
                    result_lines.append('</ul>')
                    in_list = False
                result_lines.append(line)

        if in_list:
            result_lines.append('</ul>')

        html = '\n'.join(result_lines)

        # Paragraphs (simple approach)
        html = re.sub(r'\n\n', '</p><p>', html)
        html = f'<p>{html}</p>'

        # Clean up empty paragraphs
        html = re.sub(r'<p>\s*</p>', '', html)
        html = re.sub(r'<p>(<h[123]>)', r'\1', html)
        html = re.sub(r'(</h[123]>)</p>', r'\1', html)
        html = re.sub(r'<p>(<ul>)', r'\1', html)
        html = re.sub(r'(</ul>)</p>', r'\1', html)

        return html

    def create_page(
        self,
        title: str,
        content: str,
        section_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Create a new page in OneNote.

        Args:
            title: Page title
            content: Page content (markdown will be converted to HTML)
            section_id: Section ID (uses default if not provided)

        Returns:
            Page ID if successful, None otherwise
        """
        if not self.access_token:
            if not self.authenticate():
                return None

        section = section_id or self.section_id
        if not section:
            print("Error: No section ID configured")
            return None

        # Use SharePoint site endpoint for shared notebooks
        if self.site_id:
            url = f"https://graph.microsoft.com/v1.0/sites/{self.site_id}/onenote/sections/{section}/pages"
        else:
            url = f"https://graph.microsoft.com/v1.0/me/onenote/sections/{section}/pages"

        html_content = self._markdown_to_html(content)

        # OneNote page HTML format
        page_html = f"""
<!DOCTYPE html>
<html>
<head>
<title>{title}</title>
</head>
<body>
{html_content}
</body>
</html>
"""

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/xhtml+xml"
        }

        try:
            response = requests.post(url, headers=headers, data=page_html.encode('utf-8'), timeout=30)

            if response.status_code == 201:
                page_data = response.json()
                return page_data.get("id")
            else:
                print(f"Failed to create page: {response.status_code} - {response.text}")
                return None

        except requests.RequestException as e:
            print(f"Error creating OneNote page: {e}")
            return None

    def append_to_page(
        self,
        page_id: str,
        content: str
    ) -> bool:
        """
        Append content to an existing OneNote page.

        Args:
            page_id: The page ID to append to
            content: Content to append (markdown will be converted to HTML)

        Returns:
            True if successful, False otherwise
        """
        if not self.access_token:
            if not self.authenticate():
                return False

        url = f"https://graph.microsoft.com/v1.0/me/onenote/pages/{page_id}/content"

        html_content = self._markdown_to_html(content)

        # PATCH request body for appending
        patch_data = [
            {
                "target": "body",
                "action": "append",
                "content": html_content
            }
        ]

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.patch(url, headers=headers, json=patch_data, timeout=30)
            return response.status_code == 204

        except requests.RequestException as e:
            print(f"Error appending to OneNote page: {e}")
            return False

    def get_sections(self, notebook_id: Optional[str] = None) -> list[dict]:
        """
        Get list of sections in a notebook.

        Args:
            notebook_id: Notebook ID (uses default if not provided)

        Returns:
            List of section dictionaries
        """
        if not self.access_token:
            if not self.authenticate():
                return []

        nb_id = notebook_id or self.notebook_id
        if not nb_id:
            # Get all notebooks and their sections
            url = "https://graph.microsoft.com/v1.0/me/onenote/sections"
        else:
            url = f"https://graph.microsoft.com/v1.0/me/onenote/notebooks/{nb_id}/sections"

        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }

        try:
            response = requests.get(url, headers=headers, timeout=30)

            if response.status_code == 200:
                return response.json().get("value", [])
            else:
                print(f"Failed to get sections: {response.status_code}")
                return []

        except requests.RequestException as e:
            print(f"Error getting sections: {e}")
            return []

    def get_pages(self, section_id: Optional[str] = None) -> list[dict]:
        """
        Get list of pages in a section.

        Args:
            section_id: Section ID (uses default if not provided)

        Returns:
            List of page dictionaries
        """
        if not self.access_token:
            if not self.authenticate():
                return []

        sec_id = section_id or self.section_id

        if not sec_id:
            url = "https://graph.microsoft.com/v1.0/me/onenote/pages"
        else:
            url = f"https://graph.microsoft.com/v1.0/me/onenote/sections/{sec_id}/pages"

        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }

        try:
            response = requests.get(url, headers=headers, timeout=30)

            if response.status_code == 200:
                return response.json().get("value", [])
            else:
                print(f"Failed to get pages: {response.status_code}")
                return []

        except requests.RequestException as e:
            print(f"Error getting pages: {e}")
            return []

    def write_minutes(
        self,
        minutes: str,
        date: str,
        create_new_page: bool = True,
        page_id: Optional[str] = None
    ) -> bool:
        """
        Write meeting minutes to OneNote.

        Args:
            minutes: The meeting minutes content
            date: Meeting date for the title
            create_new_page: If True, creates a new page. If False, appends to existing.
            page_id: Page ID to append to (required if create_new_page is False)

        Returns:
            True if successful, False otherwise
        """
        title = f"AI活用ミーティング議事録 - {date}"

        if create_new_page:
            page_id = self.create_page(title, minutes)
            return page_id is not None
        else:
            if not page_id:
                print("Error: page_id required when create_new_page is False")
                return False
            return self.append_to_page(page_id, f"\n\n---\n\n## {title}\n\n{minutes}")


def main():
    """Test the OneNote writer."""
    from dotenv import load_dotenv
    load_dotenv()

    writer = OneNoteWriter()

    if not writer.tenant_id or not writer.client_id:
        print("Error: Azure credentials must be set in .env")
        print("Required: AZURE_TENANT_ID, AZURE_CLIENT_ID")
        return

    print("Authenticating with Microsoft...")
    if writer.authenticate():
        print("✅ Authentication successful!")

        # List sections to find the right one
        print("\nAvailable sections:")
        sections = writer.get_sections()
        for section in sections:
            print(f"  - {section['displayName']}: {section['id']}")
    else:
        print("❌ Authentication failed")


if __name__ == "__main__":
    main()
