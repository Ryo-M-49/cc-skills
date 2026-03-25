# cc-skills

Claude Codeで使える再利用可能なスキル集。

自然言語で指示するだけで、リサーチや自動化タスクが動く。

## セットアップ

```bash
git clone git@github.com:Ryo-M-49/cc-skills.git
cd cc-skills
cp .env.example .env
# .env にAPIキーを記入
```

Node.js 20+ が必要。tsx は npx 経由で自動インストールされる。

## スキル一覧

| スキル | 説明 | 必要なAPIキー | 詳細 |
|--------|------|--------------|------|
| [x-research](./x-research/) | X(Twitter)のバズ記事を自動収集してレポート生成 | SOCIALDATA_API_KEY | [README](./x-research/README.md) |

## 環境変数

`.env` に必要なAPIキーを記入する。`.env.example` にテンプレートとAPIキーの取得先がある。

| 変数名 | 用途 | 取得先 |
|--------|------|--------|
| SOCIALDATA_API_KEY | X記事リサーチ | https://socialdata.tools/signup |

## スキルの追加方法

1. `スキル名/` ディレクトリを作成
2. `SKILL.md` — Claude Code用のスキル定義（トリガー条件、実行方法）
3. `README.md` — 人間向けのドキュメント（使い方、オプション、コスト等）
4. スクリプト本体
5. 必要な環境変数があれば `.env.example` に追記
6. ルートREADMEのスキル一覧テーブルに追記

## ライセンス

MIT
