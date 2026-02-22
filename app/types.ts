export type Provider = "openai" | "ollama";

export interface ModelOption {
	value: string;
	label: string;
	provider: Provider;
	description: string;
}

export interface Preset {
	label: string;
	prompt: string;
}

export interface Starter {
	icon: string;
	text: string;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
}

export interface ChatConfig {
	system: string;
	model: string;
	provider: Provider;
}

export interface UseChatHandlerReturn {
	messages: ChatMessage[];
	isLoading: boolean;
	error: Error | null;
	sendMessage: (text: string) => Promise<void>;
	setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
	clearError: () => void;
}
