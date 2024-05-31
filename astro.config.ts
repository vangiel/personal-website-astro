import cloudflare from "@astrojs/cloudflare";
import starlight from "@astrojs/starlight";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeMathJax from "rehype-mathjax";
import remarkMath from "remark-math";
import sitemap from "@astrojs/sitemap";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://danielrodriguezcriado.es",
  integrations: [icon(), starlight({
    title: "Dr Daniel projects",
    components: {
      SiteTitle: "./src/components/starlight/SiteTitle.astro",
      SocialIcons: "./src/components/SocialIcons.astro",
      ThemeProvider: "./src/components/starlight/ThemeProvider.astro",
      ThemeSelect: "./src/components/buttons/ThemeToggle.astro"
    },
    customCss: ["./src/styles/starlight-styles.css", "@fontsource-variable/roboto-flex"],
    sidebar: [{
      label: "Human-Aware Navigation (HAN)",
      autogenerate: {
        directory: "navigation",
        collapsed: false
      }
    }, {
      label: "3D Human Pose Estimation (HPE)",
      autogenerate: {
        directory: "pose-estimation"
      }
    }, {
      label: "Image Generation",
      autogenerate: {
        directory: "image-generation"
      }
    }]
  }), sitemap(), expressiveCode()],
  output: "hybrid",
  adapter: cloudflare({
    imageService: "passthrough"
  }),
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeMathJax]
  }
});