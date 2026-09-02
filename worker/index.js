// Cloudflare Worker：代理 DeepSeek 调用，支持人格设定与联网搜索。
// - DEEPSEEK_API_KEY：必填，存在 Worker secret 中。
// - TAVILY_API_KEY：可选，配置后助手可联网搜索（function calling）。
const SEARCH_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_web",
      description:
        "当站内资料不足以回答用户问题，或需要获取实时/最新信息时，搜索互联网。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索关键词" },
        },
        required: ["query"],
      },
    },
  },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: CORS });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return reply("请求格式有误。");
    }

    try {
      const answer = await chat(body, env);
      return reply(answer);
    } catch (e) {
      console.error(e);
      return reply("AI 服务暂时不可用，请稍后再试。");
    }
  },
};

function reply(text) {
  return new Response(JSON.stringify({ reply: text }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function buildSystem(persona) {
  const base = "你是这个个人网站右下角的 AI 助手。";
  const duties =
    "你的职责：\n" +
    "1. 帮助访客了解网站作者、找到感兴趣的文章和作品。\n" +
    "2. 基于「站内资料」回答关于本网站内容的问题，引用时说明是哪篇内容。\n" +
    "3. 如果站内资料不足以回答，可联网搜索补充（若可用），并说明信息来源。\n" +
    "4. 你可以和访客闲聊、聊作者、聊技术，回答要自然友好。\n";
  const style = "请用自然、友好的中文回答，简洁清楚，避免冗长。";
  if (persona) {
    return `${base}\n\n【你的人设】\n${persona}\n\n${duties}\n${style}`;
  }
  return `${base}\n${duties}\n${style}`;
}

async function callDeepSeek(env, messages, tools) {
  const base = (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const payload = {
    model: env.DEEPSEEK_MODEL || "deepseek-chat",
    messages,
    temperature: 0.7,
    max_tokens: 800,
  };
  if (tools) payload.tools = tools;

  const resp = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`deepseek ${resp.status}`);
  return resp.json();
}

async function searchWeb(env, query) {
  const resp = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.TAVILY_API_KEY,
      query,
      max_results: 5,
      search_depth: "basic",
    }),
  });
  if (!resp.ok) throw new Error(`tavily ${resp.status}`);
  const data = await resp.json();
  const results = (data.results || []).slice(0, 5);
  if (results.length === 0) return "（未找到相关搜索结果）";
  return results
    .map((r, i) => `${i + 1}. ${r.title}\n${r.content || r.snippet || ""}`)
    .join("\n\n");
}

async function chat(body, env) {
  const { message = "", history = [], context = "", persona = "" } = body;

  const messages = [{ role: "system", content: buildSystem(persona) }];
  for (const m of history.slice(-10)) {
    if (m.role === "user" || m.role === "assistant") messages.push(m);
  }
  const userContent = context
    ? `以下是站内资料（可能相关）：\n\n${context}\n\n访客的问题：${message}\n\n请结合站内资料回答。`
    : message;
  messages.push({ role: "user", content: userContent });

  const canSearch = !!env.TAVILY_API_KEY;

  const data1 = await callDeepSeek(env, messages, canSearch ? SEARCH_TOOLS : undefined);
  const msg1 = data1.choices?.[0]?.message || {};

  // 模型请求联网搜索，且已配置搜索 key
  const toolCalls = msg1.tool_calls || [];
  if (canSearch && toolCalls.length > 0) {
    const call = toolCalls[0];
    let query = message;
    try {
      query = JSON.parse(call.function?.arguments || "{}").query || message;
    } catch {
      /* ignore */
    }
    const results = await searchWeb(env, query);

    messages.push({
      role: "assistant",
      content: msg1.content || "",
      tool_calls: toolCalls,
    });
    messages.push({
      role: "tool",
      tool_call_id: call.id,
      content: `互联网搜索结果：\n${results}`,
    });

    const data2 = await callDeepSeek(env, messages, undefined);
    return (data2.choices?.[0]?.message?.content || "").trim();
  }

  return (msg1.content || "").trim();
}
