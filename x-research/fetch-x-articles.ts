#!/usr/bin/env npx tsx
/**
 * X Article Research Tool v2
 * SocialData API を使ってバズっているX記事を収集
 * 記事タイトル+本文冒頭を取得し、ビジネス・AI系に絞ったレポートを生成
 *
 * Usage:
 *   npx tsx fetch-x-articles.ts --min-faves 1000 --days 30 --output report.md
 *   npx tsx fetch-x-articles.ts --min-faves 500 --days 7 --topic "AI,ビジネス" --output report.md
 */

// Load .env from skills/ directory
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const API_KEY = process.env.SOCIALDATA_API_KEY;
if (!API_KEY) {
  console.error("Error: SOCIALDATA_API_KEY not found. Set it in skills/.env or as environment variable.");
  process.exit(1);
}

const BASE_URL = "https://api.socialdata.tools";

// ── Args ──
const args = process.argv.slice(2);
function getArg(name: string, defaultVal: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}
const DRY_RUN = args.includes("--dry-run");

const MIN_FAVES = parseInt(getArg("min-faves", "1000"));
const DAYS = parseInt(getArg("days", "30"));
const LANG_FILTER = getArg("lang", "ja");
const TOPIC = getArg("topic", "");
const OUTPUT = getArg("output", "");
const MAX_PAGES = parseInt(getArg("max-pages", "10"));
const TOP_DETAIL = parseInt(getArg("top-detail", "30"));

const since = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 10);
const until = new Date().toISOString().slice(0, 10);

// ── Topic keywords ──
const BUSINESS_AI_KEYWORDS = [
  "AI", "人工知能", "ChatGPT", "Claude", "GPT", "LLM", "機械学習",
  "生成AI", "プロンプト", "自動化", "Copilot", "OpenAI", "Anthropic",
  "起業", "副業", "ビジネス", "マーケティング", "収益", "売上", "SaaS", "スタートアップ",
  "フリーランス", "個人開発", "indie", "経営", "事業", "投資", "資産",
  "エンジニア", "プログラミング", "開発", "コーディング", "Web", "アプリ", "テック",
  "TypeScript", "Python", "React", "Next.js", "Cloudflare",
  "マネタイズ", "収益化", "アフィリエイト", "ブログ", "note", "X運用", "SNS",
  "コンテンツ", "情報発信", "SEO",
  "仕事術", "効率化", "生産性", "タスク管理", "時短", "ライフハック", "働き方",
];

function getTopicKeywords(): string[] {
  if (TOPIC) return TOPIC.split(",").map((k) => k.trim());
  return BUSINESS_AI_KEYWORDS;
}

// ── API helpers ──
let apiCallCount = 0;

async function apiGet(path: string, params?: Record<string, string>): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  apiCallCount++;
  return res.json();
}

// ── Japanese detection (strict: excludes Chinese-only text) ──
function hasJapanese(text: string | null | undefined): boolean {
  if (!text) return false;
  // Must contain hiragana or katakana (Chinese doesn't have these)
  return /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
}

function isJapaneseUser(user: any): boolean {
  return hasJapanese(user?.name) || hasJapanese(user?.description) || hasJapanese(user?.location);
}

// ── Topic relevance ──
function isRelevantUser(user: any): boolean {
  const keywords = getTopicKeywords();
  const bio = `${user?.name || ""} ${user?.description || ""}`.toLowerCase();
  return keywords.some((kw) => bio.toLowerCase().includes(kw.toLowerCase()));
}

function isRelevantArticle(title: string | null, previewText: string | null): boolean {
  if (!title && !previewText) return false;
  const keywords = getTopicKeywords();
  const text = `${title || ""} ${previewText || ""}`.toLowerCase();
  return keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));
}

// ── Extract article text from Draft.js content_state ──
function extractArticleText(contentState: any, maxLength: number = 500): string {
  if (!contentState?.blocks) return "";
  return contentState.blocks
    .map((b: any) => b.text || "")
    .filter((t: string) => t.trim())
    .join("\n")
    .slice(0, maxLength);
}

