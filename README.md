# ReviewCycle

Real-time collaborative commenting and review tool for web prototypes and applications. Add visual feedback capabilities to any website with just a few lines of code.

## Features

- 🎯 **Click-to-comment** on any element
- 🔄 **Real-time synchronization** across multiple users via WebSocket
- 💬 **Threaded conversations** with nested replies
- 📍 **Visual indicators** showing comment locations
- 🔐 **API key authentication** for project isolation
- 🎨 **Lightweight & framework-agnostic**
- 🌐 **Two modes**: localStorage for local development, backend API for production

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Backend Deployment](#backend-deployment)
- [Creating API Keys](#creating-api-keys)
- [Usage](#usage)
- [Publishing to npm](#publishing-to-npm)
- [Development Setup](#development-setup)
- [Architecture](#architecture)

## Quick Start

### For End Users

1. **Install the client:**
   ```bash
   npm install reviewcycle-client
   ```

2. **Initialize in your app:**
   ```typescript
   import ReviewCycle from 'reviewcycle-client';

   const rc = new ReviewCycle({
     apiKey: 'rc_proj_your_key_here',
     mode: 'production',
     baseUrl: 'https://your-api.onrender.com',
   });

   rc.init();
   ```

3. **Start commenting!** Click the floating button to add comments to any element on your page.

## Installation

### Development Mode (No Backend Required)

Perfect for prototyping - comments are stored in localStorage:

```typescript
import ReviewCycle from 'reviewcycle-client';

const rc = new ReviewCycle({
  apiKey: 'local',
  mode: 'development',
});

rc.init();
```

### Production Mode (With Backend)

For real-time collaboration across multiple users:

```typescript
import ReviewCycle from 'reviewcycle-client';

const rc = new ReviewCycle({
  apiKey: 'rc_proj_your_key_here',
  mode: 'production',
  baseUrl: 'https://reviewcycle-api.onrender.com',
  authorName: 'Your Name',      // Optional
  authorEmail: 'you@email.com', // Optional
});

rc.init();
```

## Backend Deployment

### Prerequisites

- GitHub account
- Render account (free tier works)
- Node.js 20+

### Deploy to Render

1. **Push your code to GitHub**

2. **Connect to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configuration:**
   The `render.yaml` file automatically sets up:
   - PostgreSQL database (free tier, 1GB)
   - Web service (Starter tier, $7/month)
   - Auto-migrations on startup
   - Environment variables

4. **Get your Admin API Key:**
   - Go to your service in Render dashboard
   - Click "Environment" tab
   - Find and copy the `ADMIN_API_KEY` value

### Manual Deployment Configuration

If you need to deploy manually or modify the configuration:

**Environment Variables:**
```bash
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
DATABASE_URL=<your-postgres-connection-string>
ALLOWED_ORIGINS=*
API_KEY_PREFIX=rc_proj_
ADMIN_API_KEY=<secure-random-string>
```

**Build Command:**
```bash
corepack enable && \
corepack prepare pnpm@latest --activate && \
pnpm install && \
pnpm --filter reviewcycle-shared build && \
pnpm --filter @reviewcycle/server build
```

**Start Command:**
```bash
cd packages/server && node dist/index.js
```

## Creating API Keys

### Using the Admin API

Create project-specific API keys for comment isolation:

```bash
curl -X POST https://your-api.onrender.com/api/admin/projects \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Website Project"}'
```

**Response:**
```json
{
  "apiKey": "rc_proj_abc123xyz",
  "projectId": "rc_proj_abc123xyz",
  "name": "My Website Project",
  "createdAt": "2025-12-17T14:07:08.147Z"
}
```

### List All Projects

```bash
curl https://your-api.onrender.com/api/admin/projects \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

### Delete a Project

```bash
curl -X DELETE https://your-api.onrender.com/api/admin/projects/rc_proj_abc123xyz \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

**Note:** Deleting a project cascades to delete all associated comments.

## Usage

### Basic Usage

```typescript
import ReviewCycle from 'reviewcycle-client';

const rc = new ReviewCycle({
  apiKey: 'rc_proj_demo123',
  mode: 'production',
  baseUrl: 'https://reviewcycle-api.onrender.com',
});

// Initialize and activate commenting
rc.init();

// Later, clean up
rc.destroy();
```

### Configuration Options

```typescript
interface ReviewCycleConfig {
  apiKey: string;                      // Your project API key (required)
  mode?: 'development' | 'production'; // Default: 'development'
  baseUrl?: string;                    // API URL (required for production)
  authorName?: string;                 // Default commenter name
  authorEmail?: string;                // Default commenter email
}
```

### Real-Time Collaboration

Open your application in multiple browser windows or share the URL with teammates. Comments sync instantly across all connected clients via WebSocket.

## Publishing to npm

### Prerequisites

- npm account with 2FA enabled
- Access to publish public packages

### Steps

1. **Login to npm:**
   ```bash
   npm login
   ```

2. **Publish shared types package:**
   ```bash
   cd packages/shared
   npm publish --access public
   ```

3. **Publish client package:**
   ```bash
   cd packages/client
   npm publish --access public
   ```

### Updating Versions

1. **Update version in package.json:**
   ```bash
   cd packages/client
   npm version patch  # or minor, or major
   ```

2. **Publish:**
   ```bash
   npm publish --access public
   ```

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jwd2a/Reviewcycle-New.git
   cd Reviewcycle-New
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build packages:**
   ```bash
   # Build shared types
   pnpm --filter reviewcycle-shared build

   # Build client
   pnpm --filter reviewcycle-client build

   # Build server
   pnpm --filter @reviewcycle/server build
   ```

4. **Run the demo:**
   ```bash
   cd apps/demo
   pnpm dev
   ```

### Running the Backend Locally

1. **Set up environment variables:**
   Create `packages/server/.env`:
   ```bash
   NODE_ENV=development
   PORT=3000
   HOST=0.0.0.0
   DATABASE_URL=postgresql://user:password@localhost:5432/reviewcycle
   ALLOWED_ORIGINS=*
   API_KEY_PREFIX=rc_proj_
   ADMIN_API_KEY=local_admin_key_123
   ```

2. **Start PostgreSQL:**
   ```bash
   # Using Docker
   docker run -d \
     -p 5432:5432 \
     -e POSTGRES_USER=user \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=reviewcycle \
     postgres:16
   ```

3. **Run the server:**
   ```bash
   cd packages/server
   pnpm dev
   ```

   The server will automatically run migrations on startup.

### Project Structure

```
reviewcycle/
├── apps/
│   └── demo/              # Demo application
├── packages/
│   ├── client/            # ReviewCycle client library
│   ├── server/            # Backend API server
│   └── shared/            # Shared TypeScript types
├── render.yaml            # Render deployment config
└── pnpm-workspace.yaml    # Workspace configuration
```

## Architecture

### Client Architecture

- **ReviewCycle.ts**: Main entry point and initialization
- **StateManager.ts**: State management and sync coordination
- **ApiClient.ts**: REST API communication
- **WebSocketManager.ts**: Real-time WebSocket connection
- **Components/**: Preact UI components (markers, dialogs, threads)

### Server Architecture

- **Fastify**: HTTP server framework
- **PostgreSQL**: Relational database with JSONB support
- **WebSocket**: Real-time bidirectional communication
- **Room-based broadcasting**: Project-scoped event isolation

### Database Schema

**Projects Table:**
- `id` (TEXT, PRIMARY KEY): API key (e.g., `rc_proj_abc123`)
- `name` (TEXT): Project name
- `metadata` (JSONB): Additional project data
- Timestamps: `created_at`, `updated_at`

**Comments Table:**
- `id` (TEXT, PRIMARY KEY): Comment ID
- `project_id` (TEXT, FOREIGN KEY): References projects(id)
- `text` (TEXT): Comment content
- `url` (TEXT): Page URL where comment was created
- `thread_id` (TEXT): Thread identifier for grouping
- `parent_id` (TEXT, FOREIGN KEY): Parent comment for replies
- Element context: `element_selector`, `element_xpath`, `element_text`
- Visual data: `bounding_rect`, `dom_context`, `computed_styles`
- Author info: `author_name`, `author_email`
- `resolved` (BOOLEAN): Resolution status
- Timestamps: `created_at`, `updated_at`

### API Endpoints

**Public:**
- `GET /health` - Health check

**Authenticated (requires API key):**
- `GET /api/projects/:projectId/comments` - List comments
- `POST /api/projects/:projectId/comments` - Create comment
- `GET /api/projects/:projectId/comments/:id` - Get comment
- `PATCH /api/projects/:projectId/comments/:id` - Update comment
- `DELETE /api/projects/:projectId/comments/:id` - Delete comment (cascades to replies)
- `GET /api/projects/:projectId/threads/:threadId` - Get thread

**Admin (requires admin API key):**
- `POST /api/admin/projects` - Create project and generate API key
- `GET /api/admin/projects` - List all projects
- `DELETE /api/admin/projects/:id` - Delete project

**WebSocket:**
- `/ws` - WebSocket connection for real-time updates

### WebSocket Events

**Client → Server:**
- `auth`: Authenticate with API key

**Server → Client:**
- `auth_success`: Authentication successful
- `auth_error`: Authentication failed
- `comment.created`: New comment created
- `comment.updated`: Comment updated
- `comment.deleted`: Comment(s) deleted
- `error`: Error occurred

## Cost Breakdown

**Render Hosting:**
- PostgreSQL (free tier): $0/month (1GB, 90-day data retention)
- Web Service (starter tier): $7/month
- **Total: $7/month**

**npm Publishing:**
- Public packages: Free

## Security Considerations

1. **API Keys**: Each project gets a unique API key for comment isolation
2. **Admin API Key**: Keep your admin API key secure - it can create/delete projects
3. **CORS**: Configure `ALLOWED_ORIGINS` in production to restrict access
4. **2FA**: Enable 2FA on your npm account for package publishing
5. **Environment Variables**: Never commit sensitive keys to git

## Troubleshooting

### Build Errors

**Error:** `Cannot find module 'reviewcycle-shared'`
- **Solution:** Make sure you've published `reviewcycle-shared` to npm first

**Error:** `ENOENT: no such file or directory, open 'schema.sql'`
- **Solution:** SQL schema is now embedded in migrations.ts

### Deployment Issues

**Error:** `ADMIN_API_KEY environment variable is required`
- **Solution:** Make sure Render has generated the ADMIN_API_KEY (check Environment tab)

**Error:** Database connection failed
- **Solution:** Verify DATABASE_URL is set correctly in Render environment variables

### Runtime Issues

**Comments not syncing:**
- Check that WebSocket connection is established (look for "WebSocket authenticated" in browser console)
- Verify baseUrl is correct and accessible
- Check that all clients are using the same API key

**403 Unauthorized:**
- Verify your API key is correct and starts with `rc_proj_`
- For admin endpoints, use your ADMIN_API_KEY

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

- **Issues**: https://github.com/jwd2a/Reviewcycle-New/issues
- **Documentation**: This README

---

Built with ❤️ by Madera Labs
