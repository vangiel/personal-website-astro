import type { ChatbotConfig, ChatbotPayload } from "@/types/chatbot";
import type { APIContext } from "astro";
export const prerender = false;

let messagesFromUser: RoleScopedChatInput[] = [];
let config: ChatbotConfig = {
	model: "@cf/meta/llama-3-8b-instruct-awq", // Default model
};

export async function POST({ request }: APIContext) {
	messagesFromUser = [{ role: "system", content: "You are a friendly assistant" }];
	const payloads = (await request.json()) as ChatbotPayload[];

	messagesFromUser = messagesFromUser.concat(payloads.map((p) => p.message));
	config = payloads[0].config || config;

	return new Response(null, { status: 204 });
}

export async function GET({ locals }: APIContext) {
	const { AI } = locals.runtime.env;
	const messages = messagesFromUser;

	const stream = (await AI.run(config.model, {
		stream: true,
		messages,
	})) as ReadableStream<Uint8Array>;

	return new Response(stream, {
		headers: { "content-type": "text/event-stream" },
	});
}
