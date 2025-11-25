import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	ssr: {
		noExternal: ["@vidstack/react"],
	},
	resolve: {
		alias: {
			"@vidstack/react/player/layouts/default": path.resolve(
				__dirname,
				"node_modules/@vidstack/react/prod/player/vidstack-default-layout.js",
			),
			"@vidstack/react/player/styles": path.resolve(
				__dirname,
				"node_modules/@vidstack/react/player/styles",
			),
			"@vidstack/react": path.resolve(
				__dirname,
				"node_modules/@vidstack/react/prod/vidstack.js",
			),
		},
	},
	plugins: [
		devtools(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
