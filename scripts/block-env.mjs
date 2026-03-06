#!/usr/bin/env node
/*
  Hook: PreToolUse - Block .env file access
 
  Blocks any tool from accessing .env files.
  
  Official docs: https://docs.github.com/en/copilot/reference/hooks-configuration
 
  INPUT (stdin): JSON object with this structure:
  {
    "timestamp": 1704614600000,
    "cwd": "/path/to/project",
    "toolName": "replace_string_in_file",
    "toolArgs": "{\"filePath\":\".env\",\"oldString\":\"...\",\"newString\":\"...\"}"
  }
 
  Note: toolArgs is a JSON STRING that must be parsed!
 
  OUTPUT:
  - exit code 0  → allow the tool call
  - exit code 2  → block the tool call (stderr shown to agent)
 */

// Read JSON from stdin
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));

// Parse toolArgs (it's a JSON string!)
const toolArgs = input.toolArgs ? JSON.parse(input.toolArgs) : {};

// DEBUG: Output what we received
const debugInfo = `
[DEBUG] toolName: ${input.toolName}
[DEBUG] toolArgs keys: ${Object.keys(toolArgs).join(', ')}
[DEBUG] Full toolArgs: ${JSON.stringify(toolArgs)}
`;

// Extract file path - CHECK BOTH because docs don't specify which!
const filePath = toolArgs.filePath || toolArgs.path || '';

// Block if targeting any .env file (e.g. .env, .env.local, .env.production)
if (/(?:^|\/)\.env(?:\.|$)/.test(filePath)) {
  process.stderr.write(debugInfo);
  process.stderr.write('\nPolicy violation: agent access to .env files is not permitted.\n');
  process.exit(2);
}

process.exit(0);