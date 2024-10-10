import { QdrantDatabase } from "@/lib/qdrant";
import type { APIContext } from "astro";
export const prerender = false;

export async function POST({ request, locals }: APIContext) {
	// Connect to Qdrant Cloud
	const Qdrant = new QdrantDatabase("daniel-info", 768);
	// Get the bindings for Cloudflare Workers AI and D1 database
	const { AI, DB } = locals.runtime.env;
	// Get the request body from the user
	const payload = (await request.json()) as RoleScopedChatInput[];

	// Get the vector embedings of the last user message.
	const embeddings = await AI.run("@cf/baai/bge-base-en-v1.5", {
		text: payload[payload.length - 1].content,
	});
	const vector = embeddings.data[0];

	// Query the vector index for the most similar messages in the vectorized databse.
	let vecIds: number[] = [];
	try {
		const vectorQuery = await Qdrant.search(vector, 2);
		vecIds = vectorQuery.map((vec) => vec.id as number);
	} catch (error) {
		console.error("Problem querying qdrant", error);
	}

	let notes: String[] = [];
	if (vecIds) {
		//Get each note from each id from the database
		const query = DB.prepare("SELECT * FROM notes WHERE id = (?1)");
		for (const vecId of vecIds) {
			const { results } = await query.bind(vecId).all();
			if (results) notes.push(...results.map((vec) => vec.text as String));
		}
	} else {
		notes.push(
			"There was a problem querying the vector database. Therefore there is no context for the chatbot."
		);
	}

	const contextMessage = notes.length
		? `Context:\n${notes.map((note) => `- ${note}`).join("\n")}`
		: "";

	let messages: RoleScopedChatInput[] = [
		...(notes.length ? [{ role: "system" as const, content: contextMessage }] : []),
		{
			role: "system" as const,
			content: "You are a friendly assistant, that answer questions about Daniel Rodriguez Criado",
		},
		{
			role: "system" as const,
			content:
				"When answering the question or responding, use the context provided, if it is provided and relevant.",
		},
		{
			role: "system" as const,
			content:
				"Don't make up answers that are not in the context and try to keep the answer as concise as possible.",
		},
	];

	messages = messages.concat(payload);
	console.log(messages);

	let eventSourceStream: ReadableStream<Uint8Array> | undefined;
	let retryCount = 0;
	let successfulInference = false;
	let lastError;
	const MAX_RETRIES = 3;
	while (successfulInference === false && retryCount < MAX_RETRIES) {
		try {
			eventSourceStream = (await AI.run("@cf/meta/llama-3-8b-instruct-awq", {
				stream: true,
				messages,
			})) as ReadableStream<Uint8Array>;
			successfulInference = true;
		} catch (err) {
			lastError = err;
			retryCount++;
			console.error(err);
			console.log(`Retrying #${retryCount}...`);
		}
	}
	if (eventSourceStream === undefined) {
		if (lastError) {
			throw lastError;
		}
		throw new Error(`Problem with model`);
	}

	const response: ReadableStream = new ReadableStream({
		start(controller) {
			eventSourceStream.pipeTo(
				new WritableStream({
					write(chunk) {
						const text = new TextDecoder().decode(chunk);
						for (const line of text.split("\n")) {
							if (!line.includes("data: ")) {
								continue;
							}
							if (line.includes("[DONE]")) {
								controller.close();
								break;
							}
							try {
								const data = JSON.parse(line.split("data: ")[1]);
								controller.enqueue(new TextEncoder().encode(data.response));
							} catch (err) {
								console.error("Could not parse response", err);
								console.log(line);
								console.log(line.split("data: ")[1]);
							}
						}
					},
				})
			);

			request.signal.addEventListener("abort", () => {
				controller.close();
			});
		},
	});

	return new Response(response, {
		headers: {
			"content-type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Access-Control-Allow-Origin": "*",
			"Connection": "keep-alive",
		},
	});
}
