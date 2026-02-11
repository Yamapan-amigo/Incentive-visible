#!/usr/bin/env python3
"""
AI Meeting Minutes Automation System

Automatically generates meeting minutes from tldv transcripts using Claude API,
then distributes to Teams and OneNote.

Usage:
    python src/main.py --login                   # Initial login (browser opens)
    python src/main.py --auto                    # Auto-fetch "AI定例" meeting
    python src/main.py --auto --meeting-name "週次定例"  # Custom meeting name
    python src/main.py --file input/sample.md   # From file
    python src/main.py --paste                   # From clipboard
    python src/main.py --url https://tldv.io/app/meetings/abc123  # Specific URL
"""

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root (override=True to ensure our .env takes precedence)
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / ".env", override=True)

from tldv_scraper import TldvScraper
from minutes_generator import MinutesGenerator
from teams_poster import TeamsPoster
from onenote_writer import OneNoteWriter


def get_clipboard_content() -> str:
    """Get content from clipboard (macOS)."""
    import subprocess
    try:
        result = subprocess.run(
            ["pbpaste"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Could not read from clipboard")
        sys.exit(1)


def read_file_content(filepath: Path) -> str:
    """Read content from a file."""
    if not filepath.exists():
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


def do_login(verbose: bool = False) -> int:
    """Perform interactive login to save session."""
    print("Starting interactive login...")
    print("A browser window will open. Please log in with your Microsoft account.")

    scraper = TldvScraper(headless=False)
    if scraper.interactive_login():
        print("\n" + "=" * 50)
        print("Login successful! Session has been saved.")
        print("You can now run the script without --login.")
        print("=" * 50)
        return 0
    else:
        print("\nLogin failed. Please try again.")
        return 1


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="AI Meeting Minutes Automation System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Initial login (run once to save session)
    python src/main.py --login

    # Auto-fetch "AI定例" meeting and generate minutes
    python src/main.py --auto

    # Auto-fetch with custom meeting name
    python src/main.py --auto --meeting-name "週次定例"

    # From a specific tldv meeting URL
    python src/main.py --url https://tldv.io/app/meetings/abc123

    # From a specific tldv meeting ID
    python src/main.py --meeting-id abc123

    # From a transcript file
    python src/main.py --file input/transcript.md

    # From clipboard
    python src/main.py --paste

    # Generate only (no distribution)
    python src/main.py --auto --skip-teams --skip-onenote
        """
    )

    # Login option
    parser.add_argument(
        "--login",
        action="store_true",
        help="Open browser for interactive login (run once to save session)"
    )

    # Auto mode
    parser.add_argument(
        "--auto",
        action="store_true",
        help="Automatically find and process target meeting (default: 'AI定例')"
    )

    # Meeting name filter
    parser.add_argument(
        "--meeting-name",
        type=str,
        default="AI定例MTG",
        help="Meeting name to search for in auto mode (default: 'AI定例MTG')"
    )

    # Input source options (mutually exclusive)
    input_group = parser.add_mutually_exclusive_group()
    input_group.add_argument(
        "--file", "-f",
        type=Path,
        help="Read transcript from file"
    )
    input_group.add_argument(
        "--paste", "-p",
        action="store_true",
        help="Read transcript from clipboard"
    )
    input_group.add_argument(
        "--meeting-id", "-m",
        type=str,
        help="Fetch specific tldv meeting by ID"
    )
    input_group.add_argument(
        "--url",
        type=str,
        help="Fetch specific tldv meeting by full URL"
    )

    # Metadata options
    parser.add_argument(
        "--date", "-d",
        type=str,
        help="Meeting date (default: today)"
    )
    parser.add_argument(
        "--participants",
        type=str,
        help="Comma-separated list of participants"
    )
    parser.add_argument(
        "--video-url",
        type=str,
        help="Video recording URL to include in minutes"
    )

    # Output options
    parser.add_argument(
        "--skip-teams",
        action="store_true",
        help="Skip posting to Teams"
    )
    parser.add_argument(
        "--skip-onenote",
        action="store_true",
        help="Skip saving to OneNote"
    )
    parser.add_argument(
        "--skip-save",
        action="store_true",
        help="Skip saving to local file"
    )

    # tldv options
    parser.add_argument(
        "--headless",
        action="store_true",
        default=True,
        help="Run browser in headless mode (default: True)"
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Run browser with visible window"
    )

    # Misc options
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Generate minutes but don't distribute"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose output"
    )

    args = parser.parse_args()

    # Handle login mode
    if args.login:
        return do_login(args.verbose)

    # Determine headless mode
    headless = not args.no_headless

    # Get transcript
    transcript = None

    if args.file:
        if args.verbose:
            print(f"Reading transcript from file: {args.file}")
        transcript = read_file_content(args.file)

    elif args.paste:
        if args.verbose:
            print("Reading transcript from clipboard...")
        transcript = get_clipboard_content()

    elif args.url:
        if args.verbose:
            print(f"Fetching transcript from URL: {args.url}")
        scraper = TldvScraper(headless=headless)
        transcript = scraper.get_transcript_from_url(args.url)
        if not transcript:
            print("Error: Failed to fetch transcript from tldv")
            sys.exit(1)

    elif args.meeting_id:
        if args.verbose:
            print(f"Fetching transcript for meeting ID: {args.meeting_id}")
        scraper = TldvScraper(headless=headless)
        transcript = scraper.get_latest_transcript(meeting_id=args.meeting_id)
        if not transcript:
            print("Error: Failed to fetch transcript from tldv")
            sys.exit(1)

    elif args.auto:
        # Auto mode: search for meeting by name
        if args.verbose:
            print(f"Auto mode: searching for meeting '{args.meeting_name}'...")

        scraper = TldvScraper(headless=headless)
        transcript = scraper.get_latest_transcript(meeting_name=args.meeting_name)

        if not transcript:
            print(f"Error: Could not find or fetch meeting '{args.meeting_name}'")
            print("Hint: Run with --login first to set up session, or check meeting name.")
            sys.exit(1)

    else:
        # Default: try to fetch latest meeting
        if args.verbose:
            print("Fetching latest transcript from tldv...")

        scraper = TldvScraper(headless=headless)
        transcript = scraper.get_latest_transcript()

        if not transcript:
            print("Error: Failed to fetch transcript from tldv")
            print("Try one of these alternatives:")
            print("  --login       : Set up session first")
            print("  --auto        : Auto-find 'AI定例' meeting")
            print("  --file FILE   : Read from a file")
            print("  --paste       : Read from clipboard")
            sys.exit(1)

    if not transcript or not transcript.strip():
        print("Error: Empty transcript")
        sys.exit(1)

    if args.verbose:
        print(f"Transcript length: {len(transcript)} characters")

    # Prepare date
    date = args.date or datetime.now().strftime("%Y年%m月%d日")
    date_for_filename = args.date or datetime.now().strftime("%Y%m%d")

    # Generate minutes
    print("Generating meeting minutes with Claude Haiku...")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY must be set in .env")
        sys.exit(1)

    generator = MinutesGenerator(api_key)
    minutes = generator.generate(
        transcript=transcript,
        date=date,
        participants=args.participants,
        video_url=args.video_url
    )

    print("Minutes generated successfully!")

    if args.verbose:
        print("\n--- Generated Minutes Preview ---")
        preview = minutes[:500] + "..." if len(minutes) > 500 else minutes
        print(preview)
        print("--- End Preview ---\n")

    # Save to local file
    if not args.skip_save and not args.dry_run:
        output_path = generator.save_minutes(minutes, date=date_for_filename)
        print(f"Saved to: {output_path}")

    # Post to Teams
    if not args.skip_teams and not args.dry_run:
        webhook_url = os.getenv("TEAMS_WORKFLOW_WEBHOOK_URL")
        if webhook_url:
            print("Posting to Teams...")
            poster = TeamsPoster(webhook_url)
            if poster.post_minutes(minutes, date=date, participants=args.participants):
                print("Posted to Teams successfully!")
            else:
                print("Warning: Failed to post to Teams")
        else:
            print("Warning: Skipping Teams: TEAMS_WORKFLOW_WEBHOOK_URL not set")

    # Save to OneNote
    if not args.skip_onenote and not args.dry_run:
        tenant_id = os.getenv("AZURE_TENANT_ID")
        client_id = os.getenv("AZURE_CLIENT_ID")
        section_id = os.getenv("ONENOTE_SECTION_ID")

        if tenant_id and client_id:
            print("Saving to OneNote...")
            writer = OneNoteWriter(
                tenant_id=tenant_id,
                client_id=client_id,
                section_id=section_id
            )
            if writer.write_minutes(minutes, date=date):
                print("Saved to OneNote successfully!")
            else:
                print("Warning: Failed to save to OneNote")
        else:
            print("Warning: Skipping OneNote: Azure credentials not set")

    print("\nDone!")

    return 0


if __name__ == "__main__":
    sys.exit(main())
