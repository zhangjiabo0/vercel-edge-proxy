export const runtime = 'edge';

function getRandomTarget(targets: string[]) {
  return targets[Math.floor(Math.random() * targets.length)];
}

async function handle(request: Request) {
  const url = new URL(request.url);

  // 从环境变量读取
  const targets = (process.env.TARGET_HOSTS || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  if (!targets.length) {
    return new Response("No TARGET_HOSTS configured", { status: 500 });
  }

  const target = getRandomTarget(targets);

  // 拼接目标 URL
  const targetUrl = new URL(url.pathname + url.search, `https://${target}`);

  // 复制 headers 并伪装
  const headers = new Headers(request.headers);
  headers.set("host", target);
  headers.set("referer", `https://${target}/`);
  headers.set("origin", `https://${target}`);
  headers.set("x-forwarded-host", target);

  return fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });
}

// 支持所有方法
export async function GET(req: Request) { return handle(req); }
export async function POST(req: Request) { return handle(req); }
export async function PUT(req: Request) { return handle(req); }
export async function DELETE(req: Request) { return handle(req); }
