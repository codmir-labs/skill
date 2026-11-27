---
name: codmir
description: Connects an AI client to the Codmir MCP server and installs @codmir/sdk in a project. Use when asked to set up Codmir, its MCP tools, or Codmir error tracking and monitoring.
---
# Codmir Skill

> AI-readable instructions for installing and configuring Codmir.
> This document is designed to be consumed by AI assistants (Claude Code, Claude Desktop, Cursor, Windsurf, GitHub Copilot, etc.)
> to auto-configure Codmir tools and SDK integrations.

---

## MCP Server (AI Tool Integration)

The Codmir MCP Server gives AI assistants direct access to project management tools: creating tickets, managing sprints, executing AI tasks, debugging production errors, and controlling the desktop.

**Package:** `@codmir/mcp` ([npm](https://www.npmjs.com/package/@codmir/mcp)) | **Registry:** `com.codmir/mcp` ([MCP Registry](https://registry.modelcontextprotocol.io))

### Claude Code

Add to `.claude/mcp.json` in the project root (or `~/.claude/mcp.json` for global):

```json
{
  "mcpServers": {
    "codmir": {
      "command": "npx",
      "args": ["@codmir/mcp"],
      "env": {
        "CODMIR_API_TOKEN": "your-token-here",
        "CODMIR_USER_ID": "your-user-id-here"
      }
    }
  }
}
```

If the user has already run `codmir login`, the env block can be omitted -- the server reads credentials from `~/.codmir/credentials.json` automatically.

### Claude Desktop

Add to the Claude Desktop config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "codmir": {
      "command": "npx",
      "args": ["@codmir/mcp"],
      "env": {
        "CODMIR_API_TOKEN": "your-token-here",
        "CODMIR_USER_ID": "your-user-id-here"
      }
    }
  }
}
```

### Windsurf

Add to `.windsurf/mcp.json`:

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

### Cursor

Add to `.cursor/mcp.json`:

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

### VS Code

Add to `.vscode/mcp.json`:

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

### Authentication

The MCP server loads credentials in this order:

1. `~/.codmir/credentials.json` (created by `codmir login`)
2. Environment variables: `CODMIR_API_TOKEN`, `CODMIR_USER_ID`, `CODMIR_API_URL`

To authenticate interactively:

```bash
codmir login
```

This opens a browser, authenticates via GitHub/Google/Email, and saves a token to `~/.codmir/credentials.json`.

### Available MCP Tools

Once configured, the AI assistant gains these tools:

**Project Management:**

| Tool | Description |
|------|-------------|
| `list_todo` | List actionable tickets sorted by priority (open, in_progress, review) |
| `update_todo_status` | Mark a ticket as done, in-progress, review, or reopen |
| `create_ticket` | Create a new bug, feature, task, or improvement ticket |
| `list_project_tasks` | List all tasks for a project |
| `get_sprint_tasks` | Get tasks for current or specified sprint |
| `check_task_status` | Check status of a running task execution |

**AI Task Execution:**

| Tool | Description |
|------|-------------|
| `execute_task` | Run an AI-powered code task (bug fix, feature, refactor) |
| `store_conversation` | Save conversation as project documentation |
| `get_project_context` | Get project overview, tech stack, and activity |

**Error Debugging:**

| Tool | Description |
|------|-------------|
| `lookup_error` | Look up a production error by refId, digest, reportId, fingerprint, or issueId |
| `list_recent_errors` | List recent production errors with severity filtering |
| `get_error_context` | Get enriched error context with suggested files and AI debugging summary |

**SDK & Workspace:**

| Tool | Description |
|------|-------------|
| `get_sdk_reference` | Get Codmir SDK API reference for a topic |
| `generate_sdk_code` | Generate ready-to-use TypeScript/JavaScript code |
| `create_organization` | Create a new workspace |
| `create_project` | Create a project within an organization |
| `get_workspace_status` | Check workspace setup status |

**Desktop Control** (requires Codmir desktop app running):

| Tool | Description |
|------|-------------|
| `codmir_screenshot` | Capture a screenshot of the entire screen |
| `codmir_click` / `codmir_double_click` / `codmir_right_click` | Click at screen coordinates |
| `codmir_type` | Type text at the current cursor position |
| `codmir_key` | Press keyboard keys or key combinations |
| `codmir_scroll` | Scroll at coordinates |
| `codmir_mouse_move` | Move the mouse cursor |
| `codmir_shell` | Run a shell command on the desktop machine |
| `codmir_screen_info` | Get screen dimensions and frontmost app |
| `codmir_fetch_page` | Fetch a web page through the desktop agent |
| `codmir_scan_routes` | Scan multiple routes and return status codes |
| `codmir_list_directory` | List files and directories at a path |
| `codmir_connect` / `codmir_disconnect` | Start/end an agent desktop session |
| `codmir_status` | Check if the desktop agent is running |

### MCP Verification

After configuring, verify the connection:

1. Restart your editor/Claude Desktop
2. Ask: "What's on my to-do list?" or "Check my workspace status"
3. The AI should call `list_todo` or `get_workspace_status` and return results

If you get "Not authenticated", run `codmir login` in a terminal.

---

## SDK (Error Tracking & Monitoring)

The `@codmir/sdk` package captures errors and messages with breadcrumbs and sends the events to Codmir. It provides framework-specific integrations for Next.js, Express, Remix, React Native and browser-only apps. For serverless functions, use the `overseer` entry. These steps were checked against `@codmir/sdk` 2.0.1, the latest release on npm on 2026-11-23.

Key capabilities:
- **Error tracking** with stack traces, breadcrumbs, and user context

### Prerequisites

- Node.js >= 18
- A Codmir account and project (sign up at [codmir.com/get-started](https://codmir.com/get-started))
- Your project's **Client Key**, found in **Project Settings > SDK Setup** in the Codmir dashboard. The SDK sends it with every event, in the `x-overseer-key` header. 2.0.1 does not use a **Secret Key**, so no step below sets one.

### Installation

```bash
# npm
npm install @codmir/sdk

