---
name: generate-image
description: This skill should be used when the user asks to "generate an image", "create an image", "draw", "illustrate", "画像を生成", "画像を作って", "イラストを描いて", or any request involving image creation or generation. Uses Google Gemini API for image generation.
version: 1.0.0
user_invocable: true
---

# 画像生成スキル

Google Gemini APIを使って画像を生成する。

## このスキルが適用される場面

- 画像の生成・作成・描画のリクエスト
- コンセプトのビジュアル化
- ロゴ、アイコン、ビジュアル素材の作成
- 画像ファイルの出力が必要なあらゆるリクエスト

## 前提条件

- `~/.claude/.env` に `GEMINI_API_KEY` が設定されていること（環境変数でも可）
- Node.js (v18+) が利用可能であること

## 画像生成の方法

Bashツールで `~/.claude/skills/generate-image/scripts/generate-image.mjs` を実行する:

```bash
node ~/.claude/skills/generate-image/scripts/generate-image.mjs "<プロンプト>" [--aspect <比率>] [--size <解像度>] [--output <パス>] [--model <モデル>]
```

### パラメータ

| パラメータ | デフォルト | 選択肢 | 説明 |
|-----------|---------|---------|-------------|
| prompt | (必須) | 任意のテキスト | 画像の説明 |
| --aspect | 1:1 | 1:1, 16:9, 9:16, 4:3, 3:4 | アスペクト比 |
| --size | 1K | 512, 1K, 2K, 4K | 解像度 |
| --output | 自動生成 | ファイルパス | 出力先パス |
| --model | gemini-3-pro-image-preview | 下記参照 | Geminiモデル |

### 利用可能なモデル

- `gemini-3-pro-image-preview` — 高品質
- `gemini-3.1-flash-image-preview` — 最新のflashモデル

## ワークフロー

1. ユーザーのリクエストを解釈し、画像生成に効果的な英語プロンプトを作成する（必要に応じて翻訳）
2. 用途に応じて適切なアスペクト比とサイズを選択する
3. Bashツールで生成スクリプトを実行する
4. 生成後、Readツールで生成された画像をユーザーに表示する
5. APIキーが未設定の場合は、`GEMINI_API_KEY` または `GOOGLE_API_KEY` の設定を案内する

## 守ること

- 文字を入れる場合、指示がない限りは日本語で入れる。

## より良いプロンプトのコツ

- 具体的で詳細な説明を書く
- スタイル情報を含める（例: "watercolor", "photorealistic", "flat design"）
- 構図の詳細を指定する（例: "close-up", "wide angle", "bird's eye view"）
- ユーザーのプロンプトが日本語の場合、英語に翻訳して内容を補強する
