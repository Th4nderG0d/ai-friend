import { useState, useCallback, useRef } from "react";
import { ChatConfig, UseChatHandlerReturn, ChatMessage } from "../types";

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readTextStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	onToken: (token: string) => void,
	signal: AbortSignal
): Promise<void> {
	const decoder = new TextDecoder();
	while (!signal.aborted) {
		const { done, value } = await reader.read();
		if (done) break;
		const text = decoder.decode(value, { stream: true });
		onToken(text);
	}
}

async function readOllamaStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	onToken: (token: string) => void,
	signal: AbortSignal
): Promise<void> {
	const decoder = new TextDecoder();
	while (!signal.aborted) {
		const { done, value } = await reader.read();
		if (done) break;
		const text = decoder.decode(value, { stream: true });
		onToken(text);
	}
}


export function useChatHandler(
	configRef: React.RefObject<ChatConfig>
): UseChatHandlerReturn {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const clearError = useCallback(() => setError(null), []);

	const sendMessage = useCallback(
		async (text: string): Promise<void> => {
			const trimmed = text.trim();
			if (!trimmed || isLoading) return;

			// Abort any in-flight request
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			const config = configRef.current;

			// Add user message
			const userMsg: ChatMessage = {
				id: generateId(),
				role: "user",
				content: trimmed,
			};

			// Create placeholder assistant message
			const assistantId = generateId();
			const assistantMsg: ChatMessage = {
				id: assistantId,
				role: "assistant",
				content: "",
			};

			setMessages((prev) => [...prev, userMsg, assistantMsg]);
			setIsLoading(true);
			setError(null);

			try {
				// Build message history for API (use latest messages + new user msg)
				const history = [...messages, userMsg].slice(-20).map((m) => ({
					role: m.role,
					content: m.content,
				}));

				const res = await fetch("/api/chat", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						messages: history,
						system: config.system,
						model: config.model,
						provider: config.provider,
					}),
					signal: controller.signal,
				});

				if (!res.ok) {
					const body = await res.text();
					throw new Error(
						res.status === 429
							? "QUOTA_EXCEEDED"
							: body || `HTTP ${res.status}`
					);
				}

				if (!res.body) {
					throw new Error("No response body");
				}

				const reader = res.body.getReader();

				// Token callback: append to the assistant message
				const onToken = (token: string): void => {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId
								? { ...m, content: m.content + token }
								: m
						)
					);
				};

				// Both paths return plain text from route.ts
				if (config.provider === "ollama") {
					await readOllamaStream(reader, onToken, controller.signal);
				} else {
					await readTextStream(reader, onToken, controller.signal);
				}
			} catch (err: unknown) {
				if ((err as Error).name === "AbortError") return;
				const error =
					err instanceof Error ? err : new Error(String(err));
				setError(error);
				// Remove empty assistant message on error
				setMessages((prev) =>
					prev.filter(
						(m) => !(m.id === assistantId && m.content === "")
					)
				);
			} finally {
				setIsLoading(false);
			}
		},
		[messages, isLoading, configRef]
	);

	return { messages, isLoading, error, sendMessage, setMessages, clearError };
}
