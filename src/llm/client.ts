/** Shared DeepSeek transport for the AI features (tarot reading, 问事). */
export const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
export const KEY_STORAGE = "suanming.deepseek.api-key";
/** Abort on the caller's controller or after 90 seconds. */
export const requestSignal = (controller: AbortController) => AbortSignal.any([controller.signal, AbortSignal.timeout(90_000)]);
export type ApiRequest = (url: string, options: RequestInit) => Promise<Response>;
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const HTTP_ERRORS: Record<number, string> = {
  400: "DeepSeek 未接受请求，请稍后重试。",
  401: "API Key 无效，请检查后重试。",
  402: "DeepSeek 余额不足，请在 DeepSeek 平台充值。",
  403: "此 Key 没有访问权限，请检查 DeepSeek 账户设置。",
  429: "请求过于频繁，请稍后重试。",
};

/**
 * One non-streaming chat completion. The key goes only to the fixed endpoint, in the Authorization header.
 * Returns the trimmed answer text, or throws an Error with a user-facing Chinese message.
 */
export async function chatCompletion(apiKey: string, messages: ChatMessage[], options: { maxTokens: number }, signal?: AbortSignal, request: ApiRequest = fetch): Promise<string> {
  const key = apiKey.trim();
  if (!key || /\s/.test(key)) throw new Error("请填写有效的 DeepSeek API Key，不能含空格或换行。");
  let response: Response;
  try {
    response = await request(DEEPSEEK_ENDPOINT, {
      method: "POST", mode: "cors", credentials: "omit", redirect: "error", referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "deepseek-flash", messages, thinking: { type: "disabled" }, max_tokens: options.maxTokens, stream: false }),
      signal,
    });
  } catch {
    if (signal?.aborted) throw new Error(signal.reason?.name === "TimeoutError" ? "请求超时，请稍后重试。" : "已取消本次请求。");
    throw new Error("无法连接 DeepSeek，请检查网络和浏览器的跨域访问设置后重试。");
  }
  if (!response.ok) throw new Error(HTTP_ERRORS[response.status] ?? "DeepSeek 服务暂时不可用，请稍后重试。");
  let data;
  try { data = await response.json(); }
  catch {
    if (signal?.aborted) throw new Error("请求已取消或超时，请重试。");
    throw new Error("DeepSeek 返回了无法读取的内容，请重试。");
  }
  const choice = data?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("DeepSeek 没有返回内容，请重试。");
  if (choice.finish_reason === "length") throw new Error("回答超过输出长度，未能完成。请精简问题后重试。");
  if (choice.finish_reason !== "stop") throw new Error("DeepSeek 未完成回答，请重试。");
  return content.trim();
}
