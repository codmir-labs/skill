/**
 * @codmir/skill/instructions
 *
 * Framework-specific installation instructions for the Codmir SDK.
 * Each constant contains step-by-step setup instructions with full
 * code examples, file paths, environment variables, and verification steps.
 *
 * Designed to be consumed by AI assistants to generate accurate setup code.
 */

// =============================================================================
// Next.js (App Router + Pages Router)
// =============================================================================

export const NEXTJS_APP_ROUTER_INSTRUCTIONS = `
## Next.js App Router Setup

### Step 1: Install the SDK

\`\`\`bash
npm install @codmir/sdk
\`\`\`

### Step 2: Create \`instrumentation.ts\` in your project root

File: \`instrumentation.ts\` (next to \`next.config.js\`)

\`\`\`typescript
import * as Codmir from '@codmir/sdk/nextjs';

export function register() {
  Codmir.init({
    dsn: process.env.NEXT_PUBLIC_CODMIR_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export const onRequestError = Codmir.captureRouterError;
\`\`\`

### Step 3: Create \`app/global-error.tsx\`

\`\`\`tsx
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
\`\`\`

### Step 4: Create \`app/error.tsx\`

\`\`\`tsx
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
\`\`\`

### Step 5: Update \`next.config.js\`

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
\`\`\`

### Step 6: Add environment variables to \`.env.local\`

\`\`\`env
NEXT_PUBLIC_CODMIR_DSN=https://your-project.codmir.com/api/overseer
\`\`\`

### Verification

\`\`\`typescript
// instrumentation.ts - add this temporarily to verify
import * as Codmir from '@codmir/sdk/nextjs';

export function register() {
  Codmir.init({ dsn: process.env.NEXT_PUBLIC_CODMIR_DSN });
  Codmir.captureMessage('Next.js App Router SDK setup complete', 'info');
}
\`\`\`

Check the Codmir dashboard for the test event.
`.trim();

export const NEXTJS_PAGES_ROUTER_INSTRUCTIONS = `
## Next.js Pages Router Setup

### Step 1: Install the SDK

\`\`\`bash
npm install @codmir/sdk
\`\`\`

### Step 2: Initialize in \`pages/_app.tsx\`

\`\`\`tsx
import type { AppProps } from 'next/app';
import * as Codmir from '@codmir/sdk/nextjs';

Codmir.init({
  dsn: process.env.NEXT_PUBLIC_CODMIR_DSN,
  environment: process.env.NODE_ENV,
});

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
\`\`\`

### Step 3: Add error reporting in \`pages/_error.tsx\`

\`\`\`tsx
import * as Codmir from '@codmir/sdk/nextjs';
import type { NextPageContext } from 'next';

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <p>
      {statusCode
        ? \`A \${statusCode} error occurred on the server\`
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
\`\`\`

### Step 4: Add environment variables to \`.env.local\`

\`\`\`env
NEXT_PUBLIC_CODMIR_DSN=https://your-project.codmir.com/api/overseer
\`\`\`

### Verification

\`\`\`typescript
import * as Codmir from '@codmir/sdk/nextjs';
Codmir.init({ dsn: process.env.NEXT_PUBLIC_CODMIR_DSN });
Codmir.captureMessage('Next.js Pages Router SDK setup complete', 'info');
\`\`\`
`.trim();

/** Combined Next.js instructions covering both App Router and Pages Router */
export const NEXTJS_INSTRUCTIONS = `
# Codmir SDK -- Next.js Integration

Import: \`@codmir/sdk/nextjs\`

The Next.js integration supports both App Router and Pages Router.
Determine which router your project uses:
- If you have an \`app/\` directory: use **App Router** instructions
- If you have a \`pages/\` directory: use **Pages Router** instructions
- If you have both: use **App Router** instructions (it covers both)

---

${NEXTJS_APP_ROUTER_INSTRUCTIONS}

---

${NEXTJS_PAGES_ROUTER_INSTRUCTIONS}
`.trim();

// =============================================================================
// Express.js
// =============================================================================

