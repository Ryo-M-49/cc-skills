---
name: cloudflare-deploy
description: Cloudflare Pages + Resend + Stripeを使ったデジタル商品のデプロイフロー
trigger: 新しいビジネスアイデアのデプロイ、LPの公開、メール配信セットアップ時
---

# デプロイスキル

デジタル商品を販売するための一連のインフラ構築手順。
環境変数はプロジェクトルートの .env に集約する。

## 前提ツール

- Cloudflare Pages（ホスティング）
- Cloudflare Pages Functions（Webhook処理）
- wrangler CLI（デプロイ）
- Stripe Payment Link（決済）
- Resend（メール配信）
- Stripe CLI（Webhook調査・管理）

## デプロイ手順

### 1. Cloudflare Pagesプロジェクト作成

```
CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx \
npx wrangler pages project create PROJECT_NAME
```

もしくはAPI経由:
```
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"PROJECT_NAME","production_branch":"main"}'
```

### 2. ファイル配置とデプロイ

デプロイ用の一時ディレクトリを作成し、公開ファイルを配置:
```
mkdir -p /tmp/{project}-deploy
cp index.html /tmp/{project}-deploy/
```

デプロイ実行:
```
CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx \
npx wrangler pages deploy /tmp/{project}-deploy --project-name=PROJECT_NAME --branch=main
```

公開URL: https://{project}.pages.dev

### 3. 標準ページ構成

デジタル商品販売サイトの標準構成:

| ファイル | 用途 | 備考 |
|---------|------|------|
| index.html | LP（販売ページ） | Stripe Payment Linkを埋め込み |
| thanks.html | サンクスページ | 決済後リダイレクト先。ダウンロードリンクは載せない（メールで配布）。メール届かない場合の案内を丁寧に |
| tokushoho.html | 特商法ページ | 法的に必須。デジタル商品は返品不可と明記 |
| unsubscribe.html | 配信停止ページ | ステップメール用 |
| free-xxx.pdf | 無料リード磁石 | メアド取得用の無料PDF。公開して問題ないもののみ |

有料商品のファイル（PDF等）はCloudflare Pagesの公開ディレクトリに置かない。メール添付で配布する。

### 4. Stripe連携

#### Payment Link作成
1. Stripeダッシュボード → 商品 → 商品を追加（名前、説明、価格を設定）
2. Payment Linkを作成（商品を選択）
3. 完了後リダイレクト先にサンクスページのURLを設定（例: https://{project}.pages.dev/thanks.html）
4. LP内のCTAボタンのhrefにPayment LinkのURLを設定
5. Payment Link ID（plink_xxxxx）を控えておく（Webhook側の商品フィルタで使う）

#### Webhook設定（購入後の自動メール送信）

**重要: Stripeは登録されたすべてのWebhookエンドポイントにイベントを送信する。**
同一Stripeアカウントで複数商品を運用している場合、他の商品の決済イベントも全エンドポイントに届く。
各Webhookハンドラで必ず `session.payment_link` をチェックし、自分のPayment Link IDと一致しない場合はスキップすること。

1. Webhook受信用のPages Functionsプロジェクトを作成（{project}-webhook）

ディレクトリ構成:
```
/tmp/{project}-webhook-deploy/
├── wrangler.toml           ← pages_build_output_dir = "./public"
├── public/
│   ├── index.html          ← ダミー
│   └── assets/
│       ├── guide.pdf       ← 有料PDF（Functionからfetchで取得。公開URLからは直接アクセス可能なので注意）
│       └── email.html      ← メールHTMLテンプレート
└── functions/
    └── webhook.js          ← Pages Function（POST /webhook を処理）
```

注意: `wrangler pages deploy <dir>` でディレクトリを直接指定すると functions/ が Pages Function としてコンパイルされない。
必ず `wrangler.toml` に `pages_build_output_dir` を設定し、プロジェクトルートから `wrangler pages deploy` を実行すること。

2. functions/webhook.js の実装:
   - `export async function onRequestPost(context)` でエクスポート
   - Stripe署名検証（crypto.subtleで HMAC-SHA256）
   - checkout.session.completed イベントのみ処理
   - **session.payment_link で商品フィルタ（env.STRIPE_PAYMENT_LINK_ID と照合）**
   - session.customer_details.email から購入者メールを取得
   - 同一オリジンの /assets/guide.pdf からPDFを取得してbase64エンコード
   - 同一オリジンの /assets/email.html からメールHTMLを取得
   - Resend APIでPDF添付の確認メールを送信
   - エラー時も200を返す（Stripeのリトライを防ぐ）

3. デプロイ:
   ```
   cd /tmp/{project}-webhook-deploy
   CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx npx wrangler pages deploy --project-name={project}-webhook --branch=main
   ```

4. Secretsを設定:
   ```
   echo "re_xxxxx" | CLOUDFLARE_API_TOKEN=xxx npx wrangler pages secret put RESEND_API_KEY --project-name={project}-webhook
   echo "whsec_xxxxx" | CLOUDFLARE_API_TOKEN=xxx npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name={project}-webhook
   echo "plink_xxxxx" | CLOUDFLARE_API_TOKEN=xxx npx wrangler pages secret put STRIPE_PAYMENT_LINK_ID --project-name={project}-webhook
   ```

5. 環境変数（plain text）を設定（Cloudflare Dashboard > Pages > Settings > Environment variables）:
   - FROM_EMAIL = guide@resend.dev（など）
   - FROM_NAME = 商品名

