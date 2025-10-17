/**
 * Example: submit-job.ts
 * - Reads ZENCODER_API_KEY from process.env
 * - Submits a simple job to Zencoder API v2
 *
 * Usage:
 *  - Locally with tsx:  pnpm dlx tsx ./scripts/zencoder/submit-job.ts
 *  - Or build and run compiled JS
 *
 * Security: keep ZENCODER_API_KEY out of source control. Use OS env, VS Code secret storage, or .env (dev only).
 */

const API_ENDPOINT = "https://app.zencoder.com/api/v2/jobs";

async function main() {
  const apiKey = process.env.ZENCODER_API_KEY;
  if (!apiKey) {
    console.error("Missing ZENCODER_API_KEY in environment. Set it securely before running.");
    process.exitCode = 2;
    return;
  }

  // Example job payload — modify to your needs. Check Zencoder API docs for field details.
  const payload = {
    input: "https://example.com/path/to/source.mp4",
    outputs: [
      {
        label: "h264-720p",
        public: false,
        url: "s3://my-bucket/outputs/output-720p.mp4",
        encoding: {
          codec: "h264",
          video_bitrate: 2500,
          width: 1280,
          height: 720
        }
      }
    ],
    notifications: {
      completed: "https://my-webhook.example/api/zencoder/callback"
    }
  };

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Zencoder-Api-Key": apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Zencoder API returned ${res.status}: ${body}`);
      process.exitCode = 3;
      return;
    }

    const data = await res.json();
    console.log("Zencoder job submitted successfully:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error submitting job to Zencoder:", err);
    process.exitCode = 4;
  }
}

main();