# pnpm
pnpm add @codmir/sdk

# yarn
yarn add @codmir/sdk
```

**TypeScript**: 2.0.1 ships no type declarations, although its `package.json` names them, so with `strict` on, `tsc` stops at each import with `TS7016: Could not find a declaration file`. Add a declaration file that your `tsconfig.json` includes:

```typescript
// codmir-sdk.d.ts
declare module '@codmir/sdk/*';
```

> **Browser bundles**: every error-tracking entry of 2.0.1 (`/nextjs`, `/express`, `/remix`, `/react-native`, `/browser`, `/ai`, `/verify` and `/overseer`) imports Node's `events`, `crypto`, `fs`, `os` and `path` modules, through a chunk it shares with the package's agent code. Code that runs in Node is not affected. A build for the browser stops at these imports unless it supplies them: `vite build` (Vite 6.4.1) and `remix vite:build` (Remix 2.17.5) fail with `"EventEmitter" is not exported by "__vite-browser-external"`, `next build` (Next.js 15.5.29) with `Module not found: Can't resolve 'fs'`, and esbuild with `--platform=browser` with `Could not resolve "events"`.

---

## Framework-Specific Setup

### Next.js (App Router) -- Recommended for Next.js 15+

The Next.js App Router integration captures server-side request errors through `instrumentation.ts`. Next.js calls its `onRequestError` from version 15 on: on Next.js 14.2.35, an error thrown while a page rendered on the server sent nothing.

**Step 1: Create `instrumentation.ts` in your project root (next to `next.config.js`)**

```typescript
// instrumentation.ts
// Next.js also builds this file for the Edge runtime (for middleware, for example), where
// 2.0.1 cannot load: import the SDK only when the server runs on Node.js
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Codmir = await import('@codmir/sdk/nextjs');
    Codmir.init({
      clientKey: process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY,
      environment: process.env.NODE_ENV,
    });
  }
}

// Capture server-side request errors automatically (Next.js 15 and later call this)
export async function onRequestError(error: unknown, request: unknown, context: unknown) {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Codmir = await import('@codmir/sdk/nextjs');
    await Codmir.captureRouterError(error, request, context);
  }
}
```

**Step 2: Keep `@codmir/sdk` out of client components**

On 2.0.1, do not import `@codmir/sdk/nextjs` in a file that runs in the browser, such as an `app/error.tsx` or `app/global-error.tsx` error boundary: `next build` then stops with `Module not found: Can't resolve 'fs'` (see **Browser bundles** under Installation). Step 1 captures the errors that reach Next.js on the server, including one thrown while a Server Component renders; errors thrown in the browser are not captured on 2.0.1.

