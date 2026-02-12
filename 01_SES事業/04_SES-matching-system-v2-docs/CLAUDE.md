# CLAUDE.md — SES マッチングシステム MVP開発ガイド

## プロジェクト概要

SES事業における案件・人材マッチング自動化システム。日次約1,000通のメールと複数のマスターDBから案件・人材情報を自動抽出し、マッチングスコアを算出して担当者に提示する。

**開発体制:** 1名（Claude Code併用）
**MVP目標:** 社内利用で最低限動作するシステム
**将来目標:** 社内正式リリース → 外部展開（SaaS化）

---

## ドキュメント体系

| ファイル | 役割 | いつ参照するか |
|---------|------|-------------|
| **CLAUDE.md**（この文書） | 開発原則・コーディングガイド | **常時** — コードを書く前に確認 |
| **00_mvp_development_roadmap.md** | MVP実装の具体的手順書 | **実装時** — 次に何を作るか確認 |
| 01_system_architecture_v2_2.md | 全体構成・KPI・インフラ | アーキテクチャ判断時 |
| 02_dataflow_parser_v2_1.md | パーサー詳細仕様 | Phase 2 パーサー実装時 |
| 03_db_schema_v2_1.md | テーブル定義・SQL | Phase 1 DB構築時 |
| 04_api_design_v2_1.md | APIエンドポイント仕様 | API実装時 |
| 05_privacy_policy_v1_0.md | 個人情報方針 | 運用・外部展開時 |

**実装の進め方:** `00_mvp_development_roadmap.md` のStep順に進める。各Stepに参照すべき設計書セクションが記載されている。

---

## 技術スタック

| 層 | 技術 | デプロイ先 |
|----|------|-----------|
| Frontend | Next.js (App Router, TypeScript) | Vercel（無料枠） |
| Backend | Python FastAPI + Docker | Render（Starter $7/月） |
| Database | PostgreSQL | Supabase（Free → Pro） |
| AI | Claude Haiku | Anthropic API |
| Email | SendGrid Inbound Parse | Webhook |
| Batch | APScheduler（FastAPI内蔵） | Render（同一コンテナ） |
| External Data | Google Sheets/Docs/Drive API | Google Cloud |

---

## MVP スコープ（Phase 1〜4a / 実装するもの）

> 各Phaseの具体的な実装手順は `00_mvp_development_roadmap.md` を参照

### Phase 1: 基盤構築
- Supabaseプロジェクト作成、全テーブルのマイグレーション
- RLS（Row Level Security）ポリシー設定
- FastAPIプロジェクト構成、Docker化
- Supabase Auth設定（JWT認証）
- SendGrid Inbound Parse Webhook受信エンドポイント
- email_processing_queue による非同期処理基盤

### Phase 2: データ抽出・分析
- メール分類（案件/人材/その他）— Claude API使用
- 構造化データ抽出（スキル、単価、稼働条件等）
- 添付ファイル処理（Excel, Word, PDF）
- マスターDB同期（2層パーサー: Layer 0 アダプター + Layer 1 共通パーサー）
- フォーマット変更検知（ヘッダー未検出、レコード数急減、必須フィールド欠落率）

### Phase 3: マッチングエンジン
- **差分マッチング方式を採用**（新規案件/人材登録時にトリガー）
- スコアリングアルゴリズム（スキル適合度、単価範囲、稼働条件、勤務地）
- マッチング結果の保存と状態管理（suggested → proposed → accepted/rejected）
- 名寄せグループ化（類似度スコアによる候補提示）

### Phase 4a: 管理画面（MVP 3画面）
- 案件管理画面（一覧・詳細・ステータス管理）
- 人材管理画面（一覧・詳細・名寄せ確認）
- マッチング結果画面（スコア表示・ステータス変更・理由表示）

---

## MVP で明示的に見送る項目（実装しないこと）

以下は設計書に記載があるが、MVP段階では意図的に実装しない。将来の外部展開フェーズで対応する。

### 1. RBAC（ロールベースアクセス制御）
- **理由:** 社内利用では管理者1名のみ。全権限ロール1つで運用する。
- **将来対応:** JWTにroleクレームを追加し、エンドポイント別に権限チェックするミドルウェアを実装。
- **今やること:** なし。ただしAPIエンドポイントは認証（JWT検証）は必須で実装する。

### 2. 汎用APIレート制限
- **理由:** 社内利用ではDDoSリスクが低い。
- **将来対応:** FastAPIミドルウェアでテナント別レート制限（例: 100req/min/tenant）を実装。
- **今やること:** 手動sync・手動matchのみ設計書記載のレート制限を実装。

