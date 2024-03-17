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
			logo: {
				src: "./src/icons/logo.svg",
			},
			// customCss: ['./src/custom-styles.css', '@fontsource/roboto'],
			social: {
				"github": "https://github.com/vangiel",
				"linkedin": "https://www.linkedin.com/in/daniel-rodr%C3%ADguez-criado-phd-6967626a/",
				"x.com": "https://twitter.com/danirocri",
			},
		}),
	],
	output: "server",
	adapter: cloudflare({
		imageService: "passthrough",
	}),
});
