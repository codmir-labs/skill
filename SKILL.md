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

The `@codmir/sdk` package captures errors, tracks performance, monitors AI API calls (OpenAI, Anthropic, etc.), and sends telemetry to Codmir. It provides framework-specific integrations for Next.js, Express, Remix, React Native, browser-only apps, and serverless platforms.

Key capabilities:
- **Error tracking** with stack traces, breadcrumbs, and user context
- **Performance monitoring** with traces and transaction sampling
- **Session replay** for reproducing user-facing bugs
- **AI monitoring** for tracking LLM token usage, costs, and latency
- **Serverless execution** for cloud-based compute workloads

### Prerequisites

- Node.js >= 18
- A Codmir account and project (sign up at [codmir.com/get-started](https://codmir.com/get-started))
- Your project's **Client Key** and **Secret Key**, found in **Project Settings > SDK Setup** in the Codmir dashboard

### Installation

```bash
# npm
npm install @codmir/sdk

# pnpm
pnpm add @codmir/sdk

# yarn
yarn add @codmir/sdk
```

---

## Framework-Specific Setup

### Next.js (App Router) -- Recommended for Next.js 14+

The Next.js App Router integration captures server-side errors, client-side exceptions, route transitions, and optionally enables session replay.

**Step 1: Create `instrumentation.ts` in your project root (next to `next.config.js`)**

```typescript
// instrumentation.ts
import * as Codmir from '@codmir/sdk/nextjs';

export function register() {
  Codmir.init({
    clientKey: process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,        // Capture 100% of transactions (reduce in production)
    replaysSessionSampleRate: 0.1, // Capture 10% of sessions for replay
    replaysOnErrorSampleRate: 1.0, // Always capture replay when an error occurs
  });
}

// Capture server-side request errors automatically
export const onRequestError = Codmir.captureRouterError;
```

**Step 2: Create a global error boundary at `app/global-error.tsx`**

```tsx
// app/global-error.tsx
'use client';

import * as Codmir from '@codmir/sdk/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Codmir.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

**Step 3: Add route-level error boundaries at `app/error.tsx`**

```tsx
// app/error.tsx
'use client';

import * as Codmir from '@codmir/sdk/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Codmir.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**Step 4: Update `next.config.js` to enable the instrumentation hook**

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

**Step 5: Add environment variables to `.env.local`**

```env
NEXT_PUBLIC_CODMIR_CLIENT_KEY=your_client_key_here
CODMIR_SECRET_KEY=your_secret_key_here
```

> **Important**: Use `NEXT_PUBLIC_` prefix for the client key so it is available on both server and client sides. The secret key should NOT use the `NEXT_PUBLIC_` prefix.

---

### Next.js (Pages Router)

For Next.js projects using the Pages Router (no `app/` directory).

**Step 1: Wrap `_app.tsx` with Codmir initialization**

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import * as Codmir from '@codmir/sdk/nextjs';

Codmir.init({
  clientKey: process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY,
  environment: process.env.NODE_ENV,
});

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

**Step 2: Add error reporting in `_error.tsx`**

```tsx
// pages/_error.tsx
import * as Codmir from '@codmir/sdk/nextjs';
import type { NextPageContext } from 'next';

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <p>
      {statusCode
        ? `A ${statusCode} error occurred on the server`
        : 'An error occurred on the client'}
    </p>
  );
}

ErrorPage.getInitialProps = async (ctx: NextPageContext) => {
  const { res, err } = ctx;
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  if (err) {
    Codmir.captureException(err);
    await Codmir.flush(2000);
  }

  return { statusCode };
};

export default ErrorPage;
```

**Step 3: Add environment variables to `.env.local`**

```env
NEXT_PUBLIC_CODMIR_CLIENT_KEY=your_client_key_here
CODMIR_SECRET_KEY=your_secret_key_here
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
  secretKey: process.env.CODMIR_SECRET_KEY,
  environment: process.env.NODE_ENV,
  extractUser: (req) => ({
    id: req.user?.id as string,
    email: req.user?.email as string,
  }),
});

const app = express();

// 1. Codmir request handler -- MUST be the first middleware
app.use(Codmir.requestHandler());

// 2. Codmir tracing handler (optional, for performance monitoring)
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
CODMIR_SECRET_KEY=your_secret_key_here
```

---

### Remix

The Remix integration captures server-side loader/action errors, client-side exceptions, and provides wrappers for route loaders and actions.

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
  secretKey: process.env.CODMIR_SECRET_KEY,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
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

**Step 3: Add a client-side error boundary in `root.tsx`**

```tsx
// app/root.tsx
import * as Codmir from '@codmir/sdk/remix';

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    Codmir.captureException(error);
  }

  return (
    <html>
      <body>
        <h1>Something went wrong</h1>
      </body>
    </html>
  );
}
```

**Step 4: Add environment variables**

```env
CODMIR_CLIENT_KEY=your_client_key_here
CODMIR_SECRET_KEY=your_secret_key_here
```

---

### React Native

The React Native integration captures JavaScript exceptions, native crashes (optional), and tracks screen views.

**Step 1: Install the SDK**

```bash
npm install @codmir/sdk
```

**Step 2: Initialize in `App.tsx`**

```tsx
// App.tsx
import * as Codmir from '@codmir/sdk/react-native';

Codmir.init({
  clientKey: 'your_client_key_here',
  environment: __DEV__ ? 'development' : 'production',
  captureNativeCrashes: true,
  trackScreenViews: true,
  trackAppState: true,
});

export default function App() {
  return (
    <Codmir.ErrorBoundary fallback={<ErrorFallbackScreen />}>
      <NavigationContainer>
        <YourApp />
      </NavigationContainer>
    </Codmir.ErrorBoundary>
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

Lightweight integration for browser-only applications without a framework.

**Option A: ES Module import**

```html
<!-- index.html -->
<script type="module">
  import { init, captureException, captureMessage } from '@codmir/sdk/browser';

  init({
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
  clientKey: import.meta.env.VITE_CODMIR_CLIENT_KEY, // Vite
  // or: process.env.REACT_APP_CODMIR_CLIENT_KEY      // Create React App
  environment: import.meta.env.MODE,
  captureGlobalErrors: true,
  captureUnhandledRejections: true,
});
```

**Option C: Script tag (CDN)**

```html
<!-- Load from CDN (once published) -->
<script src="https://cdn.codmir.com/sdk/browser/latest.min.js"></script>
<script>
  CodmirBrowser.init({
    clientKey: 'your_client_key_here',
  });
</script>
```

**Environment variables (for bundled apps)**

```env
# Vite
VITE_CODMIR_CLIENT_KEY=your_client_key_here

# Create React App
REACT_APP_CODMIR_CLIENT_KEY=your_client_key_here
```

---

### Serverless (AWS Lambda / Cloudflare Workers)

The serverless integration wraps your handler function to capture errors and flush events before the function exits.

**AWS Lambda**

```typescript
// handler.ts
import { codmir, fn } from '@codmir/sdk/serverless';

const app = codmir.App({ name: 'my-lambda-service' });

const processEvent = fn(app, {
  cpu: 1,
  memory: '512MB',
  timeout: 30,
})(async (event: AWSLambdaEvent) => {
  // Your handler logic
  const result = await processData(event.body);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});

// For local development
export const handler = processEvent.local;

// For cloud execution
export const cloudHandler = processEvent.remote;
```

**Cloudflare Workers**

```typescript
// src/index.ts
import { codmir, fn } from '@codmir/sdk/serverless';

const app = codmir.App({ name: 'my-worker' });

const handleRequest = fn(app, {
  cpu: 1,
  memory: '128MB',
  timeout: 30,
})(async (request: Request) => {
  try {
    const data = await processRequest(request);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handleRequest.local(request);
  },
};
```

**Environment variables**

```env
CODMIR_CLIENT_KEY=your_client_key_here
CODMIR_SECRET_KEY=your_secret_key_here
```

---

### AI Monitoring (OpenAI / Anthropic)

The AI monitoring integration wraps LLM client libraries to automatically track token usage, costs, latency, and errors.

**Step 1: Initialize AI monitoring**

```typescript
// src/ai-client.ts
import * as CodmirAI from '@codmir/sdk/ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

CodmirAI.init({
  clientKey: process.env.CODMIR_CLIENT_KEY,
  secretKey: process.env.CODMIR_SECRET_KEY,
  environment: process.env.NODE_ENV,
  trackTokenUsage: true,
  trackCosts: true,
  trackLatency: true,
  capturePrompts: false,    // Set true to capture prompts (privacy-sensitive)
  captureResponses: false,  // Set true to capture responses (privacy-sensitive)
  redactPatterns: [
    /sk-[a-zA-Z0-9]+/g,       // Redact OpenAI API keys
    /\b\d{3}-\d{2}-\d{4}\b/g, // Redact SSNs
  ],
});
```

**Step 2: Wrap your AI clients**

```typescript
// Wrap OpenAI -- all calls are now automatically tracked
const openai = CodmirAI.wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}));

