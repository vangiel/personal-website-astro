import cloudflare from "@astrojs/cloudflare";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
	integrations: [
		icon(),
		starlight({
			title: "Dr Daniel projects",
			components: {
				SiteTitle: "./src/components/starlight/SiteTitle.astro",
				SocialIcons: "./src/components/starlight/SocialIcons.astro",
				ThemeProvider: "./src/components/starlight/ThemeProvider.astro",
				ThemeSelect: "./src/components/ThemeToggle.astro",
			},
			customCss: ["./src/styles/starlight-styles.css", "@fontsource-variable/roboto-flex"],
			sidebar: [
				{
					label: "Human-Aware Navigation (HAN)",
					autogenerate: { directory: "navigation" },
				},
				{
					label: "Human Pose Estimation 3D (HPE)",
					autogenerate: { directory: "pose-estimation" },
				},
				{
					label: "Image Generation",
					autogenerate: { directory: "image-generation" },
				},
			],
		}),
	],
	output: "hybrid",
	adapter: cloudflare({
		imageService: "passthrough",
	}),
});
