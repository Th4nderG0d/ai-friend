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
