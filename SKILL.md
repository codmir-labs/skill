# Codmir SDK Installation Skill

> AI-readable instructions for installing and configuring the Codmir SDK.
> This document is designed to be consumed by AI assistants (Claude Code, Cursor, GitHub Copilot, etc.)
> to accurately set up Codmir error tracking, performance monitoring, and AI observability in any project.

---

## What is Codmir?

Codmir is an AI-powered error tracking and monitoring platform. The `@codmir/sdk` package captures errors, tracks performance, monitors AI API calls (OpenAI, Anthropic, etc.), and sends telemetry to the Codmir Overseer. It provides framework-specific integrations for Next.js, Express, Remix, React Native, browser-only apps, and serverless platforms.

Key capabilities:
- **Error tracking** with stack traces, breadcrumbs, and user context
- **Performance monitoring** with traces and transaction sampling
- **Session replay** for reproducing user-facing bugs
- **AI monitoring** for tracking LLM token usage, costs, and latency
- **Serverless execution** for cloud-based compute workloads

## Prerequisites

- Node.js >= 18
- A Codmir account and project (sign up at [codmir.com/get-started](https://codmir.com/get-started))
- Your project's DSN (Data Source Name), found in **Project Settings > SDK Setup** in the Codmir dashboard
- The DSN format is: `https://<your-project>.codmir.com/api/overseer`

## Installation

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
    dsn: process.env.NEXT_PUBLIC_CODMIR_DSN,
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
NEXT_PUBLIC_CODMIR_DSN=https://your-project.codmir.com/api/overseer
```

> **Important**: Use `NEXT_PUBLIC_` prefix so the DSN is available on both server and client sides.

---

### Next.js (Pages Router)

For Next.js projects using the Pages Router (no `app/` directory).

**Step 1: Wrap `_app.tsx` with Codmir initialization**

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import * as Codmir from '@codmir/sdk/nextjs';
import { useEffect } from 'react';

Codmir.init({
  dsn: process.env.NEXT_PUBLIC_CODMIR_DSN,
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
NEXT_PUBLIC_CODMIR_DSN=https://your-project.codmir.com/api/overseer
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
  dsn: process.env.CODMIR_DSN,
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
CODMIR_DSN=https://your-project.codmir.com/api/overseer
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
  dsn: process.env.CODMIR_DSN,
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
CODMIR_DSN=https://your-project.codmir.com/api/overseer
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
  dsn: 'https://your-project.codmir.com/api/overseer',
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

> **Note**: The DSN is hardcoded in React Native since there is no `.env` file by default. Use `react-native-config` or similar for environment-based configuration.

---

### Browser (Vanilla JS / TypeScript)

Lightweight integration for browser-only applications without a framework.

**Option A: ES Module import**

```html
<!-- index.html -->
<script type="module">
  import { init, captureException, captureMessage } from '@codmir/sdk/browser';

  init({
    dsn: 'https://your-project.codmir.com/api/overseer',
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
  dsn: import.meta.env.VITE_CODMIR_DSN, // Vite
  // or: process.env.REACT_APP_CODMIR_DSN // Create React App
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
    dsn: 'https://your-project.codmir.com/api/overseer',
  });
</script>
```

**Environment variables (for bundled apps)**

```env
# Vite
VITE_CODMIR_DSN=https://your-project.codmir.com/api/overseer

# Create React App
REACT_APP_CODMIR_DSN=https://your-project.codmir.com/api/overseer
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

**General serverless wrapper pattern**

```typescript
import { createApp, createFunction } from '@codmir/sdk/serverless';

const app = createApp({ name: 'my-service' });

const myFunction = createFunction(app, {
  cpu: 2,
  memory: '4GB',
  timeout: 300,
});

const handler = myFunction(async (input: string) => {
  // Your computation logic
  return processedResult;
});
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
  dsn: process.env.CODMIR_DSN,
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
CODMIR_DSN=https://your-project.codmir.com/api/overseer
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Core SDK API Reference

All framework integrations re-export these core functions:

| Function | Description |
|---|---|
| `init(config)` | Initialize the SDK with your DSN and options |
| `captureException(error, context?)` | Manually capture an error |
| `captureMessage(message, level?)` | Send a custom message event |
| `setUser(user)` | Set user context (id, email, username) |
| `setTag(key, value)` | Set a single tag on all future events |
| `setTags(tags)` | Set multiple tags at once |
| `addBreadcrumb(breadcrumb)` | Add a breadcrumb for debugging context |
| `flush(timeout?)` | Flush pending events (use before process exit) |
| `close(timeout?)` | Flush and disable the SDK |

### OverseerConfig (shared config for all frameworks)

```typescript
{
  dsn?: string;                        // Your project's Data Source Name
  environment?: string;                // 'production' | 'staging' | 'development'
  release?: string;                    // Your app's version/release identifier
  enabled?: boolean;                   // Enable/disable the SDK (default: true)
  debug?: boolean;                     // Enable debug logging (default: false)
  sampleRate?: number;                 // Error sample rate 0-1 (default: 1.0)
  tracesSampleRate?: number;           // Performance trace sample rate 0-1
  replaysSessionSampleRate?: number;   // Session replay sample rate 0-1
  replaysOnErrorSampleRate?: number;   // Replay-on-error sample rate 0-1
  beforeSend?: (event) => event|null;  // Hook to modify/filter events
  initialUser?: UserContext;           // Pre-set user context
  initialTags?: Record<string, string>;// Pre-set tags
}
```

---

## Verification

After completing the setup for your framework, verify the integration is working:

### 1. Check the Dashboard

Navigate to your project in the Codmir dashboard. You should see:
- **"Connected"** status in **Project Settings > SDK Status**
- A test event if you sent one

### 2. Send a Test Event

```typescript
import * as Codmir from '@codmir/sdk/nextjs'; // or your platform-specific import

Codmir.init({ dsn: 'YOUR_DSN' });

// Send a test message
Codmir.captureMessage('SDK setup complete', 'info');

// Test error capture
try {
  throw new Error('Test error from Codmir SDK');
} catch (error) {
  Codmir.captureException(error);
}

// Flush to ensure events are sent before the process exits
await Codmir.flush(5000);
```

### 3. Verify in Production

- Deploy your application with the SDK configured
- Trigger a test error (e.g., visit a route that throws)
- Check the Codmir dashboard for the captured event within 30 seconds

---

## Test Connection Snippets

### Next.js

```typescript
// instrumentation.ts
import * as Codmir from '@codmir/sdk/nextjs';

export function register() {
  Codmir.init({ dsn: process.env.NEXT_PUBLIC_CODMIR_DSN });
  Codmir.captureMessage('SDK setup complete', 'info');
}
```

### Express.js

```typescript
import * as Codmir from '@codmir/sdk/express';
Codmir.init({ dsn: process.env.CODMIR_DSN });
Codmir.captureMessage('Express SDK setup complete', 'info');
```

### React Native

```typescript
import * as Codmir from '@codmir/sdk/react-native';
Codmir.init({ dsn: 'https://your-project.codmir.com/api/overseer' });
Codmir.captureMessage('React Native SDK setup complete', 'info');
```

### Browser

```typescript
import * as Codmir from '@codmir/sdk/browser';
Codmir.init({ dsn: 'https://your-project.codmir.com/api/overseer' });
Codmir.captureMessage('Browser SDK setup complete', 'info');
```

---

## Common Issues

| Problem | Cause | Solution |
|---|---|---|
| "DSN not found" or undefined DSN | Environment variable not set or wrong name | Check `.env.local` has `NEXT_PUBLIC_CODMIR_DSN` (Next.js) or `CODMIR_DSN` (server-side). Restart the dev server after adding env vars. |
| "Unauthorized" error | Invalid or expired project DSN | Go to **Project Settings > SDK Setup** in the Codmir dashboard and copy the current DSN. |
| No events appearing in dashboard | Events not flushed before process exits | Call `await Codmir.flush(5000)` before the process exits, especially in serverless/CLI contexts. |
| Events appearing in wrong project | Wrong DSN configured | Verify the DSN matches the project you are viewing in the dashboard. |
| Next.js server errors not captured | Missing `instrumentation.ts` | Create `instrumentation.ts` in the project root and add `instrumentationHook: true` to `next.config.js`. |
| Next.js client errors not captured | Missing error boundary | Add `app/global-error.tsx` and `app/error.tsx` with `Codmir.captureException(error)`. |
| Express errors not captured | `errorHandler()` placed before routes | Move `app.use(Codmir.errorHandler())` to AFTER all route definitions. |
| React Native crashes not reported | Missing `captureNativeCrashes: true` | Add `captureNativeCrashes: true` to the init config. |
| Duplicate events | SDK initialized multiple times | Guard with `Codmir.isOverseerInitialized()` or ensure `init()` is called once. |
| High event volume / costs | Sample rate too high in production | Set `sampleRate: 0.1` and `tracesSampleRate: 0.1` for production. |

---

## Environment Variables

```env
# Required -- your project's Data Source Name
CODMIR_DSN=https://your-project.codmir.com/api/overseer

# Next.js (must use NEXT_PUBLIC_ prefix for client-side access)
NEXT_PUBLIC_CODMIR_DSN=https://your-project.codmir.com/api/overseer

# Vite
VITE_CODMIR_DSN=https://your-project.codmir.com/api/overseer

# Create React App
REACT_APP_CODMIR_DSN=https://your-project.codmir.com/api/overseer

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
| Core (direct overseer access) | `@codmir/sdk/overseer` |
| API Client (project management) | `@codmir/sdk` |

---

## Version Compatibility

| SDK Version | Node.js | Next.js | React | React Native |
|---|---|---|---|---|
| 1.x | >= 18 | >= 14 | >= 18 | >= 0.72 |