// Wrap Anthropic -- all calls are now automatically tracked
const anthropic = CodmirAI.wrapAnthropic(new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}));

// Use them normally -- tracking happens transparently
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Step 3: Track custom AI providers**

```typescript
// For providers without a dedicated wrapper, use the generic tracker
const result = await CodmirAI.trackAICall(
  'custom-provider',
  { model: 'my-model', inputTokens: 100 },
  async () => {
    return await myCustomProvider.generate('Hello');
  }
);
```

**Step 4: Get usage summary**

```typescript
// View accumulated stats for the current session
const summary = CodmirAI.getAIUsageSummary();
console.log(summary);
// {
//   totalTokens: 15420,
//   totalCost: 0.23,
//   callCount: 42,
//   errorCount: 1,
//   avgLatencyMs: 850,
//   byModel: { 'gpt-4o': { tokens: 10000, cost: 0.15 }, ... }
// }
```

**Step 5: Add environment variables**

```env
CODMIR_CLIENT_KEY=your_client_key_here
CODMIR_SECRET_KEY=your_secret_key_here
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Core SDK API Reference

All framework integrations re-export these core functions:

| Function | Description |
|---|---|
| `init(config)` | Initialize the SDK with your client key and options |
| `captureException(error, context?)` | Manually capture an error |
| `captureMessage(message, level?)` | Send a custom message event |
| `setUser(user)` | Set user context (id, email, username) |
| `setTag(key, value)` | Set a single tag on all future events |
| `setTags(tags)` | Set multiple tags at once |
| `addBreadcrumb(breadcrumb)` | Add a breadcrumb for debugging context |
| `flush(timeout?)` | Flush pending events (use before process exit) |
| `close(timeout?)` | Flush and disable the SDK |

### SDK Config (shared config for all frameworks)

```typescript
{
  clientKey?: string;                    // Your project's client key
  secretKey?: string;                    // Your project's secret key (server-side only)
  environment?: string;                  // 'production' | 'staging' | 'development'
  release?: string;                      // Your app's version/release identifier
  enabled?: boolean;                     // Enable/disable the SDK (default: true)
  debug?: boolean;                       // Enable debug logging (default: false)
  sampleRate?: number;                   // Error sample rate 0-1 (default: 1.0)
  tracesSampleRate?: number;             // Performance trace sample rate 0-1
  replaysSessionSampleRate?: number;     // Session replay sample rate 0-1
  replaysOnErrorSampleRate?: number;     // Replay-on-error sample rate 0-1
  beforeSend?: (event) => event|null;    // Hook to modify/filter events
  initialUser?: UserContext;             // Pre-set user context
  initialTags?: Record<string, string>;  // Pre-set tags
}
```

---

## Verification

After completing the setup for your framework, verify the integration is working.

### Using the verify module

The SDK includes a built-in verification module that sends a test event and confirms the round-trip:

```typescript
import { verify, printVerifyResult } from '@codmir/sdk/verify';

