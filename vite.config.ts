import { defineConfig, type Plugin } from "vite";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { cwd, env } from "node:process";

function getBasePath(): string {
  const configuredBase = env.AANG_BASE_PATH;
  if (configuredBase) return configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`;

  const [owner, repository] = env.GITHUB_REPOSITORY?.split("/") ?? [];
  const hasCustomDomain = existsSync(resolve(cwd(), "CNAME"))
    || existsSync(resolve(cwd(), "public/CNAME"));
  const isProjectSite = env.GITHUB_ACTIONS === "true"
    && repository
    && !hasCustomDomain
    && repository.toLowerCase() !== `${owner}.github.io`.toLowerCase();
  return isProjectSite ? `/${repository}/` : "/";
}

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
  base: getBasePath(),
  plugins: [configureStaticFallback()],
});
