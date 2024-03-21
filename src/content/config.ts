import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection, z } from "astro:content";

export const collections = {
	docs: defineCollection({ schema: docsSchema() }),
	blog: defineCollection({
		type: "content",
		schema: z.object({
			heroImage: z.string(),
			title: z.string(),
			tags: z.string().array(),
			pubDate: z.coerce.date(),
		}),
	}),
};
