export const preferredRegion = ["sin1", "syd1"];
export const runtime = "nodejs";

const pickHeaders = (headers, keys) => {
  const picked = new Headers();
  picked.set("accept", "text/event-stream");
  for (const key of headers.keys()) {
    if (keys.some((k) => (typeof k === "string" ? k === key : k.test(key)))) {
      const value = headers.get(key);
      if (typeof value === "string") {
        picked.set(key, value);
      }
    }
  }
  // picked.set('accept-encoding', 'gzip, deflate, br');
  picked.set("accept-language", "zh-CN,zh-Hans;q=0.9");
  picked.set("content-type", "application/json");
  picked.set("cache-control", "no-cache");
  picked.set("authorization", `Bearer ${process.env.GPT_TOKEN}`);
  return picked;
};

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "*",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-max-age": "86400",
};

const streamToString = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
};

const rejectResponse = (status) =>
  new Response(null, {
    status: status,
  });

const isAPIPath = (pathname, subPath) => {
  return (
    pathname.includes(`/backend-api/${subPath}`) ||
    pathname.includes(`/chatgpt/${subPath}`)
  );
};

const handleRequest = async (req) => {
  const { pathname } = req.nextUrl ? req.nextUrl : new URL(req.url);
  // cors, will remove this after the migration
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }
  // const { pathname } = req.nextUrl ? req.nextUrl : new URL(req.url);
  // if (!isAPIPath(pathname, "")) {
  //   return rejectResponse(404);
  // }

  // todo: check auth
  if (!req.headers.get("authorization") && !pathname.includes("login")) {
    return rejectResponse(401);
  }

  const url = new URL(pathname, `https://${process.env.GPT_DOMAIN}`).href; // self-hosted api
  const headers = pickHeaders(req.headers, [
    "content-type",
    "accept",
    "user-agent",
  ]);

  let requestInit = { method: req.method, headers, duplex: "half" };
  let bodyStreamCopy = new ReadableStream();
  if (req.body) {
    const [bodyStream, bodyStreamClone] = req.body?.tee();
    bodyStreamCopy = bodyStreamClone;
    requestInit.body = bodyStream;
  }
  const res = await fetch(url, requestInit);
  const responseHeaders = {
    ...CORS_HEADERS,
    "content-type": "application/json",
  };
  if (isAPIPath(pathname, "conversation")) {
    responseHeaders["content-type"] = "text/event-stream";
    try {
      // log gpt message body and headers
      const data = await streamToString(bodyStreamCopy);
      const body = JSON.parse(data);
      const clientIp = req.headers.get("cf-connecting-ip");
      const city = req.headers.get("cf-ipcity");
      const authorization = req.headers.get("authorization");
      console.log(
        [res.status],
        clientIp,
        city,
        authorization,
        body.messages[0]?.content?.parts[0]
      );
    } catch (error) {
      console.error(error);
      return rejectResponse(500);
    }
  }

  return new Response(res.body, {
    headers: { ...responseHeaders, via: "1.1 gpt.lawrenceli.me" },
    status: res.status,
  });
};

export async function GET(request) {
  return handleRequest(request);
}
export const POST = handleRequest;
export const OPTIONS = handleRequest;
