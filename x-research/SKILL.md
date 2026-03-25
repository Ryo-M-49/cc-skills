---
name: x-research
description: SocialData APIを使ってX(Twitter)のバズ記事を自動収集し、ビジネス・AI系に絞ったレポートを生成する
trigger: 「Xの記事をリサーチして」「バズってる投稿を集めて」「Xのトレンドを調べて」等の指示
---

# 実行方法

ユーザーの指示からいいね数と期間を読み取り、以下のスクリプトを実行する。
指示がなければデフォルト値（いいね1000以上、直近30日）を使う。

**実行前に必ずコスト見積もりを提示し、ユーザーの承認を得ること。**

## Step 1: 見積もり（--dry-run）

```bash
npx tsx /home/ryo/cc-company/skills/x-research/fetch-x-articles.ts \
  --min-faves （ユーザー指定 or 1000） \
  --days （ユーザー指定 or 30） \
  --max-pages 5 \
  --top-detail 20 \
  --dry-run
```

見積もり結果をユーザーに提示し「実行してよいですか？」と確認する。

## Step 2: 実行

```bash
npx tsx /home/ryo/cc-company/skills/x-research/fetch-x-articles.ts \
  --min-faves （ユーザー指定 or 1000） \
  --days （ユーザー指定 or 30） \
  --max-pages 5 \
  --top-detail 20 \
  --output （適切な出力先パス）
```

APIキーは `skills/.env` から自動読み込みされる。

# オプション

- `--min-faves`: 最低いいね数（デフォルト: 1000）
- `--days`: 直近何日分（デフォルト: 30）
- `--lang`: `ja`で日本語のみ、`all`で全言語（デフォルト: ja）
- `--topic`: カンマ区切りのキーワード。省略時はビジネス・AI系のデフォルトキーワードで自動フィルタ
- `--max-pages`: 検索ページ数（デフォルト: 10、1ページ≈20件）
- `--top-detail`: 詳細取得する上位件数（デフォルト: 30）
- `--output`: 出力ファイルパス
- `--dry-run`: コスト見積もりのみ

# ユーザー指示の例と対応

「Xのバズ記事を調べて」→ デフォルト（いいね1000以上、30日、ビジネス・AI系）
「いいね500以上で直近1週間」→ --min-faves 500 --days 7
「AI関連だけ」→ --topic "AI,ChatGPT,Claude,LLM,生成AI"

# コスト目安

- 1 APIコール = $0.0002（約0.03円）
- 5ページ検索 + 20件詳細 = 25コール = 約1円
- 10ページ検索 + 30件詳細 = 40コール = 約2円

# 重要

- **お金が動く処理なので、必ず--dry-runで見積もりを出してからユーザーに確認を取る**
- APIキーは skills/.env から自動読み込み（環境変数でのオーバーライドも可）