**Step 3: On Next.js 14, enable the instrumentation hook in `next.config.js`**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
```

Next.js 15 and later load `instrumentation.ts` without it, and warn that `experimental.instrumentationHook` is no longer needed.

**Step 4: Add environment variables to `.env.local`**

```env
NEXT_PUBLIC_CODMIR_CLIENT_KEY=your_client_key_here
```

> **Important**: Use `NEXT_PUBLIC_` prefix for the client key so it is available on both server and client sides.

---

### Next.js (Pages Router)

For Next.js projects using the Pages Router (no `app/` directory).

**Step 1: Create `instrumentation.ts` in your project root**

Use the file from Next.js (App Router), Step 1, and on Next.js 14 its Step 3 as well. Its `onRequestError` receives Pages Router errors too: on Next.js 15.5.29, an error thrown in `getServerSideProps` was sent with `routerKind: 'Pages Router'`.

**Step 2: Keep `@codmir/sdk` out of `_app.tsx` and `_error.tsx`**

Next.js bundles `pages/_app.tsx` and `pages/_error.tsx` for the browser as well, so on 2.0.1 an import of `@codmir/sdk/nextjs` in either one stops `next build` with `Module not found: Can't resolve 'fs'` (see **Browser bundles** under Installation).

**Step 3: Add environment variables to `.env.local`**

```env
NEXT_PUBLIC_CODMIR_CLIENT_KEY=your_client_key_here
```

---

### Express.js

The Express integration provides request/response tracking, automatic error capture, and tracing middleware.

**Step 1: Install the SDK**

```bash
npm install @codmir/sdk
```

**Step 2: Add Codmir middleware to your Express app**

The middleware order matters: `requestHandler` must be first, `errorHandler` must be last (after all routes).

```typescript
// src/app.ts (or wherever your Express app is created)
import express from 'express';
import * as Codmir from '@codmir/sdk/express';

// Initialize Codmir BEFORE creating the app
Codmir.init({
  clientKey: process.env.CODMIR_CLIENT_KEY,
  environment: process.env.NODE_ENV,
  extractUser: (req) => ({
    id: req.user?.id as string,
    email: req.user?.email as string,
  }),
});

const app = express();

// 1. Codmir request handler -- MUST be the first middleware
app.use(Codmir.requestHandler());

// 2. Codmir tracing handler (optional: records each response's status and duration as a breadcrumb)
app.use(Codmir.tracingHandler());

// 3. Your other middleware
app.use(express.json());

// 4. Your routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/error-test', (req, res) => {
  throw new Error('Test error for Codmir');
});

// 5. Codmir error handler -- MUST be after all routes and other error handlers
app.use(Codmir.errorHandler());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**Step 3: Add environment variables**

```env
CODMIR_CLIENT_KEY=your_client_key_here
```

---

### Remix

The Remix integration captures server-side errors through `handleError` and the loader and action wrappers.

**Step 1: Initialize in `entry.server.tsx`**

```typescript
// app/entry.server.tsx
import * as Codmir from '@codmir/sdk/remix';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { RemixServer } from '@remix-run/react';
import type { EntryContext } from '@remix-run/node';

Codmir.init({
  clientKey: process.env.CODMIR_CLIENT_KEY,
  environment: process.env.NODE_ENV,
});

// Export error handler for Remix to call on server errors
export const handleError = Codmir.handleError;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // ... your existing render logic
}
```

**Step 2: Wrap loaders and actions in your route files**

```typescript
// app/routes/dashboard.tsx
import { json } from '@remix-run/node';
import { wrapLoader, wrapAction } from '@codmir/sdk/remix';

export const loader = wrapLoader(async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
});

