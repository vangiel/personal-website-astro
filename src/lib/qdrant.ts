import { QdrantClient } from "@qdrant/js-client-rest";
export const prerender = false;

export type Point = {
	id: number;
	vector: number[];
	payload?: Record<string, unknown>;
};

export class QdrantDatabase {
	readonly collectionName: string;
	readonly vectorSize: number;
	private client: QdrantClient;

	constructor(collectionName: string, vectorSize: number) {
		this.collectionName = collectionName;
		this.vectorSize = vectorSize;
		this.client = this.createClient();
		this.createCollection();
	}

	private createClient() {
		const client = new QdrantClient({
			url: process.env.QDRANT_URL || import.meta.env.QDRANT_URL,
			apiKey: process.env.QDRANT_API_KEY || import.meta.env.QDRANT_API_KEY,
		});
		return client;
	}

	private async createCollection() {
		const response = await this.client.getCollections();
		const collectionNames = response.collections.map((collection) => collection.name);

		if (collectionNames.includes(this.collectionName)) {
			// await this.client.deleteCollection(this.collectionName);
			return;
		}
		await this.client.createCollection(this.collectionName, {
			vectors: {
				size: this.vectorSize,
				distance: "Cosine",
			},
			optimizers_config: {
				default_segment_number: 2,
			},
			replication_factor: 2,
		});
	}

	async addPoints(inputPoints: Point[]) {
		await this.client.upsert(this.collectionName, {
			wait: true,
			points: inputPoints,
		});
	}

	async search(query: number[], resultsLimit: number) {
		return await this.client.search(this.collectionName, {
			vector: query,
			limit: resultsLimit,
		});
	}
}
