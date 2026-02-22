import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

/* ── Types ─────────────────────────────────────────────────── */

type Provider = "openai" | "ollama";

interface ChatRequestBody {
	messages: Array<{
		role: string;
		content: string | Array<{ text: string }>;
	}>;
	system?: string;
	model?: string;
	provider?: Provider;
}

interface OllamaMessage {
	role: string;
	content: string;
}

interface OllamaStreamChunk {
	message?: { content: string };
	done: boolean;
}

/* ── Ollama streaming (plain text output) ──────────────────── */

async function streamOllama(
	messages: ChatRequestBody["messages"],
	system: string,
	model: string
): Promise<Response> {
	const ollamaBase: string = "http://localhost:11434";

	const ollamaMessages: OllamaMessage[] = [
		{ role: "system", content: system },
		...messages.map((m) => ({
			role: m.role,
			content:
				typeof m.content === "string"
					? m.content
					: m.content?.map((p) => p.text).join("") ?? "",
		})),
	];

	const res: Response = await fetch(`${ollamaBase}/api/chat`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ model, messages: ollamaMessages, stream: true }),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Ollama error ${res.status}: ${body}`);
	}

	const reader: ReadableStreamDefaultReader<Uint8Array> =
		res.body!.getReader();
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		async pull(controller: ReadableStreamDefaultController<Uint8Array>) {
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					controller.close();
					return;
				}

				const chunk: string = decoder.decode(value, { stream: true });

				for (const line of chunk.split("\n").filter(Boolean)) {
					try {
						const json: OllamaStreamChunk = JSON.parse(line);

						// Emit plain text — same format as toTextStreamResponse()
						if (json.message?.content) {
							controller.enqueue(
								encoder.encode(json.message.content)
							);
						}

						if (json.done) {
							controller.close();
							return;
						}
					} catch(err) {
						const status =
							(err as { status?: number }).status ??
							(err as { response?: { status?: number } }).response
								?.status ??
							500;

						const msg: string =err?.response?.errorMessage ||  "Something went wrong";
						return new Response(msg, { status });
					}
				}
			}
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}

/* ── Route handler ─────────────────────────────────────────── */

export async function POST(req: Request): Promise<Response> {
	try {
		const { messages, system, model, provider }: ChatRequestBody =
			await req.json();

		if (!messages?.length) {
			return new Response("Messages required", { status: 400 });
		}

		const recent = messages.slice(-20);
		const sysPrompt: string =
			system || "You are a helpful AI assistant. Be concise and clear.";

		// Both paths return plain text streams — useChat parses them the same way
		if (provider === "ollama") {
			return await streamOllama(recent, sysPrompt, model || "llama3.2");
		}

		const result = streamText({
			model: openai(model || "gpt-4o-mini"),
			system: sysPrompt,
			messages: await convertToModelMessages(recent),
			maxOutputTokens: 2048,
		});

		return result.toTextStreamResponse();
	} catch (err: unknown) {
		console.error("API error:", err);

		const status =
			(err as { status?: number }).status ??
			(err as { response?: { status?: number } }).response?.status ??
			500;

		const msg: string =
			status === 429 ? "QUOTA_EXCEEDED" : "Something went wrong";
		return new Response(msg, { status });
	}
}