const result = await verify({
  clientKey: process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY,
  onProgress: (step) => console.log(`[${step.status}] ${step.message}`),
});

console.log(printVerifyResult(result));
```

Or use the one-liner:

```typescript
import { quickVerify } from '@codmir/sdk/verify';

const connected = await quickVerify(process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY);
console.log(connected ? 'Connected!' : 'Failed to connect');
```

### Manual verification

**1. Send a test event**

```typescript
import * as Codmir from '@codmir/sdk/nextjs'; // or your platform-specific import

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

### Next.js

```typescript
// instrumentation.ts
import * as Codmir from '@codmir/sdk/nextjs';
import { quickVerify } from '@codmir/sdk/verify';

export async function register() {
  Codmir.init({ clientKey: process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY });
  const ok = await quickVerify(process.env.NEXT_PUBLIC_CODMIR_CLIENT_KEY!);
  console.log(ok ? 'Codmir connected!' : 'Codmir connection failed');
}
```

### Express.js

```typescript
import * as Codmir from '@codmir/sdk/express';
import { quickVerify } from '@codmir/sdk/verify';

Codmir.init({ clientKey: process.env.CODMIR_CLIENT_KEY });
quickVerify(process.env.CODMIR_CLIENT_KEY!).then(ok =>
  console.log(ok ? 'Codmir connected!' : 'Codmir connection failed')
);
```