6. Stripeダッシュボード → 開発者 → Webhook → エンドポイントを追加:
   - URL: https://{project}-webhook.pages.dev/webhook
   - イベント: checkout.session.completed を選択

7. 作成後に表示される署名シークレット（whsec_xxxxx）をSecretに設定

8. 動作確認:
   ```
   curl -s -X POST https://{project}-webhook.pages.dev/webhook -H "Content-Type: application/json" -d '{"test":true}'
   ```
   200が返ればPages Functionとして動作している

#### テスト環境と本番環境の切り替え

Stripeのテスト環境と本番環境では以下が異なる:
- Payment Link ID（plink_xxxxx）
- Webhook Secret（whsec_xxxxx）
- APIキー

本番移行時は以下を差し替える:
1. Stripe Payment Linkを本番で作成し、LP内のURLを差し替え
2. Stripe Webhookを本番で作成し、新しいwhsec_xxxxxをSecretに設定
3. STRIPE_PAYMENT_LINK_IDを本番のplink_xxxxxに更新
4. .envの値を本番用に更新

#### Webhook調査・管理（Stripe CLI）

登録済みWebhookの確認:
```
stripe webhook_endpoints list
```

Webhookの有効化/無効化:
```
stripe webhook_endpoints update we_xxxxx --disabled
stripe webhook_endpoints update we_xxxxx --disabled=false
```

直近のイベント確認:
```
stripe events list --limit 5 --type checkout.session.completed
```

### 5. Resendメール配信

ファイル構成:
```
campaigns/resend-step-emails/
├── config.js          ← APIキー、送信元、URL設定
├── send-sequence.js   ← ステップメール配信（cron実行）
├── send-purchase-confirmation.js ← 購入確認メール手動送信（バックアップ用）
├── subscribers.json   ← 購読者リスト
├── package.json
└── emails/            ← HTMLメール
```

購入確認メール手動送信（Webhookが動かないときのバックアップ）:
```
node send-purchase-confirmation.js buyer@example.com
```

ステップメール配信（cron）:
```
node send-sequence.js
```

有料商品のPDFはResendのattachmentsで添付して送信する。

### 6. 環境変数（.envテンプレート）

新規プロジェクト作成時に以下をコピーして .env を作成:

```
# === Cloudflare Pages ===
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_PROJECT_NAME=

# === Resend ===
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=

# === Notion ===
NOTION_API_TOKEN=
NOTION_DATABASE_ID=

# === Stripe（テスト環境） ===
STRIPE_PAYMENT_LINK=
STRIPE_PAYMENT_LINK_ID=
STRIPE_WEBHOOK_SECRET=

# === Stripe（本番環境）===
# STRIPE_PAYMENT_LINK_PROD=
# STRIPE_PAYMENT_LINK_ID_PROD=
# STRIPE_WEBHOOK_SECRET_PROD=

# === 公開URL ===
LP_URL=
UNSUBSCRIBE_URL=
FREE_PDF_URL=
TOKUSHOHO_URL=

# === GA ===
GA_MEASUREMENT_ID=
```

### 7. 再デプロイ手順

ファイル変更後の再デプロイ:
1. ソースファイルを編集（.company/engineering/docs/ 内）
2. /tmp/{project}-deploy/ にコピー
3. wrangler pages deploy を実行

Webhook側の再デプロイ:
1. functions/webhook.js を編集
2. /tmp/{project}-webhook-deploy/ にコピー
3. wrangler.tomlがあるディレクトリで wrangler pages deploy を実行

### 8. GA（Google Analytics）追加

LP の <head> 内に以下を追加:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 9. 注意事項・ハマりどころ

- Stripeは全Webhookエンドポイントに全イベントを送信する。必ずWebhookハンドラ内で session.payment_link を照合して商品フィルタすること
- checkout.session.completed のペイロードに line_items は含まれない。商品の識別には payment_link を使う
- Pages Functionsのデプロイ時は wrangler.toml に pages_build_output_dir を設定し、ルートからデプロイする。ディレクトリ直接指定だとFunctionsがコンパイルされない
- 有料PDFを公開URLに置くとURLを知っていれば誰でもダウンロードできる。メール添付で配布するのが安全
- Cloudflare APIトークンにWorkers権限がない場合、Workers形式のデプロイは失敗する。Pages Functions形式を使う
- デジタル商品は特定商取引法上、返品不可と明記すれば返品義務なし（通信販売にクーリングオフは適用されない）

### 10. チェックリスト

デプロイ前に確認:
- [ ] .env にすべての環境変数が記入されている
- [ ] LP内のプレースホルダーがすべて実際のURLに置換されている
- [ ] Stripe Payment Linkが正しく動作する
- [ ] Stripe Webhookが設定済み（checkout.session.completed）
- [ ] STRIPE_WEBHOOK_SECRETがCloudflare Secretsに設定済み
- [ ] STRIPE_PAYMENT_LINK_IDがCloudflare Secretsに設定済み（商品フィルタ用）
- [ ] Webhookが200を返す（curl -X POST で確認）
- [ ] サンクスページにダウンロードリンクが露出していない
- [ ] 特商法ページの内容が正しい（返品不可を明記）
- [ ] メールテンプレート内のURLが正しい
- [ ] 無料PDF（リード磁石）が正しくダウンロードできる
- [ ] 配信停止ページが正しく表示される
- [ ] .gitignore に .env が含まれている
- [ ] 同一Stripeアカウントの他のWebhookが、この商品の決済で誤反応しないか確認
