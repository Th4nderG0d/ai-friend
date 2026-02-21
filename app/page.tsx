"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { PRESETS, starters } from "./constants";

export default function Home() {
	const [sysPrompt, setSysPrompt] = useState(PRESETS[0].prompt);
	const [showSettings, setShowSettings] = useState(false);
	const [model, setModel] = useState("gemini-2.0-flash");
	const [input, setInput] = useState("");

	const { messages, sendMessage, error, setMessages } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			body: { system: sysPrompt, model },
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
						{messages.length} messages
					</p>
				</div>
				<div className="flex gap-2 items-center">
					<select
						value={model}
						onChange={(e) => setModel(e.target.value)}
						className="bg-gray-800 text-xs rounded-lg px-2 py-1.5 border border-gray-700 outline-none">
						<option value="gpt-4o-mini">⚡ Gpt-4o-mini</option>
						<option value="gpt-5">🧠 Gpt 5</option>
					</select>
					<button
						onClick={() => setShowSettings(!showSettings)}
						className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition">
						⚙️
					</button>
					<button
						onClick={() => setMessages([])}
						className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold transition">
						+ New Chat
					</button>
				</div>
			</header>

			{showSettings && (
				<div className="border-b border-gray-800 px-4 py-3 bg-gray-900/50">
					<p className="text-xs font-bold text-gray-400 mb-2">
						AI Personality:
					</p>
					<div className="flex flex-wrap gap-1.5 mb-2">
						{PRESETS.map((p) => (
							<button
								key={p.label}
								onClick={() => {
									setSysPrompt(p.prompt);
									setMessages([]);
								}}
								className={
									"px-2 py-1 rounded-md text-xs transition " +
									(sysPrompt === p.prompt
										? "bg-blue-600 text-white"
										: "bg-gray-800 text-gray-400 hover:bg-gray-700")
								}>
								{p.label}
							</button>
						))}
					</div>
					<textarea
						value={sysPrompt}
						onChange={(e) => setSysPrompt(e.target.value)}
						rows={2}
						className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none resize-none"
					/>
				</div>
			)}

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-4 py-6">
				<div className="max-w-3xl mx-auto space-y-6">
					{starters.map((s, i) => (
						<button
							key={i}
							onClick={() => {
								// Set input value programmatically
								const el = document.querySelector("input");
								if (el) {
									const setter =
										Object.getOwnPropertyDescriptor(
											HTMLInputElement.prototype,
											"value"
										)?.set;
									setter?.call(el, s.text);
									el.dispatchEvent(
										new Event("input", { bubbles: true })
									);
								}
							}}
							className="flex items-center gap-2 px-4 py-3 bg-gray-800
      hover:bg-gray-700 rounded-xl text-sm text-left transition">
							<span>{s.icon}</span>
							<span className="text-gray-300">{s.text}</span>
						</button>
					))}
					{messages.map((message) => (
						<div key={message.id}>
							<div>
								{message.role === "user" ? "User: " : "AI: "}
							</div>
							<div>
								{message.parts.map((part, index) => {
									if (part.type === "text") {
										return (
											<>
												<span key={index}>
													{part.text}
												</span>
												<button
													onClick={() =>
														navigator.clipboard.writeText(
															part.text
														)
													}>
													📋 Copy
												</button>
											</>
										);
									}
									return null;
								})}
							</div>
						</div>
					))}
					{error && (
						<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs">
							⚠️ {error.message}
						</div>
					)}
					<div ref={endRef} />
				</div>
			</div>

			{/* Input Area */}
			<div className="border-t border-gray-800 px-4 py-4">
				<div className="max-w-3xl mx-auto flex gap-3">
					<form
						className="max-w-3xl mx-auto flex gap-3"
						onSubmit={onSend}>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Type your message..."
							className="flex-1 min-h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
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
