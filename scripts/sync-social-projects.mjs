const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "");
const secret = process.env.SOCIAL_SYNC_SECRET;

if (!baseUrl || !secret) {
  console.error("APP_BASE_URL and SOCIAL_SYNC_SECRET are required.");
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/flz/social-projects/sync`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(120_000),
});
const payload = await response.json().catch(() => null);

if (!response.ok || !payload) {
  console.error(`Social project sync failed with HTTP ${response.status}.`);
  process.exit(1);
}

console.log(JSON.stringify({
  success: payload.success,
  fetched: payload.fetched,
  created: payload.created,
  updated: payload.updated,
  hidden: payload.hidden,
  providers: payload.providers,
}));

if (!payload.success) process.exit(1);
