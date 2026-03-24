export const config = {
  runtime: 'edge',
};

function getRandomTarget(targets: string[]) {
  return targets[Math.floor(Math.random() * targets.length)];
}

export default async function handler(request: Request) {
  const url = new URL(request.url);

  const targets = (process.env.TARGET_HOSTS || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  if (!targets.length) {
    return new Response("No TARGET_HOSTS configured", { status: 500 });
  }

  const target = getRandomTarget(targets);

  const targetUrl = new URL(url.pathname + url.search, `https://${target}`);

  const headers = new Headers(request.headers);
  headers.set("host", target);
  headers.set("referer", `https://${target}/`);
  headers.set("origin", `https://${target}`);

  return fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
  });
}
