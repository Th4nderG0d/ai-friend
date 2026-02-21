import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = streamText({
		model: openai("gpt-4o-mini"),
		system: "You are a helpful AI assistant. Be concise and clear.",
		messages: await convertToModelMessages(messages),
	});

	return result.toTextStreamResponse();
}
