/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
	getThemePreference(): "dark" | "light";
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}