export const EXPRESS_INSTRUCTIONS = `
# Codmir SDK -- Express.js Integration

Import: \`@codmir/sdk/express\`

### Step 1: Install the SDK

\`\`\`bash
npm install @codmir/sdk
\`\`\`

### Step 2: Add Codmir middleware to your Express app

IMPORTANT: Middleware order matters.
- \`requestHandler()\` MUST be the FIRST middleware
- \`errorHandler()\` MUST be the LAST middleware (after all routes)

File: \`src/app.ts\` (or your main Express file)

\`\`\`typescript
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

// 5. Codmir error handler -- MUST be after all routes
app.use(Codmir.errorHandler());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

### Step 3: Add environment variables

\`\`\`env
CODMIR_DSN=https://your-project.codmir.com/api/overseer
\`\`\`

### Verification

\`\`\`typescript
import * as Codmir from '@codmir/sdk/express';
Codmir.init({ dsn: process.env.CODMIR_DSN });
Codmir.captureMessage('Express SDK setup complete', 'info');
\`\`\`

### Common mistakes
- Placing \`errorHandler()\` before routes: errors will NOT be captured
- Forgetting \`requestHandler()\` as first middleware: request context will be missing
- Not calling \`flush()\` before graceful shutdown: pending events may be lost
`.trim();

// =============================================================================
// Remix
// =============================================================================

export const REMIX_INSTRUCTIONS = `
# Codmir SDK -- Remix Integration

Import: \`@codmir/sdk/remix\`

### Step 1: Install the SDK

\`\`\`bash
npm install @codmir/sdk
\`\`\`

### Step 2: Initialize in \`app/entry.server.tsx\`

\`\`\`typescript
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
\`\`\`

### Step 3: Wrap loaders and actions in route files

\`\`\`typescript
// app/routes/dashboard.tsx
import { json } from '@remix-run/node';
import { wrapLoader, wrapAction } from '@codmir/sdk/remix';

export const loader = wrapLoader(async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
});

export const action = wrapAction(async ({ request }) => {
  const formData = await request.formData();
  return json({ success: true });
});
\`\`\`

### Step 4: Add error boundary in \`app/root.tsx\`

\`\`\`tsx
import * as Codmir from '@codmir/sdk/remix';
import { useRouteError } from '@remix-run/react';

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
\`\`\`

### Step 5: Add environment variables

\`\`\`env
CODMIR_DSN=https://your-project.codmir.com/api/overseer
\`\`\`

### Verification

\`\`\`typescript
import * as Codmir from '@codmir/sdk/remix';
Codmir.init({ dsn: process.env.CODMIR_DSN });
Codmir.captureMessage('Remix SDK setup complete', 'info');
\`\`\`
`.trim();

// =============================================================================
// React Native
// =============================================================================

export const REACT_NATIVE_INSTRUCTIONS = `
# Codmir SDK -- React Native Integration

Import: \`@codmir/sdk/react-native\`

### Step 1: Install the SDK

\`\`\`bash
npm install @codmir/sdk
\`\`\`

### Step 2: Initialize in \`App.tsx\`

\`\`\`tsx
import * as Codmir from '@codmir/sdk/react-native';
import { View, Text } from 'react-native';

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
\`\`\`

### Step 3: Track navigation (React Navigation)

\`\`\`tsx
import * as Codmir from '@codmir/sdk/react-native';

<NavigationContainer
  onStateChange={(state) => {
    const currentRoute = state?.routes[state.index];
    if (currentRoute) {
      Codmir.addBreadcrumb({
        category: 'navigation',
        message: \`Navigated to \${currentRoute.name}\`,
        data: { route: currentRoute.name, params: currentRoute.params },
      });
    }
  }}
>
  {/* Your screens */}
</NavigationContainer>
\`\`\`

### Step 4: Capture errors in async operations

\`\`\`typescript
try {
  const data = await fetchUserProfile();
} catch (error) {
  Codmir.captureException(error, { context: 'fetchUserProfile' });
}
\`\`\`

### Environment variables

React Native does not support \`.env\` files natively. Use \`react-native-config\`
or hardcode the DSN. The DSN is not a secret -- it identifies your project.

### Verification

\`\`\`typescript
import * as Codmir from '@codmir/sdk/react-native';
Codmir.init({ dsn: 'https://your-project.codmir.com/api/overseer' });
Codmir.captureMessage('React Native SDK setup complete', 'info');
\`\`\`
`.trim();

// =============================================================================
// Browser (Vanilla JS)
// =============================================================================