### 3. ログ保持期間と自動削除バッチ
- **理由:** 初期はデータ量が限定的。パフォーマンス問題が顕在化するまで不要。
- **将来対応:** 個人情報取扱い方針書（05_privacy_policy_v1_0.md）に定義済みの保持期間に従い、定期削除バッチを実装。
- **今やること:** なし。テーブル設計にcreated_at/updated_atは含めておく（既に設計済み）。

### 4. 非機能要件の体系化（SLA、RPO/RTO等）
- **理由:** 社内MVPではSLA不要。
- **将来対応:** 外部展開時に非機能要件一覧を作成。
- **今やること:** なし。

### 5. 名寄せ閾値の分離・イニシャル照合の本格実装
- **理由:** 初期データで精度を検証してからチューニングする方が効率的。
- **将来対応:** 運用データ蓄積後、再送判定と名寄せの閾値を個別調整。pykakasi等によるイニシャル↔フルネーム照合を実装。
- **今やること:** 閾値はconfig/定数で定義し、コード内にハードコードしない。`initials_match_fullname`は常にFalse返却のスタブ実装とする。

### 6. セマフォによる同時実行数制限の修正
- **理由:** MVP段階では処理量が少なく問題が顕在化しにくい。
- **将来対応:** 負荷テスト実施後、セマフォ取得タイミングを_processメソッド内に移動。
- **今やること:** 設計書通りに実装（`asyncio.Semaphore(3)`）。問題発生時に修正。

### 7. Phase 4b 追加画面（4画面）
- マスターDB管理画面
- メール取込状況画面
- ログ閲覧画面
- エラー管理画面
- **今やること:** Phase 4aの3画面のみ実装。

---

## 開発ワークフロー

### Step Execution Protocol

Each Step from `00_mvp_development_roadmap.md` is treated as one Sprint.

**Starting a Step:**
1. Create a feature branch: `phase{N}/step-{N.M}-{short-description}`
2. Read the Step's section in the roadmap + all referenced design doc sections
3. List all checklist items as sub-tasks

**During a Step:**
- Work through sub-tasks in roadmap order
- Follow implementation order: DB → Models → Backend → Frontend → Verify → Commit
- Commit after each meaningful sub-task, not only at session end

**Completing a Step:**
1. Verify ALL checklist items from the roadmap
2. Run all existing tests
3. Manually verify the end-to-end flow
4. Update PROGRESS.md: mark Step completed, note any technical debt
5. Squash merge to main: `git merge --squash phase{N}/step-{N.M}-{description}`
6. Delete the feature branch
7. If last Step of a Phase → verify Phase completion checklist

**When Blocked:**
- Document the blocker in PROGRESS.md
- If external dependency (API key unavailable, etc.) → skip to next Step if possible, return later
- If design issue → update the relevant design doc with resolution
- Never leave a blocker undocumented

### 1セッション内の実装順序

各セッション（Claude Codeとの1回のやり取り）では以下の順序で実装する:

1. **DBスキーマ変更が必要な場合**: まず設計書（03_db_schema）を確認・更新方針を決定
2. **Types / Models**: Pydantic models (Backend) + TypeScript types (Frontend)
3. **Backend**: FastAPI エンドポイント + サービスロジック
4. **Frontend**: Next.js ページ + コンポーネント
5. **手動検証**: 実際にAPIを叩くか画面操作で動作確認
6. **コミット**: 動作するコードをセッション終了時にコミット

### 反復改善のルール

- 新機能を作る際に既存コードのリファクタリングが必要なら、同時に行ってよい
- 想定通りに動かない場合は、設計書の前提を見直して修正する
- 最初のパスで完璧を目指さない — **動くコード > 完璧なコード**

### Definition of Done (Per Step)

A Step is complete when ALL of the following are true:

1. All checklist items from the roadmap are verified
2. Code runs without errors (no import errors, no build errors)
3. Existing tests pass
4. New tests written for core logic (see Testing Protocol)
5. Manual verification of end-to-end flow succeeds
6. No secrets in committed code (.env in .gitignore, no API keys in source)
7. Code committed on feature branch
8. PROGRESS.md updated

For Phase-ending Steps (1.6, 2.7, 3.4, 4.3):
- Verify ALL Phase completion checklist items in this document
- Phase 2/3: evaluate Go/No-Go criteria before proceeding

### Testing Protocol

**When to write tests:**

| Trigger | Action |
|---------|--------|
| Scoring/matching logic (Step 3.1) | Unit tests BEFORE implementation (TDD) |
| AI classification (Step 2.2) | Tests with fixture data AFTER implementation |
| Parsers (Steps 2.3, 2.6) | Tests with sample input files AFTER implementation |
| Resend detection (Step 2.5) | Edge case tests AFTER implementation |
| Webhook flow (Step 1.4) | Integration test AFTER implementation |
| Any bug fix | Regression test BEFORE fixing |

**When NOT to write tests (MVP):**
- Frontend components (post-MVP)
- Config/scaffolding (Steps 1.1, 1.3, 1.5)
- Deployment (Step 1.6)
- E2E tests (post-MVP)

