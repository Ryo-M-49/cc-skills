# cc-skills

Claude Codeで使える再利用可能なスキル集。

自然言語で指示するだけで、リサーチや自動化タスクが動く。

## セットアップ

### 1. クローン

```bash
git clone git@github.com:Ryo-M-49/cc-skills.git
```

### 2. 環境変数の設定

```bash
cd cc-skills
cp .env.example .env
```

`.env` を開いて、必要なAPIキーを記入する。

```bash
# .env
SOCIALDATA_API_KEY=your_api_key_here
```

APIキーの取得先は `.env.example` にコメントで書いてある。

### 3. Node.js

スクリプトの実行に Node.js 20+ と tsx が必要。tsx は npx 経由で自動インストールされるので手動の準備は不要。

```bash
node -v  # v20以上であることを確認
```

## スキル一覧

| スキル | 説明 | 必要なAPIキー |
|--------|------|--------------|
| [x-research](./x-research/) | X(Twitter)のバズ記事を自動収集してレポート生成 | SOCIALDATA_API_KEY |

## 使い方

### x-research: Xバズ記事リサーチ

Claude Codeに自然言語で指示する。

```
Xのバズ記事をリサーチして
```

条件を指定する場合:

```
Xのバズ記事、いいね500以上で直近1週間
```

```
Xの記事リサーチ、いいね2000以上、直近3日
```

Claude Codeが以下の流れで処理する:

1. `--dry-run` でコスト見積もりを表示
2. ユーザーに確認を求める
3. OKが出たら実行
4. レポートをファイル保存

デフォルト設定: いいね1000以上、直近30日、日本語、ビジネス・AI系に自動フィルタ。

### 直接実行する場合

Claude Codeを経由せず直接コマンドで実行することもできる。

```bash
# 見積もりだけ確認
npx tsx x-research/fetch-x-articles.ts --min-faves 1000 --days 30 --dry-run

# 実行してレポート出力
npx tsx x-research/fetch-x-articles.ts --min-faves 1000 --days 30 --output report.md
```

### オプション

| オプション | デフォルト | 説明 |
|-----------|-----------|------|
| `--min-faves` | 1000 | 最低いいね数 |
| `--days` | 30 | 直近何日分を検索するか |
| `--lang` | ja | `ja` で日本語のみ、`all` で全言語 |
| `--topic` | (ビジネス・AI系) | カンマ区切りのキーワード。省略時はデフォルトキーワードで自動フィルタ |
| `--max-pages` | 10 | 検索ページ数（1ページ≈20件） |
| `--top-detail` | 30 | 記事タイトル・本文を取得する上位件数 |
| `--output` | (stdout) | 出力ファイルパス |
| `--dry-run` | - | コスト見積もりのみ表示して終了 |

### コスト

SocialData APIは完全従量課金。1 APIコール = $0.0002（約0.03円）。

| 使い方 | APIコール数 | コスト |
|--------|-----------|--------|
| 5ページ検索 + 20件詳細 | 25 | 約1円 |
| 10ページ検索 + 30件詳細 | 40 | 約2円 |
| 30ページ検索 + 50件詳細 | 80 | 約4円 |

SocialData APIのアカウント作成: https://socialdata.tools/signup

## 環境変数一覧

| 変数名 | 用途 | 取得先 |
|--------|------|--------|
| SOCIALDATA_API_KEY | X記事リサーチ | https://socialdata.tools/signup |

## ライセンス

MIT
