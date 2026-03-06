#!/usr/bin/env node
/*
  Hook: PostToolUse - Auto-format edited files with Prettier
 
  VS Code passes JSON to this script via stdin after every tool call.
  The script checks if the agent just edited a file, and if so runs Prettier on it.
 
  INPUT (stdin): JSON object with the shape:
  {
    "tool_name": "replace_string_in_file",  // the tool the agent just used
    "tool_input": {
      "filePath": "src/calculator.js"       // the file the agent just edited
    },
    "hookEventName": "PostToolUse",
    "sessionId": "abc123",
    "cwd": "/path/to/workspace"
  }
 
  OUTPUT:
  - exit code 0 always — PostToolUse hooks cannot block, only react.
    They run after the tool has already executed.
    Console output is shown in VS Code's Output panel.
 */

import { existsSync, appendFileSync } from 'fs';
import { execSync } from 'child_process';

const LOG_FILE = 'post-hook.log';

// File extensions that Prettier supports
const SUPPORTED_EXTENSIONS = /\.(js|jsx|ts|tsx|css|scss|html|json|md)$/;

// Tool names that indicate the agent wrote or edited a file
const EDIT_TOOLS = ['write', 'edit', 'replace', 'create_file'];

// Read the full stdin payload sent by VS Code
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));

const toolName = input?.tool_name ?? '';
const filePath = input?.tool_input?.path ?? 
                 input?.tool_input?.file_path ?? 
                 input?.tool_input?.filePath ?? '';

// Log that hook was triggered
const timestamp = new Date().toISOString();
appendFileSync(LOG_FILE, `\n[${timestamp}] PostToolUse triggered - tool: ${toolName}, file: ${filePath}\n`);

// Only run Prettier if the agent was editing/writing a file
if (!EDIT_TOOLS.some(t => toolName.includes(t))) {
  appendFileSync(LOG_FILE, `[${timestamp}] Skipped - not an edit tool\n`);
  process.exit(0);
}

// Skip if there's no file path, the file doesn't exist, or Prettier doesn't support it
if (!filePath || !existsSync(filePath) || !SUPPORTED_EXTENSIONS.test(filePath)) {
  appendFileSync(LOG_FILE, `[${timestamp}] Skipped - file not found or not supported by Prettier\n`);
  process.exit(0);
}

console.log(`\n✨ Formatting ${filePath} with Prettier...\n`);
appendFileSync(LOG_FILE, `[${timestamp}] Running Prettier on ${filePath}\n`);

// Run Prettier on the file the agent just edited
try {
  execSync(`npx prettier --write "${filePath}"`, { stdio: 'inherit' });
  console.log('\n✅ File formatted!\n');
  appendFileSync(LOG_FILE, `[${timestamp}] ✅ Prettier completed\n`);
} catch (error) {
  console.log('\n❌ Prettier failed - check output above\n');
  appendFileSync(LOG_FILE, `[${timestamp}] ❌ Prettier failed\n`);
  // Don't crash the agent session if Prettier fails
}

// Now run tests if it's a source file
if (filePath.includes('src/')) {
  console.log('\n🧪 Running tests...\n');
  appendFileSync(LOG_FILE, `[${timestamp}] Running tests\n`);
  
  try {
    const output = execSync('npm test', { encoding: 'utf8' });
    console.log(output);
    console.log('\n✅ All tests passed!\n');
    appendFileSync(LOG_FILE, `[${timestamp}] ✅ Tests passed\n`);
  } catch (error) {
    console.log(error.stdout || error.message);
    console.log('\n❌ Some tests failed - check output above\n');
    appendFileSync(LOG_FILE, `[${timestamp}] ❌ Tests failed\n`);
  }
}

process.exit(0);