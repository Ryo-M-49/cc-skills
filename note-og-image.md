---
name: note-og-image
description: note.com記事のヘッダー画像（OG画像）をPythonで一括生成するスキル
trigger: note記事の画像生成、OG画像作成、ヘッダー画像作成
---

# 役割

note.com記事用のヘッダー画像（1280x670px）をPython + Pillowで生成する。

# デザイン仕様

- サイズ: 1280 x 670px（note.com推奨）
- 背景色: #1a2744（ダークネイビー）
- アクセント: #10b981（エメラルドグリーン）
- テキスト: #ffffff（白）
- サブテキスト: #94a3b8（スレートグレー）
- フォント: IPA Pゴシック（/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf）
- 上下にアクセントカラーのバー（6px）
- 左側に縦アクセントバー
- タグをピル型で表示（#タグ名）
- タイトルは手動で改行位置を指定（\nで区切る）
- 下部にブランド名「Auto-Shopee | Shopee出品準備の自動化ツール」

# 入力

ユーザーから以下を受け取る:
- タイトル（改行位置を\nで指定）
- タグ（リスト）
- 出力ファイル名

# 生成コード

```python
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1280, 670
BG_COLOR = "#1a2744"
ACCENT_COLOR = "#10b981"
TEXT_COLOR = "#ffffff"
SUBTEXT_COLOR = "#94a3b8"

FONT_PATH = "/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf"
font_title = ImageFont.truetype(FONT_PATH, 52)
font_sub = ImageFont.truetype(FONT_PATH, 28)
font_tag = ImageFont.truetype(FONT_PATH, 24)

def generate_og(title, tags, filename, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Top/bottom accent bars
    draw.rectangle([0, 0, W, 6], fill=ACCENT_COLOR)
    draw.rectangle([0, H - 6, W, H], fill=ACCENT_COLOR)

    # Left vertical accent bar
    draw.rectangle([60, 140, 66, H - 140], fill=ACCENT_COLOR)

    # Tags
    tag_x = 90
    tag_y = 160
    for tag in tags:
        tag_text = f"#{tag}"
        bbox = draw.textbbox((0, 0), tag_text, font=font_tag)
        tw = bbox[2] - bbox[0]
        draw.rounded_rectangle(
            [tag_x - 8, tag_y - 4, tag_x + tw + 8, tag_y + 30],
            radius=4, fill="#2a3a5c"
        )
        draw.text((tag_x, tag_y), tag_text, font=font_tag, fill=ACCENT_COLOR)
        tag_x += tw + 24

    # Title
    y = 220
    for line in title.split("\n"):
        draw.text((90, y), line, font=font_title, fill=TEXT_COLOR)
        y += 72

    # Branding
    draw.text((90, H - 80), "Auto-Shopee  |  Shopee出品準備の自動化ツール",
              font=font_sub, fill=SUBTEXT_COLOR)

    path = os.path.join(output_dir, filename)
    img.save(path, "PNG")
    return path
```

# 使い方

ユーザーが記事タイトルとタグを指定したら、上記のコードをBashツールで実行して画像を生成する。複数枚の場合はループで一括生成する。生成後はReadツールで画像をプレビュー表示する。
