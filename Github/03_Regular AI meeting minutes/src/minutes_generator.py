"""
Meeting Minutes Generator using Claude API

Generates structured meeting minutes from transcripts using Claude Haiku
for cost-effective AI processing.
"""

import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from anthropic import Anthropic

# Load prompt template from file
PROMPT_TEMPLATE_FILE = Path(__file__).parent.parent / "AI活用ミーティング_議事録プロンプト.md"


class MinutesGenerator:
    """Generates meeting minutes using Claude API."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the generator.

        Args:
            api_key: Anthropic API key. If not provided, uses ANTHROPIC_API_KEY env var.
        """
        self.client = Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-3-haiku-20240307"  # Cost-effective model

    def _load_prompt_template(self) -> str:
        """Load the prompt template from file."""
        if PROMPT_TEMPLATE_FILE.exists():
            with open(PROMPT_TEMPLATE_FILE, "r", encoding="utf-8") as f:
                return f.read()
        else:
            # Fallback template if file not found
            return self._get_default_template()

    def _get_default_template(self) -> str:
        """Return default template if file not found."""
        return """あなたはAI活用推進チームの議事録担当です。
以下は社内のAI活用ミーティングの文字起こしです。
ゆるい雑談や雑感も含まれていますが、その中からAI活用に関する有益な情報を抽出し、チームメンバーが後から読んでも学びになる議事録を作成してください。

【基本情報】
- 日時：{date}
- 参加者：{participants}
- テーマ：AI活用についての情報共有・ディスカッション

【出力フォーマット】

■ 今回のハイライト（3行以内）
今回の話で一番おもしろかった・役立ちそうなポイントを端的にまとめる

■ 紹介されたAIツール・機能

| ツール/機能名 | 概要 | 活用シーン | 紹介者 |
|--------------|------|-----------|--------|
|              |      |           |        |

■ 議論・共有された内容
（トピックごとに整理。発言者名を明記し、以下の観点で分類する）
- 💡 気づき・発見：実際に使ってみて分かったこと
- 🔧 活用アイデア：「こういう使い方ができそう」という提案
- ⚠️ 課題・注意点：うまくいかなかったこと、注意すべき点
- ❓ 質問・疑問：出たけどまだ解決していない疑問

■ すぐ試せるアクション
（ミーティングの内容から、参加者が明日から試せる具体的なアクションを抽出）
- 誰が / 何を試す / どう始める

■ 参考リンク・リソース
（会話中に出てきたURL、ツール名、参考記事などをまとめる）

■ 次回に向けて
- 次回話したいテーマ・リクエスト
- 深掘りしたいトピック

【作成ルール】
- 堅くなりすぎず、読みやすいトーンで書く
- 雑談の中にある「実は有益な情報」も拾い上げる
- AIツールの正式名称が分かる場合は正確に記載する
- 「○○さんが実際に試した結果」など実体験ベースの情報は優先的に残す
- 専門用語には必要に応じて簡単な補足を（）で入れる
- 参加していなかったメンバーが読んでもキャッチアップできる内容にする

以下が文字起こしです：
---
{transcript}
---
"""

    def generate(
        self,
        transcript: str,
        date: Optional[str] = None,
        participants: Optional[str] = None,
        video_url: Optional[str] = None,
    ) -> str:
        """
        Generate meeting minutes from transcript.

        Args:
            transcript: The meeting transcript text
            date: Meeting date (optional, defaults to today)
            participants: Comma-separated list of participants (optional)
            video_url: Video recording URL (optional)

        Returns:
            Generated meeting minutes as markdown
        """
        # Prepare date
        if not date:
            date = datetime.now().strftime("%Y年%m月%d日")

        # Load and prepare prompt
        template = self._load_prompt_template()

        # Replace placeholders in template
        prompt = template.replace("（ここに貼り付け）", transcript)

        # If template has date/participants placeholders, replace them
        if "{date}" in prompt:
            prompt = prompt.replace("{date}", date)
        if "{participants}" in prompt:
            prompt = prompt.replace("{participants}", participants or "（自動検出）")
        if "{transcript}" in prompt:
            prompt = prompt.replace("{transcript}", transcript)
        if "{video_url}" in prompt:
            prompt = prompt.replace("{video_url}", video_url or "（未設定）")

        # Insert date info if not in template
        if "【基本情報】" in prompt and date:
            prompt = prompt.replace("- 日時：", f"- 日時：{date}")

        # Call Claude API
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return message.content[0].text

    def save_minutes(
        self,
        minutes: str,
        output_dir: Optional[Path] = None,
        date: Optional[str] = None,
    ) -> Path:
        """
        Save generated minutes to a file.

        Args:
            minutes: The generated minutes content
            output_dir: Directory to save to (default: output/)
            date: Date for filename (default: today)

        Returns:
            Path to the saved file
        """
        if output_dir is None:
            output_dir = Path(__file__).parent.parent / "output"

        output_dir.mkdir(parents=True, exist_ok=True)

        if not date:
            date = datetime.now().strftime("%Y%m%d")

        filename = f"議事録_{date}.md"
        filepath = output_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(minutes)

        return filepath


def main():
    """Test the minutes generator with sample input."""
    from dotenv import load_dotenv
    load_dotenv()

    # Check for API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY must be set in .env")
        return

    generator = MinutesGenerator()

    # Sample transcript for testing
    sample_transcript = """
山中: 今日はClaude Codeについて話したいんですが
田中: ああ、Anthropicのやつですね。私も最近使い始めました
山中: どう使ってます？
田中: コードレビューとか、テスト書くのに使ってますね。便利ですよ
山中: n8nと組み合わせてワークフロー自動化もできるらしいですね
田中: それいいですね！試してみたい
    """

    print("Generating minutes...")
    minutes = generator.generate(
        transcript=sample_transcript,
        date="2026年2月11日",
        participants="山中、田中"
    )

    print("\n--- Generated Minutes ---")
    print(minutes)
    print("--- End ---")


if __name__ == "__main__":
    main()
