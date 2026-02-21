import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

export async function POST(req: Request) {
	try {
		const { messages, system, model } = await req.json();

		if (!messages?.length) {
			return new Response("Messages required", { status: 400 });
		}

		// Keep last 20 messages to avoid token limits
		const recent = messages.slice(-20);

		const result = streamText({
			model: openai(model || "gpt-4o-mini"),
			system:
				system ||
				"You are a helpful AI assistant. Be concise and clear.",
			messages: await convertToModelMessages(recent),
			maxOutputTokens: 2048,
		});

		return result.toTextStreamResponse();
	} catch (err) {
		console.error("API error:", err);
		return new Response("Something went wrong", { status: 500 });
	}
}