### React Native

```typescript
import * as Codmir from '@codmir/sdk/react-native';
Codmir.init({ clientKey: 'your_client_key_here' });
Codmir.captureMessage('React Native SDK setup complete', 'info');
```

### Browser

```typescript
import * as Codmir from '@codmir/sdk/browser';
Codmir.init({ clientKey: 'your_client_key_here' });
Codmir.captureMessage('Browser SDK setup complete', 'info');
```

---

## Common Issues

| Problem | Cause | Solution |
|---|---|---|
| "Unauthorized" error | Invalid or expired client key | Go to **Project Settings > SDK Setup** in the Codmir dashboard and regenerate your keys. |
| No events appearing in dashboard | Events not flushed before process exits | Call `await Codmir.flush(5000)` before the process exits, especially in serverless/CLI contexts. |
| Events appearing in wrong project | Wrong client key configured | Verify the client key matches the project you are viewing in the dashboard. |
| Next.js server errors not captured | Missing `instrumentation.ts` | Create `instrumentation.ts` in the project root and add `instrumentationHook: true` to `next.config.js`. |
| Next.js client errors not captured | Missing error boundary | Add `app/global-error.tsx` and `app/error.tsx` with `Codmir.captureException(error)`. |
| Express errors not captured | `errorHandler()` placed before routes | Move `app.use(Codmir.errorHandler())` to AFTER all route definitions. |
| React Native crashes not reported | Missing `captureNativeCrashes: true` | Add `captureNativeCrashes: true` to the init config. |
| Duplicate events | SDK initialized multiple times | Guard with `Codmir.isOverseerInitialized()` or ensure `init()` is called once. |
| High event volume / costs | Sample rate too high in production | Set `sampleRate: 0.1` and `tracesSampleRate: 0.1` for production. |

---

## Environment Variables

```env
# Required -- your project's API keys
CODMIR_CLIENT_KEY=your_client_key_here
CODMIR_SECRET_KEY=your_secret_key_here

# Next.js (must use NEXT_PUBLIC_ prefix for client-side access)
NEXT_PUBLIC_CODMIR_CLIENT_KEY=your_client_key_here

# Vite
VITE_CODMIR_CLIENT_KEY=your_client_key_here

# Create React App
REACT_APP_CODMIR_CLIENT_KEY=your_client_key_here

# AI monitoring (provider keys -- only needed if using @codmir/sdk/ai)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
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
| Serverless (Lambda, Workers) | `@codmir/sdk/serverless` |
| AI Monitoring (OpenAI, Anthropic) | `@codmir/sdk/ai` |
| Verification | `@codmir/sdk/verify` |
| Core (direct access) | `@codmir/sdk/overseer` |
| API Client (project management) | `@codmir/sdk` |

---

## Version Compatibility

| SDK Version | Node.js | Next.js | React | React Native |
|---|---|---|---|---|
| 1.x | >= 18 | >= 14 | >= 18 | >= 0.72 |