export const action = wrapAction(async ({ request }) => {
  const formData = await request.formData();
  // process form...
  return json({ success: true });
});
```

**Step 3: Keep `@codmir/sdk` out of `root.tsx`**

Remix bundles `app/root.tsx` for the browser as well, so on 2.0.1 an `ErrorBoundary` there that calls `Codmir.captureException` stops `remix vite:build` with `"EventEmitter" is not exported by "__vite-browser-external"` (see **Browser bundles** under Installation). Errors on the server reach Codmir through `handleError` (Step 1). The route files of Step 2 are not affected: Remix drops `loader` and `action`, and the imports only they use, from the browser build.

**Step 4: Add environment variables**

```env
CODMIR_CLIENT_KEY=your_client_key_here
```

---

### React Native

The React Native entry has `init`, which starts the client and then installs a global handler for JavaScript errors, `createErrorBoundary`, which builds an error boundary for your component tree, and `addBreadcrumb` for the navigation breadcrumbs you add.

> **Warning**: On 2.0.1, `init` throws a `TypeError` in a React Native app before it captures anything. It reads `window.location.origin` to build its default endpoint, even when you pass a `dsn`, and React Native makes `window` the global object without a `location`. Run `npm view @codmir/sdk version` first; if it prints 2.0.1, tell the user this setup does not run on it yet.

**Step 1: Install the SDK**

```bash
npm install @codmir/sdk
```

**Step 2: Initialize in `App.tsx`**

```tsx
// App.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Codmir from '@codmir/sdk/react-native';

Codmir.init({
  dsn: 'https://codmir.com/api/overseer',
  clientKey: 'your_client_key_here',
  environment: __DEV__ ? 'development' : 'production',
});

// createErrorBoundary builds the error boundary class from your React
const ErrorBoundary = Codmir.createErrorBoundary(React);

export default function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallbackScreen />}>
      <NavigationContainer>
        <YourApp />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

function ErrorFallbackScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Something went wrong. Please restart the app.</Text>
    </View>
  );
}
```

**Step 3: Track navigation (React Navigation)**

```tsx
// App.tsx (add to your NavigationContainer)
import * as Codmir from '@codmir/sdk/react-native';

