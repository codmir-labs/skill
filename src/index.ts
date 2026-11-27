/**
 * @codmir/skill
 *
 * AI-readable instructions for installing and configuring the Codmir SDK.
 * This package provides programmatic access to framework-specific setup
 * instructions that AI assistants can consume to generate accurate
 * installation code.
 *
 * @example
 * ```typescript
 * import { getInstallInstructions, getSupportedFrameworks } from '@codmir/skill';
 *
 * // List available frameworks
 * const frameworks = getSupportedFrameworks();
 * // ['nextjs', 'nextjs-app-router', 'nextjs-pages-router', 'express', ...]
 *
 * // Get instructions for a specific framework
 * const instructions = getInstallInstructions('nextjs');
 * console.log(instructions);
 * ```
 *
 * @packageDocumentation
 */

import {
  FRAMEWORK_INSTRUCTIONS,
  FRAMEWORK_NAMES,
  FRAMEWORK_IMPORTS,
  FRAMEWORK_VERIFICATION,
} from "./instructions";

// =============================================================================
// SKILL.md content (embedded at build time via tsup)
// =============================================================================

const SKILL_MD_CONTENT = `# Codmir SDK Installation Skill

> AI-readable instructions for installing and configuring the Codmir SDK.
> This document is designed to be consumed by AI assistants (Claude Code, Cursor, GitHub Copilot, etc.)
> to accurately set up Codmir error tracking, performance monitoring, and AI observability in any project.

## What is Codmir?

Codmir is an AI-powered error tracking and monitoring platform. The \`@codmir/sdk\` package captures errors, tracks performance, monitors AI API calls (OpenAI, Anthropic, etc.), and sends telemetry to the Codmir Overseer.

## Quick Start

\`\`\`bash
npm install @codmir/sdk
\`\`\`

Then use the framework-specific import:

| Framework | Import Path |
|---|---|
| Next.js | \`@codmir/sdk/nextjs\` |
| Express.js | \`@codmir/sdk/express\` |
| Remix | \`@codmir/sdk/remix\` |
| React Native | \`@codmir/sdk/react-native\` |
| Browser (vanilla JS) | \`@codmir/sdk/browser\` |

## Prerequisites

- Node.js >= 18
- A Codmir account and project (get one at codmir.com/get-started)
- Your project's DSN (found in Project Settings > SDK Setup)
- DSN format: \`https://<your-project>.codmir.com/api/overseer\`

## Environment Variables

\`\`\`env
CODMIR_DSN=https://your-project.codmir.com/api/overseer
NEXT_PUBLIC_CODMIR_DSN=https://your-project.codmir.com/api/overseer
\`\`\`

Use this package's programmatic API to get detailed, framework-specific instructions:

\`\`\`typescript
import { getInstallInstructions } from '@codmir/skill';
const instructions = getInstallInstructions('nextjs');
\`\`\`
`;

// =============================================================================
// Public API
// =============================================================================

/**
 * Framework identifier type.
 * Use `getSupportedFrameworks()` to get the full list of valid values.
 */
export type FrameworkId =
  | "nextjs"
  | "nextjs-app-router"
  | "nextjs-pages-router"
  | "express"
  | "remix"
  | "react-native"
  | "browser";

/**
 * Metadata about a supported framework.
 */
export interface FrameworkInfo {
  /** Machine-readable identifier */
  id: FrameworkId;
  /** Human-readable display name */
  name: string;
  /** SDK import path for this framework */
  importPath: string;
}

/**
 * Returns the framework-specific installation instructions as a multi-line string.
 *
 * The returned string contains step-by-step setup instructions with full code
 * examples, file paths, environment variable configuration, and verification steps.
 *
 * @param framework - Framework identifier (e.g., 'nextjs', 'express', 'remix')
 * @returns Installation instructions as a formatted markdown string
 * @throws {Error} If the framework is not supported
 *
 * @example
 * ```typescript
 * const instructions = getInstallInstructions('nextjs');
 * // Returns full Next.js setup guide with App Router + Pages Router instructions
 *
 * const expressInstructions = getInstallInstructions('express');
 * // Returns Express.js middleware setup with correct ordering
 * ```
 */
export function getInstallInstructions(framework: string): string {
  const normalizedFramework = framework.toLowerCase().trim();
  const instructions = FRAMEWORK_INSTRUCTIONS[normalizedFramework];

  if (!instructions) {
    const supported = Object.keys(FRAMEWORK_INSTRUCTIONS).join(", ");
    throw new Error(
      `Unsupported framework: "${framework}". Supported frameworks: ${supported}`
    );
  }

  return instructions;
}

