"use client";

import {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
	type FormEvent,
	type ChangeEvent,
	JSX,
} from "react";
import { MODELS, PRESETS, PROVIDER_BADGE, starters } from "./constants";
import {
	useChatHandler,
} from "./hooks/useChatHandler";
import { ModelOption, Starter, Preset, ChatMessage, ChatConfig } from "./types";

/* ── Helpers ────────────────────────────────────────────────── */

function findModel(key: string): ModelOption {
	return MODELS.find((m) => m.value === key) ?? MODELS[0];
}

/* ── Subcomponents ─────────────────────────────────────────── */

function StatusBanner({
	isOnline,
	quotaExceeded,
	onRetry,
}: {
	isOnline: boolean;
	quotaExceeded: boolean;
	onRetry: () => void;
}) {
	if (isOnline && !quotaExceeded) return null;
	const offline = !isOnline;

	return (
		<div
			className={`px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2 ${
				offline
					? "bg-amber-500/10 text-amber-400 border-b border-amber-500/15"
					: "bg-orange-500/10 text-orange-400 border-b border-orange-500/15"
			}`}>
			<span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
			{offline
				? "You're offline — using local Ollama models"
				: "OpenAI quota exceeded — switched to local Ollama"}
			{quotaExceeded && isOnline && (
				<button
					className="ml-2 px-2 py-0.5 rounded bg-orange-500/15 hover:bg-orange-500/25 transition text-orange-300"
					onClick={onRetry}>
					Retry OpenAI
				</button>
			)}
		</div>
	);
}

function ConnectionDot({ isOnline }: { isOnline: boolean }) {
	return (
		<span
			className="relative flex h-2.5 w-2.5"
			title={isOnline ? "Online" : "Offline"}>
			{isOnline && (
				<span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
			)}
			<span
				className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
					isOnline ? "bg-green-500" : "bg-amber-500"
				}`}
			/>
		</span>
	);
}

function MessageBubble({ message }: { message: ChatMessage }) {
	const isUser = message.role === "user";
	const [copied, setCopied] = useState<boolean>(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(message.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, [message.content]);

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			{!isUser && (
				<div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-600 to-blue-500 flex items-center justify-center text-[11px] mr-2.5 mt-1 shrink-0 shadow-lg shadow-violet-500/20">
					AI
				</div>
			)}
			<div
				className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
					isUser
						? "bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20"
						: "bg-gray-800/80 border border-gray-700/50 text-gray-100 shadow-lg shadow-black/20"
				}`}>
				<div className="group relative">
					<span className="whitespace-pre-wrap">
						{message.content}
					</span>
					{!isUser && message.content && (
						<button
							className="ml-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all text-xs"
							onClick={handleCopy}
							aria-label="Copy message">
							{copied ? "✓ Copied" : "📋"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

function TypingIndicator() {
	return (
		<div className="flex justify-start">
			<div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-600 to-blue-500 flex items-center justify-center text-[11px] mr-2.5 mt-1 shrink-0 shadow-lg shadow-violet-500/20">
				AI
			</div>
			<div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg shadow-black/20">
				<div className="flex gap-1.5 items-center h-5">
					<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:0ms]" />
					<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:150ms]" />
					<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:300ms]" />
				</div>
			</div>
		</div>
	);
}

function StarterChips({
	starters,
	onSelect,
}: {
	starters: Starter[];
	onSelect: (text: string) => void;
}) {
	return (
		<div className="flex flex-col items-center gap-4 py-10 px-4">
			<div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center text-2xl shadow-xl shadow-blue-600/20">
				🤖
			</div>
			<div className="text-center">
				<h2 className="text-lg font-semibold text-gray-200">
					How can I help you today?
				</h2>
				<p className="text-sm text-gray-500 mt-1">
					Pick a starter or type your own message
				</p>
			</div>
			<div className="flex flex-wrap gap-2 justify-center mt-2 max-w-2xl">
				{starters.map((s: Starter, i: number) => (
					<button
						key={i}
						onClick={() => onSelect(s.text)}
						className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700/50 hover:border-gray-600 rounded-xl text-sm text-gray-300 hover:text-white transition-all">
						<span>{s.icon}</span>
						<span>{s.text}</span>
					</button>
				))}
			</div>
		</div>
	);
}