<NavigationContainer
  onStateChange={(state) => {
    const currentRoute = state?.routes[state.index];
    if (currentRoute) {
      Codmir.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${currentRoute.name}`,
        data: { route: currentRoute.name, params: currentRoute.params },
      });
    }
  }}
>
```

**Step 4: Capture errors in async operations**

```typescript
try {
  const data = await fetchUserProfile();
} catch (error) {
  Codmir.captureException(error, { context: 'fetchUserProfile' });
}
```

> **Note**: In React Native there is no `.env` file by default. Use `react-native-config` or similar for environment-based configuration instead of hardcoding the client key.

---

### Browser (Vanilla JS / TypeScript)

Integration for browser-only applications without a framework. Pass a `dsn` to `init`: with a client key and no `dsn`, 2.0.1 sends events to `/api/overseer/ingest` on the page's own origin instead of to Codmir.

> **Warning**: On 2.0.1 a browser bundle of this entry fails: see **Browser bundles** under Installation. Run `npm view @codmir/sdk version` first; if it prints 2.0.1, tell the user the browser setup does not build on it yet.

**Option A: ES Module import**

```html
<!-- index.html -->
<script type="module">
  import { init, captureException, captureMessage } from '@codmir/sdk/browser';

  init({
    dsn: 'https://codmir.com/api/overseer',
    clientKey: 'your_client_key_here',
    environment: 'production',
    captureGlobalErrors: true,
    captureUnhandledRejections: true,
    captureConsoleErrors: true,
    trackClicks: true,
  });

  // Test that it works
  captureMessage('Codmir browser SDK initialized', 'info');
</script>
```

**Option B: Bundled application (Vite, Webpack, etc.)**

```typescript
// src/main.ts
import * as Codmir from '@codmir/sdk/browser';

Codmir.init({
  dsn: 'https://codmir.com/api/overseer',
  clientKey: import.meta.env.VITE_CODMIR_CLIENT_KEY, // Vite
  // or: process.env.REACT_APP_CODMIR_CLIENT_KEY      // Create React App
  environment: import.meta.env.MODE,
  captureGlobalErrors: true,
  captureUnhandledRejections: true,
});
```

**Option C: Script tag (CDN)**

2.0.1 has no build for a script tag: `cdn.codmir.com` does not resolve, and no file in the package defines a `CodmirBrowser` global. Options A and B are the only ways to load it, and the warning above applies to both.

**Environment variables (for bundled apps)**

```env
# Vite
VITE_CODMIR_CLIENT_KEY=your_client_key_here

# Create React App
REACT_APP_CODMIR_CLIENT_KEY=your_client_key_here
```

---

### Serverless functions

Error tracking in a serverless function (AWS Lambda, Cloudflare Workers) uses `@codmir/sdk/overseer`: call `Codmir.init` with your client key once, outside the handler, and `Codmir.captureException` in the handler's `catch`. Then `await Codmir.flush()` before the function returns. Events are sent about a second after the last capture, and a frozen function never gets that second.

---

## Core SDK API Reference

The framework entries (`/nextjs`, `/express`, `/remix`, `/react-native`, `/browser`) and `@codmir/sdk/overseer` export these functions, except where a row says otherwise.

| Function | Description |
|---|---|
| `init(config)` | Initialize the SDK with your client key and options |
| `captureException(error, context?)` | Manually capture an error |
| `captureMessage(message, level?)` | Send a custom message event |
| `setUser(user)` | Set user context (id, email, username) |
| `setTag(key, value)` | Set a single tag on all future events (not in `/browser` or `/react-native`) |
| `setTags(tags)` | Set multiple tags at once |
| `addBreadcrumb(breadcrumb)` | Add a breadcrumb for debugging context |
| `flush(timeout?)` | Send queued events now (use before process exit); 2.0.1 ignores `timeout` |
| `close()` | Stop the flush timer and send queued events. The SDK stays on: events captured after `close()` are still sent |

### SDK Config (shared config for all frameworks)

```typescript
{
  dsn?: string;                          // Events go to <dsn>/ingest. Default with a client key: https://codmir.com/api/overseer
                                         // in Node, /api/overseer on the page's own origin in a browser
  clientKey?: string;                    // Your project's client key, sent as the x-overseer-key header
  environment?: string;                  // 'production' | 'staging' | 'development' (default: 'development')
  release?: string;                      // Your app's version/release identifier
  enabled?: boolean;                     // Enable/disable the SDK (default: true)
  debug?: boolean;                       // Enable debug logging (default: false)
  sampleRate?: number;                   // Event sample rate 0-1 (default: 1.0)
  beforeSend?: (event) => event|null;    // Hook to modify/filter events
  initialUser?: UserContext;             // Pre-set user context
  initialTags?: Record<string, string>;  // Pre-set tags
}
```

2.0.1 also accepts `secretKey`, `tracesSampleRate`, `replaysSessionSampleRate` and `replaysOnErrorSampleRate`, and stores them without using them.

---

## Verification

After completing the setup for your framework, verify the integration is working.

### Using the verify module

The SDK includes a verification module. `verify()` calls `init` with the config you pass, sends the test message `Codmir SDK setup verified`, and flushes it. In 2.0.1 it does not read the server's answer: it reports `success: true` and a `Connection verified` step even when the request was refused or failed, so confirm the event in the dashboard (see Manual verification, step 2).

```typescript
import { verify, printVerifyResult } from '@codmir/sdk/verify';

const result = await verify({
  clientKey: process.env.CODMIR_CLIENT_KEY,
  onProgress: (step) => console.log(`[${step.status}] ${step.message}`),
});

console.log(printVerifyResult(result));
```

Or use the one-liner, which runs `verify()` and returns its `success`. It treats its argument as a client key only when it starts with `osk_` or `csk_`, and as a `dsn` otherwise:

```typescript
import { quickVerify } from '@codmir/sdk/verify';

const sent = await quickVerify(process.env.CODMIR_CLIENT_KEY);
console.log(sent ? 'Test event sent: look for it in the dashboard' : 'The SDK did not capture the test event');
```

Run these from a script of their own: because `verify()` calls `init`, it replaces the client your app set up, and the tags it adds (`source` and `sdk_version`) stay on that client's later events.

### Manual verification

**1. Send a test event**

```typescript
// A script of its own, run with Node.js (or use your framework's snippet under Test Connection Snippets)
import * as Codmir from '@codmir/sdk/overseer';
Codmir.init({ clientKey: process.env.CODMIR_CLIENT_KEY });
Codmir.captureMessage('SDK setup complete', 'info');
// Flush to ensure events are sent before the process exits
await Codmir.flush(5000);
```

**2. Check the dashboard**

Navigate to your project in the Codmir dashboard. You should see:
- **"Connected"** status in **Project Settings > SDK Status**
- The test event in the events list

**3. Verify in production**

- Deploy your application with the SDK configured
- Trigger a test error (e.g., visit a route that throws)
- Check the Codmir dashboard for the captured event within 60 seconds

---

## Test Connection Snippets

Each snippet sends one test message; look for it in the dashboard.

### Next.js

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Codmir = await import('@codmir/sdk/nextjs');
    Codmir.init({ clientKey: process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY });
    Codmir.captureMessage('Next.js SDK setup complete', 'info');
    await Codmir.flush();
  }
}
```

### Express.js

```typescript
import * as Codmir from '@codmir/sdk/express';

Codmir.init({ clientKey: process.env.CODMIR_CLIENT_KEY });
Codmir.captureMessage('Express SDK setup complete', 'info');
Codmir.flush();
```

### React Native

```typescript
import * as Codmir from '@codmir/sdk/react-native';
Codmir.init({ dsn: 'https://codmir.com/api/overseer', clientKey: 'your_client_key_here' });
Codmir.captureMessage('React Native SDK setup complete', 'info');
```

### Browser

```typescript
import * as Codmir from '@codmir/sdk/browser';
Codmir.init({ dsn: 'https://codmir.com/api/overseer', clientKey: 'your_client_key_here' });
Codmir.captureMessage('Browser SDK setup complete', 'info');
```

---

## Common Issues

| Problem | Cause | Solution |
|---|---|---|
| Events never appear, and nothing reports an error | Invalid or expired client key: 2.0.1 does not read the server's answer | Go to **Project Settings > SDK Setup** in the Codmir dashboard and check or regenerate your client key. |
| No events appearing in dashboard | Events not flushed before process exits | Call `await Codmir.flush(5000)` before the process exits, especially in serverless/CLI contexts. |
| Browser events go to your own site | A browser `init` with a client key and no `dsn` | Pass `dsn: 'https://codmir.com/api/overseer'` to `init`. |
| Events appearing in wrong project | Wrong client key configured | Verify the client key matches the project you are viewing in the dashboard. |
| Next.js server errors not captured | Missing `instrumentation.ts`, or Next.js 14, which does not call `onRequestError` | Create `instrumentation.ts` in the project root (Next.js (App Router), Step 1), on Next.js 15 or later. |
| Next.js client errors not captured | 2.0.1 does not build for the browser, so no step runs it there | See Next.js (App Router), Step 2. |
| `next build` fails with `Module not found: Can't resolve 'fs'` or `'crypto'` | `@codmir/sdk/nextjs` imported in a client component, `_app.tsx` or `_error.tsx`, or at the top of `instrumentation.ts` | Follow Next.js (App Router), Steps 1 and 2. |
| Express errors not captured | `errorHandler()` placed before routes | Move `app.use(Codmir.errorHandler())` to AFTER all route definitions. |
| React Native errors not reported | On 2.0.1, `init` throws in React Native (see React Native), and native crashes are never reported: `captureNativeCrashes` is accepted and not read | Check for a newer `@codmir/sdk` release. |
| Duplicate events | SDK initialized multiple times | Guard with `Codmir.isOverseerInitialized()`, which the framework entries export (`/ai` and `/overseer` do not), or ensure `init()` is called once. |
| High event volume / costs | Sample rate too high in production | Set `sampleRate: 0.1` for production. |

---

## Environment Variables

```env
# Required -- your project's client key
CODMIR_CLIENT_KEY=your_client_key_here

# Next.js (must use NEXT_PUBLIC_ prefix for client-side access)
NEXT_PUBLIC_CODMIR_CLIENT_KEY=your_client_key_here

# Vite
VITE_CODMIR_CLIENT_KEY=your_client_key_here

# Create React App
REACT_APP_CODMIR_CLIENT_KEY=your_client_key_here
```

---

## Import Map (which import to use)

| Framework | Import Path |
|---|---|
| Next.js (App Router or Pages Router) | `@codmir/sdk/nextjs` |
| Express.js | `@codmir/sdk/express` |
| Remix | `@codmir/sdk/remix` |
| React Native | `@codmir/sdk/react-native` |
| Browser (vanilla JS) | `@codmir/sdk/browser` |
| Verification | `@codmir/sdk/verify` |
| Core (direct access) | `@codmir/sdk/overseer` |
| API Client (project management) | `@codmir/sdk` |

---

## Version Compatibility

| SDK Version | Node.js | Next.js | React | React Native |
|---|---|---|---|---|
| 2.0.1 | >= 18 | >= 14 | >= 18 | >= 0.72 |
