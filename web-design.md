---
name: web-design
description: AIっぽくない、個性のあるWebサイトデザインを作成する。ヒアリング→デザインシステム定義→実装の3ステップで進行。
trigger: Webサイト・LP・ページのデザイン作成・改善時
---

# Web Design スキル — AIっぽくないサイトを作る

## 概要

Webサイトのデザイン（新規作成・リニューアル・改善）を行う際に適用する。
AIが生成しがちな「ジェネリックUI」を回避し、意図と個性のあるデザインを実現する。

## 進行フロー

### Step 1: ヒアリング（必須・スキップ不可）

コードを書く前に、必ず以下を確認する。ユーザーが明示していない項目は質問する。

**必須ヒアリング項目:**

1. **トーン** — どういう印象にしたい？
   - 選択肢を提示: 信頼・プロ（Stripe風）/ 親しみ・カジュアル（Notion風）/ エディトリアル・メディア（Wirecutter風）/ ミニマル・シャープ / その他
2. **参考サイト** — 「このデザイン好き」があれば（なくてもOK）
3. **改善の範囲** — どのページ・コンポーネントを対象にするか
4. **既存のブランド要素** — 決まっているロゴ・カラー・フォントがあるか
5. **技術スタック** — フレームワーク（Astro/Next.js/Vue等）、CSSフレームワーク（Tailwind等）

ヒアリング結果をもとにStep 2に進む。

### Step 2: デザインシステム定義

ヒアリング結果をもとに、コードを書く前にデザインシステムを定義する。

**定義する項目:**

```
1. カラーパレット（CSS変数で定義）
   - 背景色（bg）
   - テキスト色（primary / secondary / muted）
   - アクセント色（CTA用）
   - セカンダリアクセント
   - ボーダー色
   - 成功/エラー色

2. フォント（最大2書体）
   - 見出し用
   - 本文用
   - Google Fonts or セルフホスト

3. 角丸ルール
   - カード: ○px
   - ボタン: ○px
   - バッジ: ○px
   ※ 均一にしない。意図的にバリエーションを持たせる

4. シャドウ
   - 通常 / ホバー時

5. レイアウト方針
   - 対称 or 非対称
   - max-width
   - スペーシングの段階（8/16/24/48px等）

6. アニメーション（最大3つ）
   - 何に / どういう動きを / なぜ
```

定義結果をユーザーに提示し、確認を取ってからStep 3に進む。

### Step 3: 実装

デザインシステムに従いコードを書く。実装中は以下のチェックリストを常に意識する。

## AI Slopチェックリスト（実装中に随時確認）

以下に1つでも該当したら修正する:

| チェック | NG例 | OK例 |
|---------|------|------|
| 紫→青グラデーションを使っていないか | `from-indigo-700 to-purple-900` | ブランドに合った単色 or 温かいグラデ |
| システムフォント/Inter/Robotoだけになっていないか | `font-sans` のみ | DM Sans, Satoshi, Manrope等 |
| 全要素が同じ角丸になっていないか | 全部 `rounded-xl` | カード4px、ボタン8px、バッジpill |
| 中央寄せ一辺倒になっていないか | ヒーロー中央、カード中央、全部中央 | ヒーロー左寄せ、非対称グリッド |
| 見出しが曖昧・汎用的でないか | 「最適なツールが見つかる」 | 「料金と評判で選ぶ、ビジネスツール。」 |
| CTAが青い汎用ボタンでないか | `bg-blue-600` | ブランドアクセント色 |
| 背景がフラットな白/グレーだけでないか | `bg-white` のみ | テクスチャ、微妙なグラデ、ドットグリッド |
| font-extrabold を多用していないか | 全見出しに `font-extrabold` | `font-bold` 基本、必要な箇所のみ強調 |
| ホバー時の変化が indigo 一色でないか | `hover:text-indigo-600` | アクセント色 or opacity変化 |

## フォント選定ガイド

トーン別の推奨ペアリング:

