// Minimal OpenAI-compatible chat client. DeepSeek, Google Gemini (via its
// OpenAI-compatible endpoint) and OpenAI all speak the same /chat/completions
// shape, so a single adapter covers every supported provider.

type Provider = "gemini" | "deepseek" | "openai";

interface ProviderDefaults {
  baseUrl: string;
  model: string;
  supportsJsonMode: boolean;
}

const PROVIDER_DEFAULTS: Record<Provider, ProviderDefaults> = {
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-1.5-flash",
    supportsJsonMode: true,
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
    supportsJsonMode: true,
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    supportsJsonMode: true,
  },
};

export class LLMConfigError extends Error {}
export class LLMRequestError extends Error {}

interface ResolvedConfig extends ProviderDefaults {
  apiKey: string;
}

function resolveConfig(): ResolvedConfig {
  const providerRaw = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();
  if (!(providerRaw in PROVIDER_DEFAULTS)) {
    throw new LLMConfigError(
      `Unknown LLM_PROVIDER "${providerRaw}". Use one of: ${Object.keys(
        PROVIDER_DEFAULTS,
      ).join(", ")}.`,
    );
  }
  const provider = providerRaw as Provider;
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new LLMConfigError(
      "LLM_API_KEY is not set. Copy .env.example to .env and add a key.",
    );
  }
  const defaults = PROVIDER_DEFAULTS[provider];
  return {
    apiKey,
    baseUrl: process.env.LLM_BASE_URL || defaults.baseUrl,
    model: process.env.LLM_MODEL || defaults.model,
    supportsJsonMode: defaults.supportsJsonMode,
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Sends a chat completion request and returns the assistant's text content.
export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const config = resolveConfig();

  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: 0.3,
  };
  if (config.supportsJsonMode) {
    body.response_format = { type: "json_object" };
  }

  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new LLMRequestError(
      `Could not reach the AI provider: ${(err as Error).message}`,
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new LLMRequestError(
      `AI provider returned ${res.status}. ${detail.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new LLMRequestError("AI provider returned an empty response.");
  }
  return content;
}
