# GitHub Copilot Advanced Training Spec
**R&D Friday Session - March 7, 2026**  
**Duration:** 1 hour  
**Topic:** Sub-agents, Hooks, and Multi-Agent Orchestration

---

## Training Objectives

By the end of this session, participants will:
1. Understand how to use sub-agents to delegate complex tasks
2. Learn how to implement hooks to extend agent behavior
3. Explore orchestration patterns using multiple agents simultaneously
4. Practice hands-on examples of agent coordination

---

## Part 1: Sub-agents (20 minutes)

### What are Sub-agents?

Sub-agents are independent AI agents that perform focused work and report results back to a main agent. Each sub-agent:
- Runs in its own isolated context window
- Performs specific, delegated tasks (research, analysis, code review, etc.)
- Returns only a summary to the main agent (not the entire conversation)
- Can run synchronously or in parallel with other sub-agents

### Key Benefits

1. **Context Management** - Prevents main agent context bloat by isolating exploratory work
2. **Parallel Execution** - VS Code can run multiple sub-agents simultaneously for faster results
3. **Specialized Behavior** - Apply custom agents with specific tools and instructions for subtasks
4. **Cost Efficiency** - Only final results are returned, reducing token consumption
5. **Modularity** - Isolate experimental work without affecting main conversation

### How Sub-agent Execution Works

```
Main Agent (orchestrator)
    ├─> Sub-agent 1 (isolated context) → returns summary
    ├─> Sub-agent 2 (isolated context) → returns summary
    └─> Sub-agent 3 (isolated context) → returns summary
Main Agent synthesizes results and continues
```

**Important:** Sub-agents are synchronous by default - the main agent waits for results before continuing. However, multiple sub-agents can run in parallel.

### Invoking Sub-agents

Sub-agents are typically **agent-initiated**, not user-invoked. The main agent decides when to delegate work.

**Enabling sub-agents:**
- Ensure the `runSubagent` tool is enabled
- For custom agents, include `agent` or `runSubagent` in the `tools` frontmatter property

**Example prompt file with sub-agent support:**
```markdown
---
name: document-feature
tools: ['agent', 'read', 'search', 'edit']
---
Run a subagent to research the new feature implementation details and 
return only information relevant for user documentation.
Then update the docs/ folder with the new documentation.
```

### Custom Agent as Sub-agent Configuration

**Control visibility and invocation:**
```markdown
---
name: internal-helper
user-invokable: false  # Only accessible as sub-agent, not in dropdown
---
This agent can only be invoked as a subagent.
```

```markdown
---
name: user-only-agent
disable-model-invocation: true  # Cannot be invoked by other agents
---
This agent can only be triggered explicitly by users.
```

**Restricting available sub-agents:**
```markdown
---
name: TDD
tools: ['agent']
agents: ['Red', 'Green', 'Refactor']  # Only these sub-agents allowed
---
Implement features using test-driven development with specialized agents.
```

---

## Part 2: Hooks (15 minutes)

### What are Hooks?

Hooks allow you to extend and customize agent behavior by executing custom shell commands at key points during agent execution.

### Available Hook Triggers

1. **sessionStart** - Fires when an agent session begins
2. **sessionEnd** - Fires when an agent session ends
3. **userPromptSubmitted** - Fires when a user submits a prompt
4. **preToolUse** - Fires before a tool is executed
5. **postToolUse** - Fires after a tool completes execution
6. **errorOccurred** - Fires when an error occurs during execution

### Hook Configuration

**Location:** `.github/hooks/hooks.json` (must be on default branch)

**Basic structure:**
```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [...],
    "sessionEnd": [...],
    "userPromptSubmitted": [...],
    "preToolUse": [...],
    "postToolUse": [...],
    "errorOccurred": [...]
  }
}
```

### Example Hooks

