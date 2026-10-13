import { t } from "../i18n";
/** Shared DeepSeek transport for the AI features (tarot reading, 问事). */
export const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
export const KEY_STORAGE = "suanming.deepseek.api-key";
/** Abort on the caller's controller or after 90 seconds. */
export const requestSignal = (controller: AbortController) => AbortSignal.any([controller.signal, AbortSignal.timeout(90_000)]);
export type ApiRequest = (url: string, options: RequestInit) => Promise<Response>;
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const httpErrors = (): Record<number, string> => ({
  400: t("DeepSeek 未接受请求，请稍后重试。", "DeepSeek did not accept the request. Try again later."),
  401: t("API Key 无效，请检查后重试。", "The API key is not valid. Check it and try again."),
  402: t("DeepSeek 余额不足，请在 DeepSeek 平台充值。", "Your DeepSeek balance is too low. Top up on the DeepSeek platform."),
  403: t("此 Key 没有访问权限，请检查 DeepSeek 账户设置。", "This key has no access. Check your DeepSeek account settings."),
  429: t("请求过于频繁，请稍后重试。", "Too many requests. Try again later."),
});

/**
 * One non-streaming chat completion. The key goes only to the fixed endpoint, in the Authorization header.
 * Returns the trimmed answer text, or throws an Error with a user-facing Chinese message.
 */
export async function chatCompletion(apiKey: string, messages: ChatMessage[], options: { maxTokens: number }, signal?: AbortSignal, request: ApiRequest = fetch): Promise<string> {
  const key = apiKey.trim();
  if (!key || /\s/.test(key)) throw new Error(t("请填写有效的 DeepSeek API Key，不能含空格或换行。", "Enter a valid DeepSeek API key, without spaces or line breaks."));
  let response: Response;
  try {
    response = await request(DEEPSEEK_ENDPOINT, {
      method: "POST", mode: "cors", credentials: "omit", redirect: "error", referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "deepseek-flash", messages, thinking: { type: "disabled" }, max_tokens: options.maxTokens, stream: false }),
      signal,
    });
  } catch {
    if (signal?.aborted) throw new Error(signal.reason?.name === "TimeoutError" ? t("请求超时，请稍后重试。", "The request timed out. Try again later.") : t("已取消本次请求。", "Request cancelled."));
    throw new Error(t("无法连接 DeepSeek，请检查网络和浏览器的跨域访问设置后重试。", "Could not reach DeepSeek. Check your network and your browser's cross-origin settings, then try again."));
  }
  if (!response.ok) throw new Error(httpErrors()[response.status] ?? t("DeepSeek 服务暂时不可用，请稍后重试。", "The DeepSeek service is unavailable right now. Try again later."));
  let data;
  try { data = await response.json(); }
  catch {
    if (signal?.aborted) throw new Error(t("请求已取消或超时，请重试。", "The request was cancelled or timed out. Try again."));
    throw new Error(t("DeepSeek 返回了无法读取的内容，请重试。", "DeepSeek returned something unreadable. Try again."));
  }
  const choice = data?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error(t("DeepSeek 没有返回内容，请重试。", "DeepSeek returned no content. Try again."));
  if (choice.finish_reason === "length") throw new Error(t("回答超过输出长度，未能完成。请精简问题后重试。", "The answer ran past the length limit and was cut off. Shorten the question and try again."));
  if (choice.finish_reason !== "stop") throw new Error(t("DeepSeek 未完成回答，请重试。", "DeepSeek did not finish the answer. Try again."));
  return content.trim();
}
