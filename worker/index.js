// Cloudflare Worker：代理 DeepSeek 调用（Responses API），支持人格设定与原生联网搜索。
// - DEEPSEEK_API_KEY：必填，存在 Worker secret 中。
// - 联网搜索由 DeepSeek 服务端内置 web_search 工具完成，无需第三方搜索服务。

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
    "3. 如果站内资料不足以回答，或需要实时/最新信息，可联网搜索补充，并说明信息来源。\n" +
    "4. 你可以和访客闲聊、聊作者、聊技术，回答要自然友好。\n";
  const style = "请用自然、友好的中文回答，简洁清楚，避免冗长。";
  if (persona) {
    return `${base}\n\n【你的人设】\n${persona}\n\n${duties}\n${style}`;
  }
  return `${base}\n${duties}\n${style}`;
}

async function callDeepSeek(env, instructions, input) {
  const base = (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const payload = {
    model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    instructions,
    input,
    // 内置联网搜索工具，模型按需调用（tool_choice 默认 auto）
    tools: [{ type: "web_search" }],
    // 关闭思考模式，聊天响应更快（无需 chain-of-thought）
    reasoning: { effort: "none" },
    max_output_tokens: 800,
    temperature: 0.7,
  };

  const resp = await fetch(`${base}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`deepseek ${resp.status}: ${errText.slice(0, 200)}`);
  }
  return resp.json();
}

// 从 Responses API 的 output 里提取 assistant 的最终回答文本。
// 带联网搜索时，output 里会有 phase=commentary 的中间叙述，只取 final_answer。
function extractText(data) {
  const output = data?.output || [];
  let text = "";
  for (const item of output) {
    if (item.type !== "message") continue;
    if (item.phase && item.phase !== "final_answer") continue;
    if (Array.isArray(item.content)) {
      for (const part of item.content) {
        if (part.type === "output_text") text += part.text;
      }
    }
  }
  return text.trim();
}

async function chat(body, env) {
  const { message = "", history = [], context = "", persona = "" } = body;

  const input = [];
  for (const m of history.slice(-10)) {
    if (m.role === "user" || m.role === "assistant") {
      input.push({ role: m.role, content: m.content });
    }
  }
  const userContent = context
    ? `以下是站内资料（可能相关）：\n\n${context}\n\n访客的问题：${message}\n\n请结合站内资料回答；若站内资料不足以回答或需要实时信息，请联网搜索。`
    : message;
  input.push({ role: "user", content: userContent });

  const data = await callDeepSeek(env, buildSystem(persona), input);
  return extractText(data);
}