**Session logging:**
```json
"sessionStart": [
  {
    "type": "command",
    "bash": "echo \"Session started: $(date)\" >> logs/session.log",
    "powershell": "Add-Content -Path logs/session.log -Value \"Session started: $(Get-Date)\"",
    "cwd": ".",
    "timeoutSec": 10
  }
]
```

**External script execution:**
```json
"userPromptSubmitted": [
  {
    "type": "command",
    "bash": "./scripts/log-prompt.sh",
    "powershell": "./scripts/log-prompt.ps1",
    "cwd": "scripts",
    "env": {
      "LOG_LEVEL": "INFO"
    }
  }
]
```

### Hook Best Practices

- Default timeout is 30 seconds - increase `timeoutSec` if needed
- Ensure scripts are executable (`chmod +x script.sh`)
- Include proper shebang (`#!/bin/bash`)
- Output must be valid single-line JSON (use `jq -c` or `ConvertTo-Json -Compress`)
- Enable verbose logging for debugging (`set -x`)

### Common Hook Use Cases

- Logging and telemetry
- Security scanning before tool execution
- Context gathering from external systems
- Validation and policy enforcement
- Cost tracking and budgeting
- Custom analytics

---

## Part 3: Multiple Agents & Orchestration (20 minutes)

### When to Use Multiple Agents Simultaneously

**Primary use case:** Working on a skill/agent while another agent is executing
- Build or refine a skill while the main agent is running a complex task
- Agent completes work, then re-run with the improved skill
- Create "waiting skills" that can be swapped in during execution

### Orchestration Patterns

#### 1. Coordinator and Worker Pattern

A coordinator agent manages the overall task and delegates to specialized workers.

**Coordinator example:**
```markdown
---
name: Feature Builder
tools: ['agent', 'edit', 'search', 'read']
agents: ['Planner', 'Plan Architect', 'Implementer', 'Reviewer']
---
You are a feature development coordinator. For each feature request:

1. Use the Planner agent to break down the feature into tasks.
2. Use the Plan Architect agent to validate the plan against codebase patterns.
3. If architect identifies reusable patterns, send feedback to Planner.
4. Use the Implementer agent to write the code for each task.
5. Use the Reviewer agent to check the implementation.
6. If reviewer identifies issues, use Implementer agent to apply fixes.

Iterate between planning/architecture and review/implementation until convergence.
```

**Specialized worker agents:**
```markdown
---
name: Planner
user-invokable: false
tools: ['read', 'search']
---
Break down feature requests into implementation tasks.
```

```markdown
---
name: Implementer
user-invokable: false
model: ['Claude Haiku 4.5 (copilot)', 'Gemini 3 Flash (Preview) (copilot)']
tools: ['edit', 'read']
---
Write code to complete assigned tasks.
```

**Benefits:**
- Worker agents have clean context and appropriate permissions
- Can use faster/cheaper models for focused tasks
- Main coordinator stays focused on high-level workflow

#### 2. Multi-Perspective Code Review

Run multiple review perspectives in parallel for comprehensive analysis.

```markdown
---
name: Thorough Reviewer
tools: ['agent', 'read', 'search']
---
Review code through multiple perspectives simultaneously. 
Run each perspective as a parallel subagent for independent findings.

When asked to review code, run these subagents in parallel:
- Correctness reviewer: logic errors, edge cases, type issues
- Code quality reviewer: readability, naming, duplication
- Security reviewer: input validation, injection risks, data exposure
- Architecture reviewer: codebase patterns, design consistency

After all subagents complete, synthesize findings into prioritized summary.
```

**Why this works:**
- Each sub-agent approaches the code fresh, without anchoring bias
- Parallel execution speeds up the review process
- Different perspectives catch different types of issues

#### 3. Sequential Sub-agent Chain

One sub-agent's output feeds into the next.

**Example workflow:**
```
Main Agent
  ├─> Research Agent (gather authentication patterns)
  ├─> Analysis Agent (analyze results, choose best approach)
  └─> Implementation Agent (implement chosen solution)
Main Agent validates and integrates results
```

