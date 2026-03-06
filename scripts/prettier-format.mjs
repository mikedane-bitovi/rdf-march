#!/usr/bin/env node
/*
  Hook: PostToolUse - Auto-format edited files with Prettier
 
  VS Code passes JSON to this script via stdin after every tool call.
  The script checks if the agent just edited a file, and if so runs Prettier on it.
 
  INPUT (stdin): JSON object with the shape:
  {
    "tool_name": "str_replace",         // the tool the agent just used
    "tool_input": {
      "path": "src/components/Button.tsx"  // the file the agent just edited
    },
    "hookEventName": "PostToolUse",
    "sessionId": "abc123",
    "cwd": "/path/to/workspace"
  }
 
  OUTPUT:
  - exit code 0 always — PostToolUse hooks cannot block, only react.
    Prettier runs silently. If it fails, the agent session continues unaffected.
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';

// File extensions that Prettier supports
const SUPPORTED_EXTENSIONS = /\.(js|jsx|ts|tsx|css|scss|html|json|md)$/;

// Tool names that indicate the agent wrote or edited a file
const EDIT_TOOLS = ['write', 'edit', 'str_replace'];

// Read the full stdin payload sent by VS Code
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));

const toolName = input?.tool_name ?? '';
const filePath = input?.tool_input?.path ?? input?.tool_input?.file_path ?? '';

// Only run Prettier if the agent was editing/writing a file
if (!EDIT_TOOLS.some(t => toolName.includes(t))) process.exit(0);

// Skip if there's no file path, the file doesn't exist, or Prettier doesn't support it
if (!filePath || !existsSync(filePath) || !SUPPORTED_EXTENSIONS.test(filePath)) process.exit(0);

// Run Prettier on the file the agent just edited
try {
  execSync(`npx prettier --write "${filePath}"`, { stdio: 'inherit' });
} catch {
  // Don't crash the agent session if Prettier fails
}

process.exit(0);