export const BROWSER_INSTRUCTIONS = `
# Codmir SDK -- Browser Integration

Import: \`@codmir/sdk/browser\`

### Step 1: Install the SDK

\`\`\`bash
npm install @codmir/sdk
\`\`\`

### Step 2: Initialize in your entry file

**Option A: ES Module (bundled app -- Vite, Webpack, etc.)**

File: \`src/main.ts\`

\`\`\`typescript
import * as Codmir from '@codmir/sdk/browser';

Codmir.init({
  dsn: import.meta.env.VITE_CODMIR_DSN,  // Vite
  // dsn: process.env.REACT_APP_CODMIR_DSN, // Create React App
  environment: import.meta.env.MODE,
  captureGlobalErrors: true,
  captureUnhandledRejections: true,
  captureConsoleErrors: true,
  trackClicks: true,
});
\`\`\`

**Option B: Inline script tag**

\`\`\`html
<script type="module">
  import { init, captureException, captureMessage } from '@codmir/sdk/browser';

  init({
    dsn: 'https://your-project.codmir.com/api/overseer',
    captureGlobalErrors: true,
    captureUnhandledRejections: true,
  });

  captureMessage('Browser SDK initialized', 'info');
</script>
\`\`\`

### Environment variables

\`\`\`env
# Vite
VITE_CODMIR_DSN=https://your-project.codmir.com/api/overseer

# Create React App
REACT_APP_CODMIR_DSN=https://your-project.codmir.com/api/overseer

# Webpack (via DefinePlugin)
CODMIR_DSN=https://your-project.codmir.com/api/overseer
\`\`\`

### Verification

\`\`\`typescript
import * as Codmir from '@codmir/sdk/browser';
Codmir.init({ dsn: 'https://your-project.codmir.com/api/overseer' });
Codmir.captureMessage('Browser SDK setup complete', 'info');
\`\`\`
`.trim();

// =============================================================================
// Framework registry
// =============================================================================

/** All supported frameworks and their instruction content */
export const FRAMEWORK_INSTRUCTIONS: Record<string, string> = {
  nextjs: NEXTJS_INSTRUCTIONS,
  "nextjs-app-router": NEXTJS_APP_ROUTER_INSTRUCTIONS,
  "nextjs-pages-router": NEXTJS_PAGES_ROUTER_INSTRUCTIONS,
  express: EXPRESS_INSTRUCTIONS,
  remix: REMIX_INSTRUCTIONS,
  "react-native": REACT_NATIVE_INSTRUCTIONS,
  browser: BROWSER_INSTRUCTIONS,
};

/** Human-readable framework names */
export const FRAMEWORK_NAMES: Record<string, string> = {
  nextjs: "Next.js",
  "nextjs-app-router": "Next.js (App Router)",
  "nextjs-pages-router": "Next.js (Pages Router)",
  express: "Express.js",
  remix: "Remix",
  "react-native": "React Native",
  browser: "Browser (Vanilla JS)",
};

/** SDK import paths per framework */
export const FRAMEWORK_IMPORTS: Record<string, string> = {
  nextjs: "@codmir/sdk/nextjs",
  "nextjs-app-router": "@codmir/sdk/nextjs",
  "nextjs-pages-router": "@codmir/sdk/nextjs",
  express: "@codmir/sdk/express",
  remix: "@codmir/sdk/remix",
  "react-native": "@codmir/sdk/react-native",
  browser: "@codmir/sdk/browser",
};

/** Verification code snippets per framework */
export const FRAMEWORK_VERIFICATION: Record<string, string> = {
  nextjs: `import * as Codmir from '@codmir/sdk/nextjs';
Codmir.init({ dsn: process.env.NEXT_PUBLIC_CODMIR_DSN });
Codmir.captureMessage('SDK setup complete', 'info');`,

  "nextjs-app-router": `import * as Codmir from '@codmir/sdk/nextjs';

export function register() {
  Codmir.init({ dsn: process.env.NEXT_PUBLIC_CODMIR_DSN });
  Codmir.captureMessage('SDK setup complete', 'info');
}`,

  "nextjs-pages-router": `import * as Codmir from '@codmir/sdk/nextjs';
Codmir.init({ dsn: process.env.NEXT_PUBLIC_CODMIR_DSN });
Codmir.captureMessage('SDK setup complete', 'info');`,

  express: `import * as Codmir from '@codmir/sdk/express';
Codmir.init({ dsn: process.env.CODMIR_DSN });
Codmir.captureMessage('Express SDK setup complete', 'info');`,

  remix: `import * as Codmir from '@codmir/sdk/remix';
Codmir.init({ dsn: process.env.CODMIR_DSN });
Codmir.captureMessage('Remix SDK setup complete', 'info');`,

  "react-native": `import * as Codmir from '@codmir/sdk/react-native';
Codmir.init({ dsn: 'https://your-project.codmir.com/api/overseer' });
Codmir.captureMessage('React Native SDK setup complete', 'info');`,

  browser: `import * as Codmir from '@codmir/sdk/browser';
Codmir.init({ dsn: 'https://your-project.codmir.com/api/overseer' });
Codmir.captureMessage('Browser SDK setup complete', 'info');`,
};
