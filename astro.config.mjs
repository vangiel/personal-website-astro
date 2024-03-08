import icon from "astro-icon";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	integrations: [icon()],
	output: "server",
	adapter: cloudflare(),
	image: {
		// Example: Enable the Sharp-based image service with a custom config
		service: {
			entrypoint: "astro/assets/services/sharp",
			config: {
				limitInputPixels: false,
			},
		},
	},
});
