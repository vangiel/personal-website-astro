import { $ } from "@/lib/dom-selector";
import { marked } from "marked";

const date = new Date();

export function initChat(mode: "general" | "rag") {
	const $messages = $("#messages") as HTMLUListElement;
	let [messages, storedMode] = retrieveMessages();
	let initMessage: String;
	if (messages.length === 0 || storedMode != mode) {
		messages = [];
		sessionStorage.removeItem("messages");
		sessionStorage.removeItem("mode");
		if (mode === "general") {
			initMessage =
				"Hi, welcome to my chat! I am a friendly assistant. Go ahead and send me a message. 😄";
		} else {
			initMessage = "Ask me anything about Daniel.";
		}

		messages.push({
			role: "assistant",
			content: initMessage,
		});
		storeMessages(messages, mode);
	}
	$messages.innerHTML = "";
	for (const msg of messages) {
		$messages.appendChild(createChatMessageElement(msg).chatElement);
		$messages.scrollTop = $messages.scrollHeight;
	}
}

export async function sendMessage(mode: "general" | "rag") {
	const $input = $("#message") as HTMLInputElement;
	const $messages = $("#messages") as HTMLUListElement;

	// Create user message element
	const userMsg: RoleScopedChatInput = { role: "user", content: $input.value };
	$messages.appendChild(createChatMessageElement(userMsg).chatElement);

	const [messages, storedMode] = retrieveMessages();
	messages.push(userMsg);

	const payload = messages;
	$input.value = "";

	var assistantMsg: RoleScopedChatInput = { role: "assistant", content: "" };
	const { chatElement, text } = createChatMessageElement(assistantMsg);
	$messages.appendChild(chatElement);
	const assistantResponse = text;
	// Scroll to the latest message
	$messages.scrollTop = $messages.scrollHeight;

	let apiUrl = "";
	if (mode === "general") {
		apiUrl = "/api/chatbot";
	} else {
		apiUrl = "/api/chatbot-with-rag";
	}

	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "text/event-stream",
		},
		body: JSON.stringify(payload),
	});

	if (response.body) {
		const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

		while (true) {
			const { value, done } = await reader.read();
			if (done) {
				break;
			}

			assistantMsg.content += value;
			// Continually render the markdown => HTML
			assistantResponse.innerHTML = marked.parse(assistantMsg.content) as string;
			$messages.scrollTop = $messages.scrollHeight;
		}
	}
	messages.push(assistantMsg);
	storeMessages(messages, mode);
}

// Based on the message format of `{role: "user", content: "Hi"}`
function createChatMessageElement(msg: RoleScopedChatInput) {
	// The structure is li>(header>h3+span)+p
	const $li = document.createElement("li");
	const $header = document.createElement("header");
	const $text = document.createElement("div");
	$text.classList.add("text");
	const timestamp = `${date.getHours()}:${("00" + date.getMinutes()).slice(-2)}`;

	if (msg.role === "assistant") {
		$li.classList.add("bot");
		$header.innerHTML = `<h3>Assistant</h3><span>${timestamp}</span>`;
		if (msg.content === "") {
			const $loader = document.createElement("span");
			$loader.classList.add("loader");
			$text.appendChild($loader);
		} else {
			$text.innerHTML = marked.parse(msg.content) as string;
		}
	} else if (msg.role === "user") {
		$li.classList.add("user");
		$header.innerHTML = `<h3>User</h3><span>${timestamp}</span>`;
		$text.innerHTML = `<p>${msg.content}</p>`;
	} else {
		$header.innerHTML = `<h3>System</h3><span>${timestamp}</span>`;
		$text.innerHTML = "<p>Error, no role identified</p>";
	}
	$li.appendChild($header);
	$li.appendChild($text);
	return { chatElement: $li, text: $text };
}

function retrieveMessages() {
	const msgJSON = sessionStorage.getItem("messages");
	const mode = sessionStorage.getItem("mode");
	if (!msgJSON) {
		return [[], mode];
	}
	return [JSON.parse(msgJSON), mode];
}

function storeMessages(msgs: RoleScopedChatInput[], mode: "general" | "rag") {
	sessionStorage.setItem("messages", JSON.stringify(msgs));
	sessionStorage.setItem("mode", mode);
}
