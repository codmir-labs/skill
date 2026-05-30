<p align="center">
  <a href="https://codmir.com">
    <img src="https://codmir.com/logo-dark.svg" alt="Codmir" width="200" />
  </a>
</p>

<h3 align="center">AI-readable skill for installing Codmir SDK and MCP Server</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@codmir/mcp"><img src="https://img.shields.io/npm/v/@codmir/mcp?style=flat-square&color=blue&label=mcp" alt="mcp" /></a>
  <a href="https://www.npmjs.com/package/@codmir/skill"><img src="https://img.shields.io/npm/v/@codmir/skill?style=flat-square&color=blue&label=skill" alt="skill" /></a>
  <a href="https://github.com/codmir-labs/skill/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-orange?style=flat-square" alt="license" /></a>
</p>

---

## What is this?

This repo contains structured, AI-readable instructions ([SKILL.md](SKILL.md)) that AI assistants can follow to:

1. **Auto-configure the Codmir MCP Server** — Gives Claude (Desktop & Code), Windsurf, Cursor, and VS Code access to Codmir's project management tools: tickets, sprints, task execution, error debugging, and desktop control.

2. **Install the Codmir SDK** — Set up error tracking, performance monitoring, session replay, and AI observability in any project (Next.js, Express, Remix, React Native, browser, serverless).

## Quick Start

### For AI Assistants

Point your AI tool to the [SKILL.md](SKILL.md) file. It contains everything needed to:
- Configure `@codmir/mcp` as an MCP server (Claude Desktop, Claude Code, Windsurf, Cursor, VS Code)
- Install `@codmir/sdk` into any supported framework

### MCP Server Setup (for AI tools)

The fastest way to give your AI assistant access to Codmir tools:

```bash
# 1. Install globally (optional, npx works without this)
npm install -g @codmir/mcp

# 2. Authenticate
codmir login

# 3. Add to your AI tool's MCP config (see SKILL.md for editor-specific paths)
```

**Claude Code** — add to `.claude/mcp.json`:
```json
{
  "mcpServers": {
    "codmir": {
      "command": "npx",
      "args": ["@codmir/mcp"]
    }
  }
}
```

**Claude Desktop** — add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "codmir": {
      "command": "npx",
      "args": ["@codmir/mcp"]
    }
  }
}
```

Once configured, your AI can create tickets, manage sprints, execute code tasks, debug production errors, and more — all through natural language.

### SDK Installation

```bash
npm install @codmir/sdk
```

See [SKILL.md](SKILL.md) for framework-specific setup (Next.js, Express, Remix, React Native, etc.).

### Programmatic Usage

```typescript
import { getInstallInstructions, getSupportedFrameworks } from '@codmir/skill'

const frameworks = getSupportedFrameworks()
const instructions = getInstallInstructions('nextjs')
```

## What the MCP Server Provides

Once the MCP server is configured, your AI assistant gets 33 tools:

| Category | Tools |
|----------|-------|
| **Project Management** | `list_todo`, `update_todo_status`, `create_ticket`, `list_project_tasks`, `get_sprint_tasks`, `check_task_status` |
| **AI Task Execution** | `execute_task`, `store_conversation`, `get_project_context` |
| **Error Debugging** | `lookup_error`, `list_recent_errors`, `get_error_context` |
| **SDK & Workspace** | `get_sdk_reference`, `generate_sdk_code`, `create_organization`, `create_project`, `get_workspace_status` |
| **Desktop Control** | `codmir_screenshot`, `codmir_click`, `codmir_type`, `codmir_key`, `codmir_scroll`, `codmir_shell`, `codmir_fetch_page`, `codmir_scan_routes`, and more |

## Links

- [MCP Registry](https://registry.modelcontextprotocol.io) — `com.codmir/mcp`
- [npm: @codmir/mcp](https://www.npmjs.com/package/@codmir/mcp)
- [Website](https://codmir.com)
- [Documentation](https://codmir.com/docs)

## License

Apache 2.0 — see [LICENSE](LICENSE).

---

<p align="center">
  <b>Built by <a href="https://codmir.com">Codmir Labs</a></b>
</p>