**Test location:** `backend/tests/` mirroring `app/` structure
**Test runner:** `pytest` with `pytest-asyncio`

### 設計書の生きたドキュメント運用

- 設計書（01〜05）は固定仕様ではなく、実装過程で更新する前提
- DBスキーマ変更やAPI仕様変更が発生したら、該当する設計書も更新する
- ただし設計書の更新は軽量に — 変更箇所のみ修正し、大規模な書き直しはしない
- When updating a design doc, increment the minor version (e.g., v2.1 → v2.2) and add a line to the revision history

---

## Git Workflow

### Branching Strategy

- `main` — always deployable. No direct commits after Step 1.1.
- `phase{N}/step-{N.M}-{short-description}` — one branch per Step
- Squash merge to main after Step completion
- Delete branch after merge

### Commit Conventions

Conventional Commits format:
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Scopes: `db`, `api`, `webhook`, `auth`, `ai`, `parser`, `matching`, `frontend`, `config`, `deploy`
- Example: `feat(webhook): add SendGrid email reception endpoint`

### Commit Frequency

- Commit after each sub-task passes verification
- Never leave a session without committing working code
- If code is broken at session end, stash and document in PROGRESS.md

---

## Session Protocol

### Session Start

1. Check `git status` and current branch
2. Read PROGRESS.md for continuity context
3. Confirm which Step is in progress (from roadmap)
4. Verify dev environment is running (`docker compose ps`)
5. State what will be done this session before writing code

### Session End

1. Commit all working code
2. Update PROGRESS.md with: completed items, remaining items, blockers, decisions
3. Run tests if test suite exists

### PROGRESS.md Format

Maintain `PROGRESS.md` in project root with:
- Current Phase/Step and branch name
- What was completed this session
- Remaining sub-tasks (checklist)
- Blockers (if any)
- Decisions/deviations from design docs
- Technical debt items (with target Step for resolution)

---

## 開発原則

### アーキテクチャ原則
1. **マルチテナント設計は最初から組み込む** — 全テーブルにtenant_id。RLSポリシー設定。メールアドレスプレフィックスでテナント判定。これは外部展開の基盤なので省略しない。
2. **ソフトデリートは全エンティティに適用** — deleted_atカラム + 部分インデックス（WHERE deleted_at IS NULL）。
3. **設定値はハードコードしない** — 閾値、リトライ回数、バッチサイズ等は環境変数またはconfigファイルで管理。
4. **Docker化を前提とする** — ローカル開発もDocker Compose。Render以外への移行を容易にする。

### コード品質
1. **型ヒントを必ず使う** — Python: type hints + Pydantic models。TypeScript: strict mode。
2. **エラーハンドリングは明示的に** — 例外を握りつぶさない。処理キューのfailed状態にはerror_messageを必ず記録。
3. **ログは構造化ログ** — JSON形式。tenant_id, email_id, process_step等のコンテキスト情報を含める。
4. **テストは段階的に追加** — 初期はAI分類・マッチングスコア算出等のコアロジックのユニットテストを優先。E2Eは後回し。

### AI API利用
1. **Phase A方式（1モデル）で開始** — 分類と抽出を1回のAPIコールで実行。
2. **プロンプトはコードから分離** — テンプレートファイルまたは定数モジュールで管理。チューニングしやすくする。
3. **APIレスポンスは必ずバリデーション** — Pydantic modelでパース。パース失敗時はエラーキューに投入。
4. **confidence値を必ず記録** — 後のPhase B/C判断に使うため、全AI処理結果にconfidence値を保存。

### データベース操作
1. **Supabase Python Client（supabase-py）を使用** — 直接SQLは避ける（RLSバイパスのリスク）。
2. **バルク操作時はトランザクションを使用** — マスターDB同期時の全件更新等。
3. **外部キー制約がない箇所（source_idのポリモーフィックFK）はアプリ層でバリデーション** — INSERT/UPDATE時にsource_id実在チェックを行う。

### Secret Management

1. **Never commit secrets** — .env, credential files, API keys must never appear in git history
2. **.gitignore must include**: `.env`, `.env.*` (except `.env.example`), `credentials/`, service account JSONs
3. **.env.example required** — in project root and `backend/`, with all variable names and placeholder values
4. **Fail fast on missing config** — `config.py` must raise clear errors if required env vars are missing
5. **Document new env vars immediately** — update `.env.example` in the same commit that adds the variable

---

## ディレクトリ構成（推奨）

