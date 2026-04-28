#!/usr/bin/env node

// Gemini API Image Generation Script
// Usage: node generate-image.mjs <prompt> [options]
// Options: --aspect <ratio> --size <resolution> --output <path> --model <model>

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// .envファイルから環境変数を読み込む
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", "..", "..", ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {}

const args = process.argv.slice(2);

function parseArgs(args) {
  const options = {
    prompt: "",
    aspect: "1:1",
    size: "1K",
    output: "",
    model: "gemini-3-pro-image-preview",
  };

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--aspect" && args[i + 1]) {
      options.aspect = args[++i];
    } else if (args[i] === "--size" && args[i + 1]) {
      options.size = args[++i];
    } else if (args[i] === "--output" && args[i + 1]) {
      options.output = args[++i];
    } else if (args[i] === "--model" && args[i + 1]) {
      options.model = args[++i];
    } else {
      positional.push(args[i]);
    }
  }
  options.prompt = positional.join(" ");
  return options;
}

const options = parseArgs(args);

if (!options.prompt) {
  console.error("Error: prompt is required");
  console.error(
    'Usage: node generate-image.mjs "your prompt" [--aspect 16:9] [--size 1K] [--output path.png] [--model model-name]'
  );
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error(
    "Error: GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required"
  );
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent?key=${apiKey}`;

const body = {
  contents: [
    {
      parts: [{ text: options.prompt }],
    },
  ],
  generationConfig: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: options.aspect,
      imageSize: options.size,
    },
  },
};

async function main() {
  console.log(`Generating image with model: ${options.model}`);
  console.log(`Prompt: ${options.prompt}`);
  console.log(`Aspect ratio: ${options.aspect}, Size: ${options.size}`);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`API Error (${response.status}): ${error}`);
    process.exit(1);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts) {
    console.error("No content in response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const { default: fs } = await import("fs");
  const { default: path } = await import("path");

  let imageCount = 0;
  let textResponse = "";

  for (const part of data.candidates[0].content.parts) {
    if (part.inlineData) {
      imageCount++;
      const outputPath =
        options.output ||
        path.join(
          process.cwd(),
          `generated-image-${Date.now()}-${imageCount}.png`
        );
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log(`Image saved: ${outputPath}`);
    }
    if (part.text) {
      textResponse += part.text;
    }
  }

  if (textResponse) {
    console.log(`\nText response: ${textResponse}`);
  }

  if (imageCount === 0) {
    console.error("No images were generated in the response.");
    process.exit(1);
  }

  console.log(`\nDone! Generated ${imageCount} image(s).`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
