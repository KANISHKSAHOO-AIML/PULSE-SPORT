import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://capable-flamingo-68920.upstash.io",
  token: "gQAAAAAAAQ04AAIncDJjZGFjMWZmNDgwMjM0ZDA1ODY0ZGM2NTgyNWU0MTA2OHAyNjg5MjAK"
});

async function run() {
  try {
    const res = await redis.incr('test_123');
    console.log("Success! New count:", res);
  } catch (err) {
    console.error("REDIS ERROR:", err);
  }
}

run();
