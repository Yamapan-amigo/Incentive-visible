# AI Meeting Minutes Automation System

tldv で録画した会議のトランスクリプトから、Claude API (Haiku) を使用して自動的に議事録を生成し、Teams チャンネルと OneNote に配信するシステム。

## 特徴

- **完全無料**: tldv Pro プラン + Claude Haiku API（月10回で約7.5円）
- **自動取得**: Playwright + Stealth で tldv からトランスクリプトを自動取得
- **AI議事録**: Claude Haiku で構造化された議事録を生成
- **自動配信**: Teams と OneNote に自動投稿
- **スケジュール実行**: macOS launchd で毎週火曜日 20:30 に自動実行

## システム構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                       自動化フロー                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [launchd] 毎週火曜日 20:30 にトリガー                               │
│       │                                                             │
│       ▼                                                             │
│  [Playwright + Stealth] 保存済みセッションで自動認証                 │
│       │  → tldv ミーティング一覧へ                                   │
│       │  → 「AI定例」を含むミーティングを検索                         │
│       │  → トランスクリプト取得                                      │
│       ▼                                                             │
│  [Claude Haiku API] ──► 議事録生成                                  │
│       │                                                             │
│       ▼                                                             │
│  [output/議事録_日付.md]                                            │
│       │                                                             │
│       ├──► Teams Workflows ──► チャンネル投稿（Adaptive Card）       │
│       │                                                             │
│       └──► OneNote (Graph API) ──► ページに追記                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## セットアップ

### 1. 依存パッケージのインストール

```bash
pip install -r requirements.txt
playwright install chromium
```

### 2. 環境変数の設定

```bash
cp .env.example .env
# .env を編集して各種APIキーを設定
```

### 3. 必要な認証情報

| 項目 | 取得元 |
|------|--------|
| ANTHROPIC_API_KEY | https://console.anthropic.com/ |
| TEAMS_WORKFLOW_WEBHOOK_URL | Teams Workflows で作成 |
| AZURE_TENANT_ID / AZURE_CLIENT_ID | Azure Portal アプリ登録（OneNote用） |

**注意**: tldv の認証情報は不要です。ブラウザセッションで管理します。

### 4. 初回ログイン（セッション保存）

```bash
python src/main.py --login
```

ブラウザが開くので、Microsoft アカウントでログインしてください。
セッションは `.playwright_profile/` に保存され、次回以降は自動的にログインされます。

## 使用方法

### 基本的な使い方

```bash
# 初回ログイン（セッション保存）
python src/main.py --login

# 「AI定例」ミーティングを自動検索して議事録作成
python src/main.py --auto

# 別のミーティング名で検索
python src/main.py --auto --meeting-name "週次定例"

# 特定のミーティングURLを指定
python src/main.py --url "https://tldv.io/app/meetings/abc123"

# ファイルから読み込み
python src/main.py --file input/transcript.md

# クリップボードから読み込み
python src/main.py --paste
```

### オプション

```bash
python src/main.py \
  --auto \                       # AI定例を自動検索
  --meeting-name "週次定例" \    # 検索するミーティング名
  --date "2026-02-11" \          # 日付を指定
  --participants "山中、田中" \  # 参加者を指定
  --skip-teams \                 # Teams投稿をスキップ
  --skip-onenote \               # OneNote保存をスキップ
  --verbose                      # 詳細ログを表示
```

### スケジュール実行の設定

毎週火曜日 20:30 に自動実行するよう設定できます。

```bash
# スケジュールをインストール
python src/setup_schedule.py --install

# 状態を確認
python src/setup_schedule.py --status

# テスト実行
python src/setup_schedule.py --test

# スケジュールを解除
python src/setup_schedule.py --uninstall
```

### 手動でのスケジュール管理

```bash
# スケジュールを即時実行
launchctl start com.ai-minutes.weekly

# スケジュールの状態確認
launchctl list | grep ai-minutes

# ログの確認
tail -f output/launchd.log
tail -f output/launchd_error.log
```

