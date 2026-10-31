import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH || "/",
  trailingSlash: "always",
  integrations: [react()],
  vite: { resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } } }
});