| トーン | 見出し | 本文 |
|--------|--------|------|
| 信頼・プロ | Satoshi, IBM Plex Sans | Inter, Noto Sans JP |
| 親しみ・カジュアル | DM Sans, Manrope, Lexend | Noto Sans JP, system-ui |
| エディトリアル | Playfair Display, Fraunces | Source Serif Pro, Noto Serif JP |
| テック・開発者 | Space Mono, JetBrains Mono | IBM Plex Sans, Noto Sans JP |
| 高級・洗練 | Cormorant, Instrument Serif | Inter, DM Sans |

日本語サイトでは Noto Sans JP / Noto Serif JP を本文に組み合わせる。

## カラーパレット例

### 温かみ・親しみ系（Notion風）
```css
--bg: #faf8f5;
--ink: #2d2926;
--ink-light: #5c5650;
--ink-muted: #9b9490;
--accent: #e8634a;        /* coral */
--accent-secondary: #7c9a82; /* sage */
--border: #f0ece6;
```

### 信頼・プロ系（Stripe風）
```css
--bg: #f7f7f8;
--ink: #1a1a2e;
--ink-light: #4a4a5a;
--ink-muted: #8e8e9e;
--accent: #635bff;        /* Stripe purple - 唯一許可される紫 */
--accent-secondary: #0a2540;
--border: #e6e6ea;
```

### ダーク系
```css
--bg: #0f0f0f;
--ink: #e8e8e8;
--ink-light: #a0a0a0;
--ink-muted: #666666;
--accent: #ff6b35;
--accent-secondary: #4ecdc4;
--border: #2a2a2a;
```

### ナチュラル系
```css
--bg: #f5f0e8;
--ink: #2c3e2d;
--ink-light: #5a6b5b;
--ink-muted: #8a9a8b;
--accent: #c45d35;
--accent-secondary: #4a7c59;
--border: #e0d8cc;
```

## レイアウトの原則

1. **ヒーローは非対称** — テキスト左 + ビジュアル右（or 逆）。中央寄せフルワイドは避ける
2. **グリッドを1箇所崩す** — 全セクション均等配置ではなく、1つだけサイズ・配置を変える
3. **スペーシングに段階** — tight(8px) / normal(16px) / loose(24px) / section(48px+) を使い分け
4. **max-width** — コンテンツ幅 960-1152px。全幅は背景のみ

## アニメーションルール（OpenAI準拠）

最大3つ。それ以上は削る:

1. **ヒーロー入場** — fade-up or slide-in（0.4-0.6s, ease-out）
2. **スクロール連動** — ヘッダーのすりガラス / 要素のフェードイン
3. **ホバー** — ボーダー色変化 / 微妙なlift

ルール:
- duration: 0.2-0.6s
- easing: ease or ease-out
- `prefers-reduced-motion` で無効化
- 「なぜこのアニメーションが必要か」を説明できないなら削除

## 背景テクスチャ

フラットな白/グレー背景を避けるためのテクニック:

```css
/* ドットグリッド */
background-image: radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px);
background-size: 20px 20px;

/* 微妙なノイズ */
background-image: url("data:image/svg+xml,..."); /* SVGノイズ */

/* すりガラスヘッダー */
background: rgba(250,248,245,0.85);
backdrop-filter: blur(12px);
```

## やってはいけないこと

- Tailwindのデフォルトカラー（gray-50, indigo-600等）をそのまま使う
- `rounded-xl` を全要素に均一適用
- `font-extrabold` を全見出しに使う
- 紫→青グラデーションをヒーローに使う
- 「最適な○○が見つかる」系の汎用コピー
- ストックイラスト / AI生成の抽象3Dブロブ
- 4つ以上のアニメーション
- デザインシステムを定義せずにコードを書き始める

## 参考記事

- [OpenAI: Designing Delightful Frontends](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4)
- [Shuffle.dev: Why AI-Generated Websites Look the Same](https://shuffle.dev/blog/2026/01/why-do-most-ai-generated-websites-look-the-same/)
- [925 Studios: AI Slop Web Design Guide](https://www.925studios.co/blog/ai-slop-web-design-guide)
- [Tech Bytes: Escape AI Slop Frontend](https://techbytes.app/posts/escape-ai-slop-frontend-design-guide/)
- [The Crit: Why Your Vibe-Coded App Looks Like Every Other](https://www.thecrit.co/resources/vibe-coding-design-guide)
