import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection, z } from "astro:content";

export const collections = {
	docs: defineCollection({
		schema: docsSchema({
			extend: ({ image }) => {
				return z.object({
					cover: image().optional(),
					coverAlt: z.string().optional(),
					lastUpdated: z.coerce.date(),
				});
			},
		}),
	}),

	blog: defineCollection({
		type: "content",
		schema: ({ image }) =>
			z.object({
				title: z.string(),
				tags: z.string().array(),
				pubDate: z.coerce.date(),
				heroImage: image(),
				imageAlt: z.string().optional(),
			}),
	}),
};