function SettingsPanel({
	sysPrompt,
	onPromptChange,
	onPresetSelect,
}: {
	sysPrompt: string;
	onPromptChange: (val: string) => void;
	onPresetSelect: (preset: Preset) => void;
}) {
	return (
		<div className="border-b border-gray-800/80 px-5 py-4 bg-gray-900/40 backdrop-blur-sm">
			<p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
				Personality Preset
			</p>
			<div className="flex flex-wrap gap-1.5 mb-3">
				{(PRESETS as Preset[]).map((p) => (
					<button
						key={p.label}
						onClick={() => onPresetSelect(p)}
						className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
							sysPrompt === p.prompt
								? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
								: "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
						}`}>
						{p.label}
					</button>
				))}
			</div>
			<textarea
				value={sysPrompt}
				onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
					onPromptChange(e.target.value)
				}
				rows={2}
				placeholder="Custom system prompt..."
				className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-3 py-2.5 text-xs text-gray-300 outline-none resize-none focus:border-blue-500/50 transition placeholder:text-gray-600"
			/>
		</div>
	);
}

/* ── Main Component ────────────────────────────────────────── */

export default function Home(): JSX.Element {
	const [sysPrompt, setSysPrompt] = useState<string>(
		(PRESETS as Preset[])[0].prompt
	);
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [modelKey, setModelKey] = useState<string>("gpt-4o-mini");
	const [input, setInput] = useState<string>("");
	const [isOnline, setIsOnline] = useState<boolean>(true);
	const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

	const selected: ModelOption = findModel(modelKey);
	const badge = PROVIDER_BADGE[selected.provider];

	/* ── Config ref for the custom hook ──────────────────────── */

	const configRef = useRef<ChatConfig>({
		system: sysPrompt,
		model: selected.value,
		provider: selected.provider,
	});

	useEffect(() => {
		configRef.current = {
			system: sysPrompt,
			model: selected.value,
			provider: selected.provider,
		};
	}, [sysPrompt, selected.value, selected.provider]);

	/* ── Custom chat hook (handles both OpenAI & Ollama) ─────── */

	const { messages, isLoading, error, sendMessage, setMessages, clearError } =
		useChatHandler(configRef);

	/* ── Online / offline tracking ───────────────────────────── */

	useEffect(() => {
		const update = () => setIsOnline(navigator.onLine);
		update();
		window.addEventListener("online", update);
		window.addEventListener("offline", update);
		return () => {
			window.removeEventListener("online", update);
			window.removeEventListener("offline", update);
		};
	}, []);

	useEffect(() => {
		if (!isOnline && selected.provider === "openai") {
			setModelKey("llama3.2");
		}
	}, [isOnline, selected.provider]);

	/* ── Auto-fallback on quota exceeded ─────────────────────── */

	useEffect(() => {
		if (
			error?.message?.includes("QUOTA_EXCEEDED") ||
			error?.message?.includes("429")
		) {
			setQuotaExceeded(true);
			if (selected.provider === "openai") setModelKey("llama3.2");
		}
	}, [error, selected.provider]);

	/* ── Auto-scroll ─────────────────────────────────────────── */

	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	/* ── Handlers ────────────────────────────────────────────── */

	const onSend = useCallback(
		(e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const trimmed = input.trim();
			if (!trimmed) return;
			sendMessage(trimmed);
			setInput("");
		},
		[input, sendMessage]
	);

	const handleRetry = useCallback(() => {
		setQuotaExceeded(false);
		clearError();
		setModelKey("gpt-4o-mini");
	}, [clearError]);

	const handlePresetSelect = useCallback(
		(preset: Preset) => {
			setSysPrompt(preset.prompt);
			setMessages([]);
		},
		[setMessages]
	);

	const handleModelChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			setModelKey(e.target.value);
		},
		[]
	);

	const toggleSettings = useCallback(() => {
		setShowSettings((prev) => !prev);
	}, []);

	const handleNewChat = useCallback(() => {
		setMessages([]);
		clearError();
	}, [setMessages, clearError]);

	const handleStarterSelect = useCallback((text: string) => {
		setInput(text);
	}, []);

	const hasMessages = messages.length > 0;

	// Show typing indicator: loading AND the last assistant message is empty (waiting for first token)
	const showTyping = useMemo<boolean>(() => {
		if (!isLoading) return false;
		const last = messages[messages.length - 1];
		return !last || last.role === "user" || last.content === "";
	}, [isLoading, messages]);

	return (
		<div className="flex flex-col h-screen bg-gray-950 text-white">
			<StatusBanner
				isOnline={isOnline}
				quotaExceeded={quotaExceeded}
				onRetry={handleRetry}
			/>

			{/* ── Header ── */}
			<header className="px-5 py-3.5 border-b border-gray-800/80 flex items-center gap-3 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
				<div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center text-base shadow-lg shadow-blue-600/20">
					🤖
				</div>
				<div className="mr-auto">
					<h1 className="font-bold text-sm">AI Chat</h1>
					<div className="flex items-center gap-1.5">
						<ConnectionDot isOnline={isOnline} />
						<span className="text-[11px] text-gray-500">
							{isOnline ? "Online" : "Offline"} ·{" "}
							{messages.length} msgs
						</span>
					</div>
				</div>

				<div className="flex items-center gap-1.5">
					<span
						className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.className}`}>
						{badge.label}
					</span>
					<select
						value={modelKey}
						onChange={handleModelChange}
						className="bg-gray-800/80 text-xs rounded-lg px-2.5 py-1.5 border border-gray-700/50 outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer">
						<optgroup label="☁️ Cloud (OpenAI)">
							{MODELS.filter((m) => m.provider === "openai").map(
								(m) => (
									<option
										key={m.value}
										value={m.value}
										disabled={!isOnline}>
										{m.label} — {m.description}
										{!isOnline ? " (unavailable)" : ""}
									</option>
								)
							)}
						</optgroup>
						<optgroup label="💻 Local (Ollama)">
							{MODELS.filter((m) => m.provider === "ollama").map(
								(m) => (
									<option key={m.value} value={m.value}>
										{m.label} — {m.description}
									</option>
								)
							)}
						</optgroup>
					</select>
				</div>

				<button
					onClick={toggleSettings}
					className={`px-2.5 py-1.5 rounded-lg text-xs transition border ${
						showSettings
							? "bg-blue-600/15 border-blue-500/30 text-blue-400"
							: "bg-gray-800/80 border-gray-700/50 text-gray-400 hover:bg-gray-700"
					}`}
					aria-label="Toggle settings">
					⚙️
				</button>
				<button
					onClick={handleNewChat}
					className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold transition shadow-md shadow-blue-600/20">
					+ New
				</button>
			</header>

			{showSettings && (
				<SettingsPanel
					sysPrompt={sysPrompt}
					onPromptChange={setSysPrompt}
					onPresetSelect={handlePresetSelect}
				/>
			)}

			{/* ── Messages area ── */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-3xl mx-auto px-4 py-6">
					{!hasMessages && !isLoading ? (
						<StarterChips
							starters={starters as Starter[]}
							onSelect={handleStarterSelect}
						/>
					) : (
						<div className="space-y-5">
							{messages.map((msg: ChatMessage) => (
								<MessageBubble key={msg.id} message={msg} />
							))}
							{showTyping && <TypingIndicator />}
						</div>
					)}
					{error && (
						<div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-xs flex items-center gap-2">
							<span className="text-base">⚠️</span>
							<span>{error.message}</span>
						</div>
					)}
					<div ref={endRef} />
				</div>
			</div>

			{/* ── Input ── */}
			<div className="border-t border-gray-800/80 px-4 py-3.5 bg-gray-950/80 backdrop-blur-md">
				<form
					className="max-w-3xl mx-auto flex gap-2.5"
					onSubmit={onSend}>
					<input
						value={input}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setInput(e.target.value)
						}
						placeholder={
							isOnline
								? "Type a message..."
								: "Type a message (offline → Ollama)..."
						}
						className="flex-1 min-h-11 bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition placeholder:text-gray-600"
						autoFocus
					/>
					<button
						type="submit"
						disabled={!input.trim() || isLoading}
						className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 rounded-xl px-5 py-2.5 text-sm font-semibold transition shadow-lg shadow-blue-600/20 disabled:shadow-none">
						{isLoading ? "..." : "Send ↑"}
					</button>
				</form>
				<p className="text-center text-[10px] text-gray-600 mt-2">
					{selected.label} ·{" "}
					{selected.provider === "ollama"
						? "Running locally"
						: "Cloud API"}
				</p>
			</div>
		</div>
	);
}
