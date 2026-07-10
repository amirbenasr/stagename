---
name: vercel-env-sync
description: Bulk sync Vercel environment variables from a local .env file — delete all existing vars, then upload from file (useful for key rotation or post-compromise cleanup)
source: auto-skill
extracted_at: '2026-07-10T13:21:19.569Z'
---

# Vercel Env Var Sync from File

When you need to replace all Vercel env vars (e.g., after API key exposure, or syncing from a canonical `.env.prod` file), use a Node.js script to automate the delete-all-then-upload flow.

## When to Use

- API keys were exposed and revoked (like Paddle keys leaked to GitHub)
- Migrating env vars between environments
- Initial Vercel project setup from a local `.env.prod` file
- Rotating all secrets at once

## Procedure

### 1. List existing Vercel env vars

```bash
vercel env ls
```

Note all variable names — you'll need to delete each one.

### 2. Write a sync script

Create a temporary `sync-env.mjs` in your project root:

```javascript
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Parse .env.prod (or whatever your source file is)
const raw = readFileSync('.env.prod', 'utf-8');
const vars = [];
for (const line of raw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let value = trimmed.slice(eqIdx + 1);
  // Strip surrounding quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  vars.push({ key, value });
}

console.log(`Parsed ${vars.length} vars from .env.prod\n`);

// Delete all existing env vars (hardcode the list from `vercel env ls`)
const existingVars = [
  'VAR_NAME_1', 'VAR_NAME_2', // ... list all existing vars
];

console.log('=== DELETING existing env vars ===');
for (const name of existingVars) {
  for (const env of ['production', 'preview']) {
    try {
      execSync(`vercel env rm ${name} ${env} -y`, { stdio: 'pipe' });
      console.log(`  Removed ${name} (${env})`);
    } catch {
      // Not present in this environment, skip
    }
  }
}

// Upload new env vars
console.log('\n=== UPLOADING new env vars ===');
for (const { key, value } of vars) {
  for (const env of ['production', 'preview']) {
    try {
      execSync(`vercel env add ${key} ${env}`, {
        input: value + '\n',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(`  Added ${key} (${env})`);
    } catch (e) {
      console.error(`  FAILED ${key} (${env}): ${e.stderr?.toString() || e.message}`);
    }
  }
}

console.log('\nDone!');
```

### 3. Run the script

```bash
node sync-env.mjs
```

This will:
- Delete each existing var from both `production` and `preview` environments
- Upload each var from `.env.prod` to both environments
- Handle errors gracefully (skip vars that don't exist, report failures)

### 4. Clean up and deploy

```bash
del sync-env.mjs  # or rm on macOS/Linux
vercel --prod -y
```

## Important Notes

- **Multiline values** (like `FIREBASE_PRIVATE_KEY` with PEM format) are handled correctly — the script passes the full value via stdin
- **Quoted values** — the script strips surrounding quotes (both single and double)
- **Comments and blank lines** — skipped automatically
- **Timeout** — set a long timeout (10+ minutes) since each `vercel env` call takes a few seconds, and you're making 2x the number of vars calls (delete + add, each for production + preview)
- **`.env.prod` must be in `.gitignore`** — verify with `grep .env .gitignore` before running, especially if keys were previously exposed

## Vercel CLI Commands Reference

- `vercel env ls` — list all env vars
- `vercel env rm <name> <environment> -y` — delete a var (the `-y` flag skips confirmation)
- `vercel env add <name> <environment>` — add a var (reads value from stdin)
- `vercel --prod -y` — deploy to production

## Example: Post-Compromise Key Rotation

If API keys were exposed on GitHub and auto-revoked by the provider:

1. Generate new keys in the provider's dashboard (Paddle, Stripe, etc.)
2. Update `.env.prod` with the new keys
3. Run the sync script to replace all Vercel env vars
4. Redeploy: `vercel --prod -y`
5. Test the checkout/payment flow to confirm the new keys work
