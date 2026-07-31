#!/usr/bin/env bun
/**
 * `bun run docker <command> [...args]` — thin wrapper around
 * `docker compose -f tools/docker/docker-compose.yml` (see that file for
 * what the local simulation actually runs: web + a Vault dev server). Exists
 * so the compose file path/project name aren't something every dev has to
 * remember or type, and so future tools/docker additions (more services,
 * flags) only need updating in one script, not in everyone's shell history.
 */
import { $ } from "bun";

const composeFile = `${import.meta.dir}/../docker/docker-compose.yml`;
const compose = (...composeArgs: string[]) =>
  $`docker compose -f ${composeFile} ${composeArgs}`;

const USAGE = `Usage: bun run docker <command> [...args]

Commands:
  up            Build (if needed) and start web + vault in the background
  down          Stop and remove all containers
  restart [svc] Restart everything, or just one service (web | vault | vault-init)
  logs [svc]    Follow logs — all services, or just one
  ps            Show container status
  build         Rebuild the web image without starting anything
  sh [svc]      Open a shell in a running container (default: web)
  vault ...     Run a "vault" CLI command inside the vault container
                (e.g. \`bun run docker vault kv get secret/chatsmith-web\`)
  reset         down, then remove the web image too (clean slate rebuild)

Env vars:
  WEB_PORT      Host port to bind web to (default 3000) — set this if 3000
                is already taken by a local \`bun dev\`, e.g.
                \`WEB_PORT=3050 bun run docker up\`

Runs docker compose -f tools/docker/docker-compose.yml under the hood.
Vault is seeded from apps/web/.env.local — create one (copy from
apps/web/.env.example) before running \`up\` if you don't have one yet.
`;

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "up": {
    const envLocal = `${import.meta.dir}/../../apps/web/.env.local`;
    if (!(await Bun.file(envLocal).exists())) {
      console.error(
        "Missing apps/web/.env.local — Vault seeds itself from this file " +
          "(see tools/docker/seed-vault.sh).\n" +
          "Create it first: cp apps/web/.env.example apps/web/.env.local"
      );
      process.exit(1);
    }
    await compose("up", "-d", "--build");
    const webPort = process.env.WEB_PORT ?? "3000";
    console.log(`\nweb:   http://localhost:${webPort}`);
    console.log("vault: http://localhost:8200  (token: root)");
    console.log("\nFollow logs with: bun run docker logs");
    break;
  }
  case "down": {
    await compose("down", ...args);
    break;
  }
  case "restart": {
    await compose("restart", ...args);
    break;
  }
  case "logs": {
    await compose("logs", "-f", "--tail=200", ...args);
    break;
  }
  case "ps": {
    await compose("ps");
    break;
  }
  case "build": {
    await compose("build", ...args);
    break;
  }
  case "sh": {
    const service = args[0] ?? "web";
    await compose("exec", service, "sh");
    break;
  }
  case "vault": {
    await compose("exec", "vault", "vault", ...args);
    break;
  }
  case "reset": {
    await compose("down", "--rmi", "local", "--volumes");
    break;
  }
  case "help":
  case "-h":
  case "--help":
  case undefined: {
    console.log(USAGE);
    break;
  }
  default: {
    console.error(`Unknown command: "${command}"\n`);
    console.log(USAGE);
    process.exit(1);
  }
}
