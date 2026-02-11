"""
Teams Workflows Poster

Posts meeting minutes to Microsoft Teams channel using Teams Workflows
(the replacement for Incoming Webhooks which is being deprecated).
"""

import os
from typing import Optional
import requests


class TeamsPoster:
    """Posts messages to Teams via Workflows webhook."""

    def __init__(self, webhook_url: Optional[str] = None):
        """
        Initialize the poster.

        Args:
            webhook_url: Teams Workflow webhook URL.
                        If not provided, uses TEAMS_WORKFLOW_WEBHOOK_URL env var.
        """
        self.webhook_url = webhook_url or os.getenv("TEAMS_WORKFLOW_WEBHOOK_URL")

    def post_text(self, message: str) -> bool:
        """
        Post a simple text message to Teams.

        Args:
            message: Plain text message to post

        Returns:
            True if successful, False otherwise
        """
        if not self.webhook_url:
            print("Error: No webhook URL configured")
            return False

        payload = {"text": message}

        try:
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            return response.status_code in [200, 202]
        except requests.RequestException as e:
            print(f"Error posting to Teams: {e}")
            return False

    def post_adaptive_card(
        self,
        title: str,
        content: str,
        date: Optional[str] = None,
        participants: Optional[str] = None,
    ) -> bool:
        """
        Post a rich Adaptive Card to Teams.

        Args:
            title: Card title
            content: Main content (markdown supported)
            date: Meeting date (optional)
            participants: Meeting participants (optional)

        Returns:
            True if successful, False otherwise
        """
        if not self.webhook_url:
            print("Error: No webhook URL configured")
            return False

        # Build card body
        body = [
            {
                "type": "TextBlock",
                "text": title,
                "weight": "bolder",
                "size": "large",
                "wrap": True
            }
        ]

        # Add metadata if provided
        if date or participants:
            facts = []
            if date:
                facts.append({"title": "日時", "value": date})
            if participants:
                facts.append({"title": "参加者", "value": participants})

            body.append({
                "type": "FactSet",
                "facts": facts
            })

        # Add main content
        body.append({
            "type": "TextBlock",
            "text": content,
            "wrap": True,
            "spacing": "medium"
        })

        # Construct adaptive card
        card = {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.4",
            "body": body
        }

        # Wrap in message format for Teams Workflows
        payload = {
            "type": "message",
            "attachments": [
                {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "content": card
                }
            ]
        }

        try:
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            return response.status_code in [200, 202]
        except requests.RequestException as e:
            print(f"Error posting Adaptive Card to Teams: {e}")
            return False

    def post_minutes(
        self,
        minutes: str,
        date: Optional[str] = None,
        participants: Optional[str] = None,
        use_adaptive_card: bool = True
    ) -> bool:
        """
        Post meeting minutes to Teams.

        Args:
            minutes: Full meeting minutes content (markdown)
            date: Meeting date
            participants: Meeting participants
            use_adaptive_card: If True, uses rich Adaptive Card format

        Returns:
            True if successful, False otherwise
        """
        title = "📋 AI活用ミーティング議事録"

        if use_adaptive_card:
            # Truncate content if too long for card
            max_length = 5000
            if len(minutes) > max_length:
                content = minutes[:max_length] + "\n\n...(続きはOneNoteを参照)"
            else:
                content = minutes

            return self.post_adaptive_card(
                title=title,
                content=content,
                date=date,
                participants=participants
            )
        else:
            # Simple text format
            message = f"**{title}**\n\n"
            if date:
                message += f"日時: {date}\n"
            if participants:
                message += f"参加者: {participants}\n"
            message += f"\n{minutes}"

            return self.post_text(message)


def main():
    """Test the Teams poster."""
    from dotenv import load_dotenv
    load_dotenv()

    poster = TeamsPoster()

    if not poster.webhook_url:
        print("Error: TEAMS_WORKFLOW_WEBHOOK_URL must be set in .env")
        return

    # Test with simple message
    print("Sending test message to Teams...")
    success = poster.post_text("🧪 テストメッセージ: AI議事録自動投稿システムからのテストです。")

    if success:
        print("✅ Test message sent successfully!")
    else:
        print("❌ Failed to send test message")


if __name__ == "__main__":
    main()
