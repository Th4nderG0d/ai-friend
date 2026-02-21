"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

export default function Home() {
	const [input, setInput] = useState("");
	const { messages, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});

	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const onSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;
		sendMessage({ text: input });
		setInput("");
	};

	return (
		<div className="flex flex-col h-screen bg-gray-950 text-white">
			{/* Header */}
			<header className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
				<div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
					🤖
				</div>
				<div>
					<h1 className="font-bold">AI Chat Assistant</h1>
					<p className="text-xs text-gray-500">
						Gemini 2.0 Flash • Free
					</p>
				</div>
			</header>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-4 py-6">
				<div className="max-w-3xl mx-auto space-y-6">
					{messages.length === 0 && (
						<div className="text-center py-20">
							<p className="text-4xl mb-4">👋</p>
							<h2 className="text-xl font-bold mb-2">Welcome!</h2>
							<p className="text-gray-500">
								Type a message below to start chatting with AI.
							</p>
						</div>
					)}
					{messages.map((message) => (
						<div key={message.id}>
							<div>
								{message.role === "user" ? "User: " : "AI: "}
							</div>
							<div>
								{message.parts.map((part, index) => {
									if (part.type === "text") {
										return (
											<span key={index}>{part.text}</span>
										);
									}
									return null;
								})}
							</div>
						</div>
					))}
					<div ref={endRef} />
				</div>
			</div>

			{/* Input Area */}
			<div className="border-t border-gray-800 px-4 py-4">
				<div className="max-w-3xl mx-auto flex gap-3">
					<form onSubmit={onSend}>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Type your message..."
							className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
							autoFocus
						/>
						<button
							type={"submit"}
							disabled={!input.trim()}
							className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-xl px-5 py-3 font-semibold transition">
							{"Send ↑"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
