#!/bin/bash
# One-command script to generate meeting minutes from clipboard
# Usage: Copy transcript from tldv, then run ./run_minutes.sh [video_url]
#
# Note: This script is for terminal use only.
# When running from MeetingMinutes.app, the AppleScript handles clipboard
# directly because pbpaste doesn't work reliably in do shell script context.

set -e

# Load shell environment for pyenv
export PATH="$HOME/.pyenv/shims:$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)" 2>/dev/null || true

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check if clipboard has content
if ! pbpaste | grep -q .; then
    echo "Error: Clipboard is empty. Please copy the transcript first."
    echo ""
    echo "How to use:"
    echo "  1. Open tldv meeting"
    echo "  2. Click Transcript tab"
    echo "  3. Select all (Cmd+A) and copy (Cmd+C)"
    echo "  4. Run this script again"
    exit 1
fi

# Save transcript from clipboard
mkdir -p input
pbpaste > input/transcript.txt
echo "Transcript saved to input/transcript.txt"

# Ask for video URL if not provided as argument
VIDEO_URL="$1"
if [ -z "$VIDEO_URL" ]; then
    echo ""
    read -p "Enter video URL (or press Enter to skip): " VIDEO_URL
fi

# Run the main script
if [ -n "$VIDEO_URL" ]; then
    python src/main.py --file input/transcript.txt --video-url "$VIDEO_URL"
else
    python src/main.py --file input/transcript.txt
fi

echo "Done!"
