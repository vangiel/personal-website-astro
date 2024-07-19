export interface ChatbotPayload {
	message: RoleScopedChatInput;
	config?: ChatbotConfig;
}

export interface ChatbotConfig {
	model: BaseAiTextGenerationModels;
	systemMessage?: string;
}
