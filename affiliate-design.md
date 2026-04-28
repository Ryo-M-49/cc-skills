---
name: affiliate-design
description: アフィリエイト比較サイトのデザインをCVR最適化する。ランキング・比較表・CTA・信頼性要素の設計ガイドライン。
trigger: アフィリエイトサイトのデザイン・UI改善時
---

# アフィリエイト比較サイト デザインスキル

このスキルは、アフィリエイト比較サイトのデザインをCVR（成約率）最大化のために最適化するときに適用する。

## 7つのデザイン原則

### 1. コントラストによる視線誘導
CTAボタンは周囲と補色関係の色にする。青ベースのサイトならオレンジまたは緑のCTA。背景と高コントラストなCTAはクリック率20-35%向上（HubSpot A/Bテスト）。

### 2. 1ページ1ゴール
1ページに主要CTAを1種類に絞る。複数CTAの選択肢過多でCVRが低下する。1ゴールに絞ることでCVR266%向上のデータあり。

### 3. ファーストビューでの価値提示
スクロールなしで見える領域にキャッチコピー・更新日・TOP3サマリー・CTAを配置。ファーストビュー内CTAで10-15%、記事末尾CTAで20-30%のCVR向上。両方に配置するのが最適。

### 4. 信頼性シグナルの明示
更新日・監修者情報・利用者数・出典元を表示する。端数を含む具体的数字（例: 「3,532人が利用」）は丸い数字より信頼感が高い。

### 5. モバイルファースト
タップターゲット最低48x48px、推奨56px以上。CTAは親指が届く画面下部寄りに。モバイルCTA最適化だけで32.5%のCVR改善。

### 6. パーソナライズ
ユーザーの状況に応じたメッセージ（例: 「ドコモユーザーの方へ」）。パーソナライズCTAは汎用CTAの202%高いCVR。

### 7. 正直な比較
メリットだけでなくデメリットも明示。信頼性が上がり結果的にCVR向上。GoogleのHelpful Content評価にも合致。

---

## 配色ガイドライン

| 用途 | 推奨色 | Tailwind |
|------|--------|---------|
| ベースカラー | 青系（信頼感） | `blue-600` ~ `blue-700` |
| アクセント/CTA | オレンジ系（行動促進） | `orange-500` ~ `orange-600` |
| 背景 | 白 or 薄グレー | `white` / `gray-50` |
| テキスト | ダークグレー | `gray-900` / `gray-800` |
| おすすめハイライト | 薄い青背景+青ボーダー | `bg-blue-50 border-blue-500` |
| 1位バッジ | 金色 | `bg-amber-400` |
| 2位バッジ | 銀色 | `bg-gray-400` |
| 3位バッジ | 銅色 | `bg-amber-700` |
| 成功/メリット | 緑 | `text-green-600` |
| 注意/デメリット | 赤 | `text-red-500` |

---

## タイポグラフィ

| 要素 | デスクトップ | モバイル | Tailwind |
|------|-------------|---------|---------|
| H1 | 30-36px | 24-28px | `text-3xl md:text-4xl font-bold leading-tight` |
| H2 | 24-28px | 20-24px | `text-2xl md:text-3xl font-bold leading-tight` |
| H3 | 20-24px | 18-20px | `text-xl md:text-2xl font-bold` |
| 本文 | 16-18px | 16px | `text-base leading-relaxed` |
| 補足 | 14px | 14px | `text-sm` |
| CTA文字 | 16-18px bold | 16px bold | `text-base md:text-lg font-bold` |

1行あたり日本語25-40文字が最適。`max-w-prose` (65ch) で制御。

---

## CTAボタン設計

### 基本形
```
bg-orange-500 hover:bg-orange-600 text-white font-bold
py-3 px-8 rounded-lg text-base md:text-lg
shadow-md hover:shadow-lg hover:scale-105
transition-all duration-200
```

### 配置ルール
- 記事冒頭（ファーストビュー内）+ 各ランキングカード内 + 記事末尾の最低3箇所
- モバイルではCTAボタンを `w-full`（横幅いっぱい）にする
- ボタン周囲に最低16pxの余白

### 文言ルール
- 具体的なベネフィットを含める
- 良い例: 「公式サイトでキャンペーンを確認する」「無料で料金シミュレーション」
- 悪い例: 「詳細はこちら」「クリック」「申し込み」
- マイクロコピー追加: 「※ 契約の義務はありません」「※ 3分で完了」

---

## ランキングカード設計

### 1位のカード
```
border-2 border-blue-500 bg-blue-50 rounded-xl shadow-lg relative
```
- 左上にリボン: `absolute -top-3 left-4 bg-blue-600 text-white text-sm px-3 py-1 rounded-full` → 「おすすめ No.1」
- 1位バッジ: 金色 `bg-amber-400`

### 2-3位のカード
- 銀バッジ `bg-gray-400`、銅バッジ `bg-amber-700`
- ボーダーは通常のグレー

### 4位以降
- バッジは数字のみ、ボーダーなし or 薄いグレー

### カード内の構成
1. 順位バッジ + サービス名 + タイプラベル
2. 1行の説明文
3. 料金・速度・CB・スマホ割の4指標グリッド
4. CTAボタン（オレンジ、カード内に配置）

---

## 比較表設計

### デスクトップ
- ヘッダー行を `sticky top-0` で固定
- おすすめ列の背景を `bg-blue-50` でハイライト
- 各行の優れた値を `text-green-600 font-bold` で強調

### モバイル
- 左列（項目名）を `sticky left-0` で固定
- 横スクロール可能にし、右端のコンテンツを少し見切れさせてスクロール可能であることを示す
- `overflow-x-auto` + `-webkit-overflow-scrolling: touch`

---

## 信頼性要素チェックリスト

各ページに以下を含める:
- [ ] 最終更新日（タイトル直下）
- [ ] 料金データの出典元リンク
- [ ] 「※ 掲載情報は調査時点のものです」の注釈
- [ ] 「※ 当サイトはアフィリエイト広告を利用しています」の明記
- [ ] 監修者/運営者情報への導線

---

## 情報ソース

- [OptiMonk - Affiliate Conversion Rate Best Practices](https://www.optimonk.com/affiliate-marketing-conversion-rate)
- [HubSpot - CTA A/B Testing](https://blog.hubspot.com/marketing/which-types-of-form-content-convert-the-best)
- [VWO - High Converting CTA Button](https://vwo.com/blog/high-converting-call-to-action-button-examples/)
- [CXL - CTA Button Color](https://cxl.com/blog/which-color-converts-the-best/)
- [NNGroup - Mobile Tables](https://www.nngroup.com/articles/mobile-tables/)
- [Unbounce - CTA Buttons That Convert](https://unbounce.com/conversion-rate-optimization/cta-buttons-that-convert/)
