import { defineConfig, type Plugin } from "vite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function configureStaticFallback(): Plugin {
  let basePath = "/";
  let fallbackSource = "";
  let outputPath = "";
  return {
    name: "aang-static-fallback-base-path",
    configResolved(config) {
      basePath = config.base;
      fallbackSource = resolve(config.publicDir, "404.html");
      outputPath = resolve(config.root, config.build.outDir, "404.html");
    },
    closeBundle() {
      const source = readFileSync(fallbackSource, "utf8");
      writeFileSync(outputPath, source.replace('"__AANG_BASE_PATH__"', JSON.stringify(basePath)));
    },
  };
}

export default defineConfig({
  plugins: [configureStaticFallback()],
});
