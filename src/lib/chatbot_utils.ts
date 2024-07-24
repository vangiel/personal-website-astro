import { $ } from "@/lib/dom-selector";
import { marked } from "marked";

const date = new Date();

export function initChat() {
	const $messages = $("#messages") as HTMLUListElement;
	const messages = retrieveMessages();
	if (messages.length === 0) {
		messages.push({
			role: "assistant",
			content:
				"Hi, welcome to my chat! I am a friendly assistant. Go ahead and send me a message. 😄",
		});
		storeMessages(messages);
	}
	$messages.innerHTML = "";
	for (const msg of messages) {
		$messages.appendChild(createChatMessageElement(msg).chatElement);
		$messages.scrollTop = $messages.scrollHeight;
	}
}

export async function sendMessage() {
	const $input = $("#message") as HTMLInputElement;
	const $messages = $("#messages") as HTMLUListElement;

	// Create user message element
	const userMsg: RoleScopedChatInput = { role: "user", content: $input.value };
	$messages.appendChild(createChatMessageElement(userMsg).chatElement);

	const messages = retrieveMessages();
	messages.push(userMsg);
	console.log(messages);

	const payload = messages;
	$input.value = "";

	var assistantMsg: RoleScopedChatInput = { role: "assistant", content: "" };
	const { chatElement, text } = createChatMessageElement(assistantMsg);
	$messages.appendChild(chatElement);
	const assistantResponse = text;
	// Scroll to the latest message
	$messages.scrollTop = $messages.scrollHeight;

	const response = await fetch("/api/chatbot", {
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
	storeMessages(messages);
}

// Based on the message format of `{role: "user", content: "Hi"}`
function createChatMessageElement(msg: RoleScopedChatInput) {
	// The structure is li>(header>h3+span)+p
	const $li = document.createElement("li");
	const $header = document.createElement("header");
	const $p = document.createElement("p");
	const $loader = document.createElement("span");
	$loader.classList.add("loader");
	$p.textContent = msg.content;
	const timestamp = `${date.getHours()}:${("00" + date.getMinutes()).slice(-2)}`;
	if (msg.role === "assistant") {
		$li.classList.add("bot");
		$header.innerHTML = `<h3>Assistant</h3><span>${timestamp}</span>`;
		if (msg.content === "") {
			$p.appendChild($loader);
		}
	} else if (msg.role === "user") {
		$li.classList.add("user");
		$header.innerHTML = `<h3>User</h3><span>${timestamp}</span>`;
	} else {
		$header.innerHTML = `<h3>System</h3><span>${timestamp}</span>`;
		$p.textContent = "Error, no role identified";
	}
	$li.appendChild($header);
	$li.appendChild($p);
	return { chatElement: $li, text: $p };
}

function retrieveMessages() {
	const msgJSON = sessionStorage.getItem("messages");
	if (!msgJSON) {
		return [];
	}
	return JSON.parse(msgJSON);
}

function storeMessages(msgs: RoleScopedChatInput[]) {
	sessionStorage.setItem("messages", JSON.stringify(msgs));
}
