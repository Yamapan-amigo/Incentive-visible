#!/bin/bash
# One-command script to generate meeting minutes from clipboard
# Usage: Copy transcript from tldv, then run ./run_minutes.sh

set -e

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

# Run the main script
python src/main.py --file input/transcript.txt

echo "Done!"
