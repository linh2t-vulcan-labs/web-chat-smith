#!/usr/bin/env bun
/**
 * Local-only stand-in for what a real Vault Agent Injector sidecar does in
 * GKE: fetch secrets from Vault over HTTP, merge them into the process env,
 * then exec the actual production command — so `apps/web/server.js` sees
 * `CS_PUBLIC_*` the exact same way it does in a real pod, without this repo
 * needing to know anything about Vault Agent's real injection mechanics.
 *
 * Mounted in by tools/docker/docker-compose.yml, NOT copied into the
 * production image — see that file's `web.entrypoint` override.
 */

const vaultAddr = process.env.VAULT_ADDR ?? "http://vault:8200";
const vaultToken = process.env.VAULT_TOKEN ?? "root";
const secretPath = process.env.VAULT_SECRET_PATH ?? "secret/data/chatsmith-web";

const MAX_ATTEMPTS = 20;
const RETRY_DELAY_MS = 1000;

/**
 * Recursive, not a loop — each attempt genuinely must wait for the previous
 * one to fail before retrying (Vault's dev server takes a moment to become
 * reachable after `docker compose up`), so there's nothing to parallelize.
 */
const fetchSecretsAttempt = async (
  attempt: number
): Promise<Record<string, string>> => {
  try {
    const res = await fetch(`${vaultAddr}/v1/${secretPath}`, {
      headers: { "X-Vault-Token": vaultToken },
    });
    if (res.ok) {
      const body = (await res.json()) as {
        data: { data: Record<string, string> };
      };
      return body.data.data;
    }
    console.log(
      `[vault-entrypoint] Vault responded ${res.status}, retrying (${attempt}/${MAX_ATTEMPTS})...`
    );
  } catch {
    console.log(
      `[vault-entrypoint] Vault not reachable yet, retrying (${attempt}/${MAX_ATTEMPTS})...`
    );
  }
  if (attempt >= MAX_ATTEMPTS) {
    throw new Error(
      `[vault-entrypoint] Could not fetch secrets from ${vaultAddr}/v1/${secretPath} after ${MAX_ATTEMPTS} attempts.`
    );
  }
  await Bun.sleep(RETRY_DELAY_MS);
  return fetchSecretsAttempt(attempt + 1);
};

const secrets = await fetchSecretsAttempt(1);
console.log(
  `[vault-entrypoint] loaded ${Object.keys(secrets).length} secret(s) from Vault: ${Object.keys(secrets).join(", ")}`
);

const child = Bun.spawn({
  cmd: ["bun", "run", "apps/web/server.js"],
  cwd: "/repo",
  env: { ...process.env, ...secrets },
  stdio: ["inherit", "inherit", "inherit"],
});

process.exit(await child.exited);