// ── Main ──
async function main() {
  const query = `url:x.com/i/article min_faves:${MIN_FAVES} -filter:replies since:${since} until:${until}`;

  const estSearchCalls = MAX_PAGES;
  const estDetailCalls = TOP_DETAIL;
  const estTotalCalls = estSearchCalls + estDetailCalls;
  const estCost = estTotalCalls * 0.0002;

  console.log(`=== X Article Research v2 ===`);
  console.log(`Query: ${query}`);
  console.log(`Lang: ${LANG_FILTER} | Topic: ${TOPIC || "ビジネス・AI（デフォルト）"}`);
  console.log(`Max pages: ${MAX_PAGES} (≈${MAX_PAGES * 20}件) | Detail: top ${TOP_DETAIL}件`);
  console.log(`\n推定APIコール: 最大${estTotalCalls}回`);
  console.log(`推定コスト: 最大$${estCost.toFixed(4)}（約${Math.ceil(estCost * 150)}円）`);

  if (DRY_RUN) {
    console.log(`\n--dry-run: ここで終了。実行するには --dry-run を外してください。`);
    return;
  }

  console.log(`\n--- 検索開始 ---\n`);

  // Step 1: Search
  let allTweets: any[] = [];
  let cursor: string | undefined;
  let page = 0;

  while (page < MAX_PAGES) {
    const params: Record<string, string> = { query, type: "Latest" };
    if (cursor) params.cursor = cursor;

    let data: any;
    try {
      data = await apiGet("/twitter/search", params);
    } catch (e: any) {
      if (e.message?.includes("402")) {
        console.log("  ⚠ Insufficient balance - proceeding with collected data");
        break;
      }
      throw e;
    }
    const tweets = data.tweets || [];
    if (tweets.length === 0) break;

    allTweets.push(...tweets);
    page++;
    console.log(`  Page ${page}: ${tweets.length} tweets (total: ${allTweets.length})`);

    cursor = data.next_cursor;
    if (!cursor) break;
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\nTotal tweets: ${allTweets.length}`);

  // Step 2: Japanese user filter (strict: hiragana/katakana required)
  let filtered: any[];
  if (LANG_FILTER === "ja") {
    filtered = allTweets.filter((t) => isJapaneseUser(t.user));
    console.log(`Japanese users: ${filtered.length} / ${allTweets.length}`);
  } else {
    filtered = allTweets;
  }

  // Step 3: Topic filter (by user bio)
  const topicFiltered = filtered.filter((t) => isRelevantUser(t.user));
  console.log(`Topic match (bio): ${topicFiltered.length} / ${filtered.length}`);

  // Step 4: Deduplicate
  const seen = new Map<string, any>();
  for (const t of topicFiltered) {
    const id = t.id_str;
    if (!seen.has(id) || (seen.get(id).favorite_count < t.favorite_count)) {
      seen.set(id, t);
    }
  }
  const unique = Array.from(seen.values());
  console.log(`After dedup: ${unique.length}`);

  // Step 5: Sort
  unique.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));

  // Step 6: Fetch article details (title + content)
  const detailCount = Math.min(unique.length, TOP_DETAIL);
  console.log(`\nFetching article details for top ${detailCount}...`);

  type ArticleResult = {
    tweet: any;
    title: string | null;
    previewText: string | null;
    bodyExcerpt: string;
    coverUrl: string | null;
  };

  const results: ArticleResult[] = [];
  let detailStopped = false;

  for (let i = 0; i < detailCount; i++) {
    const t = unique[i];

    if (detailStopped) {
      results.push({ tweet: t, title: null, previewText: null, bodyExcerpt: "", coverUrl: null });
      continue;
    }

    try {
      const detail = await apiGet(`/twitter/article/${t.id_str}`);
      const article = detail?.article || {};
      results.push({
        tweet: { ...t, _detail: detail },
        title: article.title || null,
        previewText: article.preview_text || null,
        bodyExcerpt: extractArticleText(article.content_state, 300),
        coverUrl: article.cover_url || null,
      });
    } catch (e: any) {
      if (e.message?.includes("402")) {
        console.log("  ⚠ Insufficient balance - stopping detail fetch");
        detailStopped = true;
      }
      results.push({ tweet: t, title: null, previewText: null, bodyExcerpt: "", coverUrl: null });
    }

    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${detailCount} fetched`);
    await new Promise((r) => setTimeout(r, 600));
  }

  // Step 7: Second topic filter (by article title + content)
  // Entries that passed bio filter but have irrelevant article content get removed
  const finalResults = results.filter((r) => {
    // If we couldn't fetch article details, keep based on bio filter alone
    if (!r.title && !r.previewText) return true;
    // If article title/content also matches topic, definitely keep
    if (isRelevantArticle(r.title, r.previewText)) return true;
    // If article content is in Japanese and title contains any topic keyword broadly, keep
    if (r.title && hasJapanese(r.title)) return true;
    // Otherwise remove (article content didn't match topic)
    return false;
  });

  console.log(`After content filter: ${finalResults.length} / ${results.length}`);

  // Step 8: Generate report
  const totalCost = apiCallCount * 0.0002;

  let report = `# X Article Research Report\n\n`;
  report += `生成日: ${new Date().toISOString().slice(0, 10)}\n`;
  report += `検索条件: いいね${MIN_FAVES}以上 / 直近${DAYS}日 / ${LANG_FILTER === "ja" ? "日本語" : "全言語"} / ${TOPIC || "ビジネス・AI系"}\n`;
  report += `結果: ${allTweets.length}件 → 日本語${filtered.length} → トピック${topicFiltered.length} → 記事取得${results.length} → 最終${finalResults.length}件\n`;
  report += `APIコール: ${apiCallCount}回 / コスト: $${totalCost.toFixed(4)}（約${Math.ceil(totalCost * 150)}円）\n\n`;
  report += `---\n\n`;

  for (let i = 0; i < finalResults.length; i++) {
    const r = finalResults[i];
    const t = r.tweet;
    const user = t.user || {};
    const views = t.views_count || t._detail?.views_count || "N/A";
    const bookmarks = t.bookmark_count || t._detail?.bookmark_count || "N/A";

    const displayTitle = r.title || "(タイトル未取得)";

    report += `### ${i + 1}. ${displayTitle}\n\n`;
    report += `- 著者: ${user.name || "?"} (@${user.screen_name || "?"}) / フォロワー ${user.followers_count?.toLocaleString() || "?"}\n`;
    report += `- いいね: ${t.favorite_count?.toLocaleString() || 0} / RT: ${t.retweet_count?.toLocaleString() || 0} / 閲覧: ${typeof views === "number" ? views.toLocaleString() : views} / BM: ${typeof bookmarks === "number" ? bookmarks.toLocaleString() : bookmarks}\n`;
    report += `- URL: https://x.com/${user.screen_name}/status/${t.id_str}\n`;
    report += `- 投稿日: ${(t.tweet_created_at || t.created_at || "?").slice(0, 10)}\n`;

    if (r.bodyExcerpt) {
      const excerpt = r.bodyExcerpt.replace(/\n/g, " ").slice(0, 200);
      report += `- 本文冒頭: ${excerpt}${r.bodyExcerpt.length > 200 ? "..." : ""}\n`;
    } else if (r.previewText) {
      report += `- プレビュー: ${r.previewText.slice(0, 200)}\n`;
    }

    report += `\n`;
  }

  if (OUTPUT) {
    const fs = await import("fs");
    fs.writeFileSync(OUTPUT, report, "utf-8");
    console.log(`\nReport saved: ${OUTPUT}`);
  } else {
    console.log("\n" + report);
  }

  console.log(`\nDone. API calls: ${apiCallCount}, Cost: $${totalCost.toFixed(4)} (≈${Math.ceil(totalCost * 150)}円)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
