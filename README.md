<p align="center">
  <a href="https://codmir.com">
    <img src="https://codmir.com/logo-dark.svg" alt="Codmir" width="200" />
  </a>
</p>

<h3 align="center">AI-readable instructions for installing the Codmir SDK</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@codmir/skill"><img src="https://img.shields.io/npm/v/@codmir/skill?style=flat-square&color=blue" alt="npm" /></a>
  <a href="https://github.com/codmir-labs/skill/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-orange?style=flat-square" alt="license" /></a>
</p>

---

## What is this?

This package provides structured, AI-readable instructions for installing and configuring the [Codmir SDK](https://github.com/codmir-labs/sdk) into any project. It's designed for:

- **Claude Code** / **Cursor** / **Copilot** — AI assistants that can read these instructions and auto-configure Codmir in your project
- **MCP servers** — Serve installation instructions as tool context
- **CLI wizards** — Programmatic access to setup steps per framework
- **Documentation** — Framework-specific guides you can embed anywhere

## Quick Start

### For AI Assistants

Point your AI tool to the [SKILL.md](SKILL.md) file — it contains everything needed to install Codmir into any supported framework.

### Programmatic Usage

```typescript
import { getInstallInstructions, getSupportedFrameworks } from '@codmir/skill'

// Get all supported frameworks
const frameworks = getSupportedFrameworks()
// ['nextjs', 'express', 'remix', 'react-native', 'browser', 'serverless', 'ai-monitor']

// Get setup instructions for Express
const instructions = getInstallInstructions('express')
// Returns full markdown with step-by-step setup, code examples, and verification

// Get test connection code for a framework
import { getVerificationCode } from '@codmir/skill'
const testCode = getVerificationCode('nextjs')
```

## Supported Frameworks

| Framework | ID | SDK Import |
|-----------|-----|-----------|
| Next.js (App Router) | `nextjs` | `@codmir/sdk/nextjs` |
| Express.js | `express` | `@codmir/sdk/express` |
| Remix | `remix` | `@codmir/sdk/remix` |
| React Native | `react-native` | `@codmir/sdk/react-native` |
| Browser | `browser` | `@codmir/sdk/browser` |
| Serverless | `serverless` | `@codmir/sdk/serverless` |
| AI Monitoring | `ai-monitor` | `@codmir/sdk/ai` |

## The Key File: SKILL.md

[`SKILL.md`](SKILL.md) is the comprehensive installation guide. It covers:

- Prerequisites and DSN setup
- Framework-specific installation with full code examples
- File paths and exact placement instructions
- Environment variable configuration
- Connection verification steps
- Common issues and troubleshooting

AI assistants can read this single file and generate a complete SDK integration for any supported framework.

## License

Apache 2.0 — see [LICENSE](LICENSE).

---

<p align="center">
  <b>Built by <a href="https://codmir.com">Codmir Labs</a></b>
</p>
