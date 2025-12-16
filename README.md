# ReviewCycle

Lightweight prototype review and commenting system - as easy as Figma comments, optimized for AI-assisted development workflows.

## Features

- Click any element on your prototype to leave a comment
- Comments overlaid directly on the prototype (no separate dashboard)
- AI-powered prompt generation for Claude Code workflows
- Lightweight npm package (<50KB gzipped)
- Works with any web application or prototype

## Quick Start

```bash
npm install @reviewcycle/client
```

```javascript
import ReviewCycle from '@reviewcycle/client';

const rc = new ReviewCycle({
  apiKey: 'rc_proj_xxxxxxxxxxxxx',
  mode: 'development'
});

rc.init();
```

## Project Structure

This is a monorepo containing:

- `packages/client` - npm package for adding commenting to prototypes
- `packages/server` - Backend API service (Phase 2)
- `packages/shared` - Shared TypeScript types
- `apps/demo` - Demo application for testing

## Development

```bash
# Install dependencies
pnpm install

# Run demo app
pnpm demo

# Build client package
pnpm build
```

## License

MIT
