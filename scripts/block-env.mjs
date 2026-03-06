#!/usr/bin/env node
/*
  Hook: PreToolUse - Block .env file access
 
  Blocks any tool from accessing .env files.
  
  Official docs: https://docs.github.com/en/copilot/reference/hooks-configuration
 
  INPUT (stdin): JSON object with the shape:
  {
    "timestamp": "2026-03-06T06:15:29.436Z",
    "hook_event_name": "PreToolUse",
    "session_id": "fdd8449e-f524-443d-afa0-891a1f5a8b0d",
    "tool_name": "replace_string_in_file",
    "tool_input": {
      "filePath": "/path/to/file.js",
      "oldString": "...",
      "newString": "..."
    },
    "tool_use_id": "toolu_bdrk_012...",
    "cwd": "/path/to/workspace"
  }
 
  OUTPUT: JSON object with the shape:
  {
    "continue": false,           // false to block, true to allow
    "stopReason": "...",          // Short reason for blocking
    "systemMessage": "..."        // Detailed message shown to agent
  }
  - exit code 0  → allow the tool call
  - exit code 2  → block the tool call (systemMessage shown to agent)
 */

// Read JSON from stdin
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));

// Get tool name and parameters
const toolName = input.tool_name || input.toolName || '';
const toolArgs = input.tool_input || (input.toolArgs ? JSON.parse(input.toolArgs) : {});

// Extract file path from various possible parameter names
const filePath = toolArgs.filePath || toolArgs.path || toolArgs.file || 
                 toolArgs.targetPath || toolArgs.target || 
                 toolArgs.includePattern || '';

// Check terminal commands for .env access
const command = toolArgs.command || '';
const envPattern = /\.env(?:\.\w+)?(?:\s|$|\/|'|")/;

// Block if targeting any .env file
if (envPattern.test(filePath)) {
  const response = {
    continue: false,
    stopReason: "Security policy violation",
    systemMessage: "Access to .env files is not permitted. Environment files contain sensitive credentials and secrets that should not be modified by automated agents."
  };
  
  console.log(JSON.stringify(response));
  process.exit(2);
}

// Block terminal commands that access .env files
if (toolName === 'run_in_terminal' && envPattern.test(command)) {
  const response = {
    continue: false,
    stopReason: "Security policy violation",
    systemMessage: "Terminal commands accessing .env files are not permitted. Environment files contain sensitive credentials and secrets that should not be modified by automated agents."
  };
  
  console.log(JSON.stringify(response));
  process.exit(2);
}

// Allow the tool call
const response = {
  continue: true
};
console.log(JSON.stringify(response));
process.exit(0);