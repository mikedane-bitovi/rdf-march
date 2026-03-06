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
const timestamp = new Date().toISOString();

// Log that hook was triggered
appendFileSync(LOG_FILE, `\n[${timestamp}] PostToolUse triggered - tool: ${toolName}\n`);

// Only run Prettier if the agent was editing/writing a file
if (!EDIT_TOOLS.some(t => toolName.includes(t))) {
  appendFileSync(LOG_FILE, `[${timestamp}] Skipped - not an edit tool\n`);
  process.exit(0);
}

// Extract file paths based on tool type
let filePaths = [];
if (toolName === 'multi_replace_string_in_file') {
  // Handle multi_replace_string_in_file which has an array of replacements
  const replacements = input?.tool_input?.replacements ?? [];
  filePaths = replacements.map(r => r.filePath).filter(Boolean);
} else {
  // Handle other edit tools
  const filePath = input?.tool_input?.path ?? 
                   input?.tool_input?.file_path ?? 
                   input?.tool_input?.filePath ?? '';
  if (filePath) filePaths = [filePath];
}

const filePathsStr = filePaths.join(', ');
appendFileSync(LOG_FILE, `[${timestamp}] Files to format: ${filePathsStr || 'none'}\n`);

if (filePaths.length === 0) {
  appendFileSync(LOG_FILE, `[${timestamp}] Skipped - no files found\n`);
  process.exit(0);
}

// Skip if there are no files, the files don't exist, or Prettier doesn't support them
const supportedFiles = filePaths.filter(filePath => 
  filePath && existsSync(filePath) && SUPPORTED_EXTENSIONS.test(filePath)
);

if (supportedFiles.length === 0) {
  appendFileSync(LOG_FILE, `[${timestamp}] Skipped - no supported files found\n`);
  process.exit(0);
}

console.log(`\n✨ Formatting ${supportedFiles.length} file(s) with Prettier...\n`);
appendFileSync(LOG_FILE, `[${timestamp}] Running Prettier on ${supportedFiles.length} file(s)\n`);

// Run Prettier on each file the agent just edited
try {
  for (const filePath of supportedFiles) {
    execSync(`npx prettier --write "${filePath}"`, { stdio: 'inherit' });
  }
  console.log('\n✅ Files formatted!\n');
  appendFileSync(LOG_FILE, `[${timestamp}] ✅ Prettier completed\n`);
} catch (error) {
  console.log('\n❌ Prettier failed - check output above\n');
  appendFileSync(LOG_FILE, `[${timestamp}] ❌ Prettier failed\n`);
  // Don't crash the agent session if Prettier fails
}

// Now run tests if any file is a source file
const srcFiles = supportedFiles.filter(f => f.includes('src/'));
if (srcFiles.length > 0) {
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