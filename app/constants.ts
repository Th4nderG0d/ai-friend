import { ModelOption, Provider } from "./types";

export const PRESETS = [
	{ label: "💬 General", prompt: "You are a helpful, concise AI assistant." },
	{
		label: "💻 Coder",
		prompt: "You are an expert programmer. Always provide code examples with TypeScript when possible. Explain your code.",
	},
	{
		label: "📝 Writer",
		prompt: "You are a writing coach. Help improve clarity, grammar, and style. Be constructive.",
	},
	{
		label: "🧒 ELI5",
		prompt: "Explain everything simply, like the user is 5 years old. Use fun analogies.",
	},
	{
		label: "🎯 Interviewer",
		prompt: "You are a senior tech interviewer. Help practice software engineering interviews. Ask follow-ups.",
	},
];

// Starter prompts that users can click to begin
export const starters = [
  { icon: "💻", text: "Write a React custom hook for API calls" },
  { icon: "🧠", text: "Explain how DNS works step by step" },
  { icon: "📝", text: "Review my code for best practices" },
  { icon: "🎯", text: "Give me 5 TypeScript interview questions" },
];

export const MODELS: ModelOption[] = [
	{
		value: "gpt-4o-mini",
		label: "GPT-4o Mini",
		provider: "openai",
		description: "Fast & affordable",
	},
	{
		value: "gpt-5",
		label: "GPT-5",
		provider: "openai",
		description: "Most capable",
	},
	{
		value: "llama3.2",
		label: "Llama 3.2",
		provider: "ollama",
		description: "Local · Meta",
	},
	{
		value: "mistral",
		label: "Mistral",
		provider: "ollama",
		description: "Local · Mistral AI",
	},
	{
		value: "gemma3",
		label: "Gemma 3",
		provider: "ollama",
		description: "Local · Google",
	},
];

export 
const PROVIDER_BADGE: Record<Provider, { label: string; className: string }> = {
	openai: {
		label: "Cloud",
		className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
	},
	ollama: {
		label: "Local",
		className: "bg-violet-500/15 text-violet-400 border-violet-500/20",
	},
};