## セッション管理

### セッションの有効期間

セッションは12時間有効です。12時間を超えると再ログインが必要です。

```bash
# セッション期限切れ時
python src/main.py --login
```

### セッションの保存場所

- `.playwright_profile/` - ブラウザプロファイル（セッション含む）
- `.playwright_context.json` - レガシーセッション（互換性用）

## Teams Workflows 設定

Teams の Incoming Webhook は 2026年3月31日に廃止予定のため、Teams Workflows を使用します。

### 設定手順

1. Teams で対象チャンネルを開く
2. チャンネル名横の「⋯」→「ワークフロー」
3. 「Webhook 要求を受信したときにチャネルに投稿する」を選択
4. フロー名を入力（例：「AI議事録投稿」）
5. 作成後、表示される Webhook URL をコピー
6. `.env` の `TEAMS_WORKFLOW_WEBHOOK_URL` に設定

## OneNote 設定

### Azure AD アプリ登録

1. Azure Portal (https://portal.azure.com) にアクセス
2. 「Azure Active Directory」→「アプリの登録」
3. 「新規登録」でアプリを作成
   - 名前: 任意（例: AI Meeting Minutes）
   - サポートされるアカウント: 単一テナント
   - リダイレクトURI: パブリッククライアント → `http://localhost`
4. 「API のアクセス許可」→「Notes.ReadWrite」を追加
5. テナントID と クライアントID を `.env` に設定

### セクションID の取得

```bash
python src/onenote_writer.py
# 認証後、利用可能なセクション一覧が表示されます
```

## コスト

| 項目 | コスト |
|------|--------|
| Playwright | 無料（OSS） |
| playwright-stealth | 無料（OSS） |
| tl;dv Pro プラン | 既存契約 |
| Claude 3 Haiku API | 約0.75円/回 |
| Teams Workflows | 無料（M365に含まれる） |
| OneNote（Graph API） | 無料（M365に含まれる） |
| **月10回使用時の合計** | **約7.5円/月** |

## プロジェクト構造

```
03_Regular AI meeting minutes/
├── AI活用ミーティング_議事録プロンプト.md  # Claude APIプロンプト
├── README.md
├── .env.example
├── .gitignore
├── requirements.txt
├── com.ai-minutes.weekly.plist   # launchd テンプレート
├── src/
│   ├── __init__.py
│   ├── main.py                   # CLIエントリーポイント
│   ├── tldv_scraper.py           # Playwright でトランスクリプト取得
│   ├── setup_schedule.py         # スケジュール設定ヘルパー
│   ├── minutes_generator.py      # Claude API連携
│   ├── teams_poster.py           # Teams Workflows投稿
│   └── onenote_writer.py         # OneNote Graph API書き込み
├── input/                        # 手動入力用
├── output/                       # 生成された議事録・ログ
└── .playwright_profile/          # セッション保存（.gitignore）
```

## トラブルシューティング

### Playwright でログインできない / セッションが無効

```bash
# セッションを削除して再ログイン
rm -rf .playwright_profile/
python src/main.py --login
```

### 「AI定例」ミーティングが見つからない

- ミーティング名が正確か確認（部分一致で検索）
- tldv に最新のミーティングがアップロードされているか確認
- `--verbose` オプションで詳細ログを確認

### Teams に投稿できない

- Webhook URL が正しいか確認
- Power Automate でフローが有効か確認

### OneNote に接続できない

- `.msal_token_cache.json` を削除して再認証
- Azure AD でアプリの権限が正しいか確認

### スケジュールが動作しない

```bash
# 状態確認
python src/setup_schedule.py --status

# ログを確認
tail -f output/launchd.log
tail -f output/launchd_error.log

# 手動でテスト
python src/setup_schedule.py --test
```

## ライセンス

MIT License