/**
 * Returns the list of all supported framework identifiers.
 *
 * @returns Array of framework ID strings that can be passed to `getInstallInstructions()`
 *
 * @example
 * ```typescript
 * const frameworks = getSupportedFrameworks();
 * // ['nextjs', 'nextjs-app-router', 'nextjs-pages-router', 'express', 'remix',
 * //  'react-native', 'browser']
 * ```
 */
export function getSupportedFrameworks(): FrameworkId[] {
  return Object.keys(FRAMEWORK_INSTRUCTIONS) as FrameworkId[];
}

/**
 * Returns detailed metadata for all supported frameworks.
 *
 * @returns Array of framework info objects with id, name, and import path
 *
 * @example
 * ```typescript
 * const frameworks = getFrameworkList();
 * // [{ id: 'nextjs', name: 'Next.js', importPath: '@codmir/sdk/nextjs' }, ...]
 * ```
 */
export function getFrameworkList(): FrameworkInfo[] {
  return getSupportedFrameworks().map((id) => ({
    id,
    name: FRAMEWORK_NAMES[id] ?? id,
    importPath: FRAMEWORK_IMPORTS[id] ?? `@codmir/sdk/${id}`,
  }));
}

/**
 * Returns the entire SKILL.md content as a string.
 *
 * This is a summary document containing quick-start info, the import map,
 * prerequisites, and environment variable reference. For detailed per-framework
 * instructions, use `getInstallInstructions()`.
 *
 * @returns The full SKILL.md content as a string
 *
 * @example
 * ```typescript
 * const skill = getFullSkill();
 * // Pass to an AI assistant as context
 * ```
 */
export function getFullSkill(): string {
  return SKILL_MD_CONTENT;
}

/**
 * Returns a test connection code snippet for a specific framework.
 *
 * The returned code can be copy-pasted to verify the SDK is correctly
 * configured and sending events to the Codmir dashboard.
 *
 * @param framework - Framework identifier (e.g., 'nextjs', 'express')
 * @returns TypeScript code snippet for testing the connection
 * @throws {Error} If the framework is not supported
 *
 * @example
 * ```typescript
 * const code = getVerificationCode('express');
 * // Returns:
 * // import * as Codmir from '@codmir/sdk/express';
 * // Codmir.init({ dsn: process.env.CODMIR_DSN });
 * // Codmir.captureMessage('Express SDK setup complete', 'info');
 * ```
 */
export function getVerificationCode(framework: string): string {
  const normalizedFramework = framework.toLowerCase().trim();
  const code = FRAMEWORK_VERIFICATION[normalizedFramework];

  if (!code) {
    const supported = Object.keys(FRAMEWORK_VERIFICATION).join(", ");
    throw new Error(
      `Unsupported framework: "${framework}". Supported frameworks: ${supported}`
    );
  }

  return code;
}

/**
 * Returns the SDK import path for a given framework.
 *
 * @param framework - Framework identifier
 * @returns The npm import path (e.g., '@codmir/sdk/nextjs')
 * @throws {Error} If the framework is not supported
 *
 * @example
 * ```typescript
 * const importPath = getImportPath('express');
 * // '@codmir/sdk/express'
 * ```
 */
export function getImportPath(framework: string): string {
  const normalizedFramework = framework.toLowerCase().trim();
  const importPath = FRAMEWORK_IMPORTS[normalizedFramework];

  if (!importPath) {
    const supported = Object.keys(FRAMEWORK_IMPORTS).join(", ");
    throw new Error(
      `Unsupported framework: "${framework}". Supported frameworks: ${supported}`
    );
  }

  return importPath;
}

// Re-export instruction constants for direct access
export {
  NEXTJS_INSTRUCTIONS,
  NEXTJS_APP_ROUTER_INSTRUCTIONS,
  NEXTJS_PAGES_ROUTER_INSTRUCTIONS,
  EXPRESS_INSTRUCTIONS,
  REMIX_INSTRUCTIONS,
  REACT_NATIVE_INSTRUCTIONS,
  BROWSER_INSTRUCTIONS,
  FRAMEWORK_INSTRUCTIONS,
  FRAMEWORK_NAMES,
  FRAMEWORK_IMPORTS,
  FRAMEWORK_VERIFICATION,
} from "./instructions";
