#!/usr/bin/env python3
"""
Schedule Setup Helper for AI Meeting Minutes System

Manages macOS launchd configuration for scheduled execution.

Usage:
    python src/setup_schedule.py --install    # Install schedule (every Tuesday 20:30)
    python src/setup_schedule.py --uninstall  # Remove schedule
    python src/setup_schedule.py --test       # Test run the scheduled job
    python src/setup_schedule.py --status     # Check schedule status
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
SRC_DIR = PROJECT_ROOT / "src"
OUTPUT_DIR = PROJECT_ROOT / "output"

# launchd configuration
PLIST_LABEL = "com.ai-minutes.weekly"
PLIST_FILENAME = f"{PLIST_LABEL}.plist"
LAUNCH_AGENTS_DIR = Path.home() / "Library" / "LaunchAgents"
PLIST_TEMPLATE_PATH = PROJECT_ROOT / PLIST_FILENAME
PLIST_INSTALLED_PATH = LAUNCH_AGENTS_DIR / PLIST_FILENAME


def get_python_path() -> str:
    """Get the path to the Python interpreter."""
    # Check for virtual environment
    venv_python = PROJECT_ROOT / "venv" / "bin" / "python"
    if venv_python.exists():
        return str(venv_python)

    # Check for .venv
    venv_python = PROJECT_ROOT / ".venv" / "bin" / "python"
    if venv_python.exists():
        return str(venv_python)

    # Fall back to current Python
    return sys.executable


def generate_plist_content() -> str:
    """Generate the launchd plist XML content."""
    python_path = get_python_path()
    main_script = SRC_DIR / "main.py"
    log_path = OUTPUT_DIR / "launchd.log"
    error_log_path = OUTPUT_DIR / "launchd_error.log"

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(exist_ok=True)

    plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{PLIST_LABEL}</string>

    <key>ProgramArguments</key>
    <array>
        <string>{python_path}</string>
        <string>{main_script}</string>
        <string>--auto</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>2</integer>
        <key>Hour</key>
        <integer>20</integer>
        <key>Minute</key>
        <integer>30</integer>
    </dict>

    <key>WorkingDirectory</key>
    <string>{PROJECT_ROOT}</string>

    <key>StandardOutPath</key>
    <string>{log_path}</string>

    <key>StandardErrorPath</key>
    <string>{error_log_path}</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>

    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
"""
    return plist_content


def install_schedule() -> bool:
    """Install the launchd schedule."""
    print(f"Installing schedule: {PLIST_LABEL}")
    print(f"  Schedule: Every Tuesday at 20:30")
    print(f"  Python: {get_python_path()}")
    print(f"  Script: {SRC_DIR / 'main.py'}")

    # Ensure LaunchAgents directory exists
    LAUNCH_AGENTS_DIR.mkdir(parents=True, exist_ok=True)

    # Generate and write plist
    plist_content = generate_plist_content()

    # Also save template to project root
    with open(PLIST_TEMPLATE_PATH, "w") as f:
        f.write(plist_content)
    print(f"\nTemplate saved to: {PLIST_TEMPLATE_PATH}")

    # Copy to LaunchAgents
    with open(PLIST_INSTALLED_PATH, "w") as f:
        f.write(plist_content)
    print(f"Installed to: {PLIST_INSTALLED_PATH}")

    # Unload if already loaded (ignore errors)
    subprocess.run(
        ["launchctl", "unload", str(PLIST_INSTALLED_PATH)],
        capture_output=True
    )

    # Load the plist
    result = subprocess.run(
        ["launchctl", "load", str(PLIST_INSTALLED_PATH)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"\nError loading schedule: {result.stderr}")
        return False

    print("\nSchedule installed successfully!")
    print("\nTo verify:")
    print(f"  launchctl list | grep {PLIST_LABEL}")
    print("\nTo test manually:")
    print(f"  launchctl start {PLIST_LABEL}")
    print("\nLogs will be written to:")
    print(f"  {OUTPUT_DIR / 'launchd.log'}")
    print(f"  {OUTPUT_DIR / 'launchd_error.log'}")

    return True


def uninstall_schedule() -> bool:
    """Uninstall the launchd schedule."""
    print(f"Uninstalling schedule: {PLIST_LABEL}")

    if not PLIST_INSTALLED_PATH.exists():
        print("Schedule not installed.")
        return True

    # Unload the plist
    result = subprocess.run(
        ["launchctl", "unload", str(PLIST_INSTALLED_PATH)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"Warning: Could not unload (may not be running): {result.stderr}")

    # Remove the plist file
    try:
        PLIST_INSTALLED_PATH.unlink()
        print(f"Removed: {PLIST_INSTALLED_PATH}")
    except OSError as e:
        print(f"Error removing plist: {e}")
        return False

    print("\nSchedule uninstalled successfully!")
    return True


def test_schedule() -> bool:
    """Test run the scheduled job."""
    print("Testing scheduled job...")
    print("This will run: python src/main.py --auto --skip-teams --skip-onenote")
    print("-" * 50)

    result = subprocess.run(
        [get_python_path(), str(SRC_DIR / "main.py"),
         "--auto", "--skip-teams", "--skip-onenote", "--verbose"],
        cwd=str(PROJECT_ROOT)
    )

    return result.returncode == 0


def check_status() -> None:
    """Check the status of the scheduled job."""
    print(f"Checking status of: {PLIST_LABEL}")
    print("-" * 50)

    # Check if plist exists
    if PLIST_INSTALLED_PATH.exists():
        print(f"Plist installed: {PLIST_INSTALLED_PATH}")
    else:
        print("Plist not installed.")
        return

    # Check launchctl
    result = subprocess.run(
        ["launchctl", "list"],
        capture_output=True,
        text=True
    )

    if PLIST_LABEL in result.stdout:
        print(f"Status: LOADED")
        # Get more details
        for line in result.stdout.split("\n"):
            if PLIST_LABEL in line:
                print(f"  {line}")
    else:
        print("Status: NOT LOADED")

    # Check log files
    log_path = OUTPUT_DIR / "launchd.log"
    error_log_path = OUTPUT_DIR / "launchd_error.log"

    print(f"\nLog files:")
    if log_path.exists():
        size = log_path.stat().st_size
        print(f"  Output log: {log_path} ({size} bytes)")
    else:
        print(f"  Output log: Not created yet")

    if error_log_path.exists():
        size = error_log_path.stat().st_size
        print(f"  Error log: {error_log_path} ({size} bytes)")
    else:
        print(f"  Error log: Not created yet")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Schedule Setup Helper for AI Meeting Minutes System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Install schedule (every Tuesday 20:30)
    python src/setup_schedule.py --install

    # Check status
    python src/setup_schedule.py --status

    # Test run
    python src/setup_schedule.py --test

    # Uninstall
    python src/setup_schedule.py --uninstall

Manual launchctl commands:
    # Start immediately
    launchctl start com.ai-minutes.weekly

    # Check if loaded
    launchctl list | grep ai-minutes
        """
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="Install the schedule"
    )
    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="Uninstall the schedule"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Test run the scheduled job"
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Check schedule status"
    )

    args = parser.parse_args()

    if args.install:
        success = install_schedule()
        sys.exit(0 if success else 1)
    elif args.uninstall:
        success = uninstall_schedule()
        sys.exit(0 if success else 1)
    elif args.test:
        success = test_schedule()
        sys.exit(0 if success else 1)
    elif args.status:
        check_status()
        sys.exit(0)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