**Key question to explore:** Can sub-agents call other sub-agents? How deeply can we nest this?

---

## Part 4: Hands-On Exercises (5 minutes setup)

### Exercise Set 1: Sub-agent Exploration

Participants will create and test these scenarios:

**1. Simple Delegation (Basic)**
```
Prompt: "Add two numbers using a sub-agent"
Goal: Understand basic sub-agent invocation
```

**2. Parallel Sub-agents (Intermediate)**
```
Scenario: "Clean the house"
Sub-agents run in parallel:
- Kitchen cleaning agent
- Bedroom cleaning agent  
- Bathroom cleaning agent
Main agent consolidates reports
```

**3. Multi-level Orchestration (Advanced)**
```
Question to answer: Can two sub-agents run, collect findings, 
then trigger a third sub-agent that processes those findings?

Example: Research agent 1 + Research agent 2 → Synthesis agent
```

**4. Nested Sub-agents (Experimental)**
```
Question: Can a sub-agent call another sub-agent?
Test: Create a coordinator → manager → worker hierarchy
Goal: Determine maximum modularization depth
```

### Exercise Set 2: Hooks in Action

**1. Session Tracking**
- Implement sessionStart and sessionEnd logging
- Track session duration and prompt count

**2. Tool Usage Monitoring**
- Use preToolUse and postToolUse hooks
- Log which tools are used most frequently
- Calculate tool execution time

**3. Security Hook**
- Implement preToolUse validation
- Check for sensitive operations
- Log security-relevant tool calls

### Exercise Set 3: Real-world Orchestration

**Scenario:** Implement a feature using TDD workflow

```markdown
Main TDD Agent
  ├─> Red Agent (write failing tests) 
  ├─> Green Agent (implement code to pass)
  └─> Refactor Agent (improve code quality)
Iterate until complete
```

**Questions to explore:**
- How do agents share context between iterations?
- Can we maintain state across sub-agent calls?
- What's the best way to structure feedback loops?
- How do we handle blocking vs non-blocking operations?

---

## Discussion Topics

### Modularity and Workflow Limits

**Key questions for group discussion:**
1. How granular should sub-agent responsibilities be?
2. What's the practical limit on sub-agent depth/nesting?
3. When should we use sequential vs parallel sub-agents?
4. Can we create reusable agent "libraries" for common workflows?

### Real-world Applications

**Where would we use this?**
- Complex feature implementation with multiple phases
- Code migration projects (analyze → plan → implement → verify)
- Multi-service deployments with health checks
- Documentation generation from multiple sources
- Large-scale refactoring with validation gates

### Performance Considerations

- Token consumption: sub-agents vs single agent
- Execution time: parallel vs sequential
- Context window management strategies
- Model selection for different agent types

---

## Resources

### Documentation
- [VS Code Sub-agents Docs](https://code.visualstudio.com/docs/copilot/agents/subagents)
- [GitHub Hooks Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Custom Agents Guide](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [Hooks Configuration Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)

### Key Concepts Summary
- Sub-agents run in isolated context windows
- Hooks extend agent behavior at execution trigger points
- Orchestration patterns enable complex, multi-phase workflows
- Parallel execution improves performance for independent tasks
- Custom agents can be restricted to sub-agent use only

---

## Post-Training Action Items

1. **Download 5 sample prompts** for experimentation
2. Create a shared repository of useful orchestration patterns
3. Document team use cases where multi-agent workflows would help
4. Build example hook configurations for common scenarios
5. Establish best practices for agent naming and organization

---

## Questions to Answer During Session

- ✓ Can two sub-agents run in parallel and pass results to a third?
- ✓ Can a sub-agent call another sub-agent (nesting depth)?
- ✓ How much can we modularize agent workflows?
- ✓ What real-world workflows benefit from orchestration?
- ⚠ When does orchestration overhead outweigh benefits?
- ⚠ How do we debug complex multi-agent interactions?