```
project-root/
├── CLAUDE.md                     # この文書
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py               # FastAPIアプリケーション
│   │   ├── config.py             # 環境変数・設定値管理
│   │   ├── auth/                 # Supabase Auth関連
│   │   ├── api/
│   │   │   ├── webhooks/         # SendGrid Webhook受信
│   │   │   ├── projects/         # 案件API
│   │   │   ├── talents/          # 人材API
│   │   │   ├── matching/         # マッチングAPI
│   │   │   └── sync/             # マスターDB同期API
│   │   ├── services/
│   │   │   ├── email_processor.py
│   │   │   ├── ai_analyzer.py    # Claude API呼び出し
│   │   │   ├── matching_engine.py
│   │   │   ├── master_db_sync.py
│   │   │   └── name_resolver.py  # 名寄せ
│   │   ├── parsers/
│   │   │   ├── layer0/           # フォーマット別アダプター
│   │   │   └── layer1/           # 共通パーサー
│   │   ├── models/               # Pydantic models
│   │   ├── db/                   # Supabaseクライアント・クエリ
│   │   ├── queue/                # 処理キューワーカー
│   │   ├── prompts/              # AIプロンプトテンプレート
│   │   └── utils/
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── projects/
│   │   │   ├── talents/
│   │   │   └── matching/
│   │   ├── components/
│   │   └── lib/                  # Supabase client, API client
│   └── tests/
├── supabase/
│   └── migrations/               # SQLマイグレーションファイル
└── docs/
    ├── 01_system_architecture_v2_2.md
    ├── 02_dataflow_parser_v2_1.md
    ├── 03_db_schema_v2_1.md
    ├── 04_api_design_v2_1.md
    └── 05_privacy_policy_v1_0.md
```

---

## マッチング実行仕様（差分マッチング）

### トリガー条件
- **新規人材登録時:** 登録された人材を、全アクティブ案件（status = 'open'）に対してマッチング
- **新規案件登録時:** 登録された案件を、全アクティブ人材（status = 'available'）に対してマッチング
- **手動トリガー:** 管理画面から特定の案件/人材に対して再マッチング実行可能

### 処理フロー
1. トリガーイベント発生（INSERT後のサービス層呼び出し）
2. 対象のアクティブな案件/人材リストを取得
3. 各ペアに対してスコア算出
4. 閾値以上のペアのみ`matching_results`に保存（status = 'suggested'）
5. 担当者が管理画面で確認・ステータス変更

### 制約事項
- 全件再マッチングは手動トリガーのみ（バッチ実行）
- 差分マッチングではdeletedされた人材/案件は対象外（WHERE deleted_at IS NULL）

---

## 設計書参照先

実装手順は `00_mvp_development_roadmap.md` に従う。各Stepの詳細仕様は以下を参照:

| 文書 | 参照するPhase/Step |
|------|-------------------|
| `00_mvp_development_roadmap.md` | **全Phase** — 実装の順番・手順・チェックリスト |
| `01_system_architecture_v2_2.md` | Phase 1（インフラ構成）、Phase 2-3（KPI・Go/No-Go判定基準） |
| `02_dataflow_parser_v2_1.md` | Phase 2（Step 2.2〜2.6: パーサー・AI解析・名寄せ） |
| `03_db_schema_v2_1.md` | Phase 1（Step 1.2: DB構築 — SQL全文あり） |
| `04_api_design_v2_1.md` | Phase 1〜4a（APIエンドポイント仕様・認証設計） |
| `05_privacy_policy_v1_0.md` | 運用開始時・外部展開時 |

---

## 開発フェーズ別チェックリスト

### Phase 1 完了条件
- [ ] Supabase全テーブル作成完了（マイグレーション実行可能）
- [ ] RLSポリシー設定完了
- [ ] FastAPI起動、ヘルスチェックエンドポイント疎通
- [ ] SendGrid Webhook受信 → emails テーブル保存 → queue投入の一連動作確認
- [ ] Docker Compose でローカル開発環境構築完了
- [ ] Render デプロイ完了

### Phase 2 完了条件（Go/No-Go判定あり）
- [ ] メール分類精度 95%以上（テストデータ100通）
- [ ] 構造化データ抽出が主要フィールド（スキル、単価、稼働時期）で動作
- [ ] マスターDB同期（最低1フォーマット）が動作
- [ ] フォーマット変更検知が動作（ヘッダー未検出でCRITICALアラート）

### Phase 3 完了条件（Go/No-Go判定あり）
- [ ] 差分マッチングが新規登録時にトリガーされる
- [ ] マッチングスコアが算出され、matching_resultsに保存される
- [ ] 名寄せ候補が検出される（閾値0.8）
- [ ] 手動再マッチングが動作

### Phase 4a 完了条件
- [ ] 案件管理画面: 一覧表示、詳細表示、ステータス変更
- [ ] 人材管理画面: 一覧表示、詳細表示、名寄せグループ確認
- [ ] マッチング結果画面: スコア表示、ステータス変更、マッチング理由表示
- [ ] 全画面でJWT認証が動作
