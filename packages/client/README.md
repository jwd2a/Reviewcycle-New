# ReviewCycle Client

Lightweight commenting and review tool for prototypes and web applications. Add real-time collaborative commenting to any website with just a few lines of code.

## Features

- 🎯 **Click-to-comment** on any element
- 🔄 **Real-time sync** across multiple users via WebSocket
- 💬 **Threaded conversations** with replies
- 📍 **Visual indicators** showing comment locations
- 🔐 **API key authentication** for project isolation
- 🎨 **Lightweight** - minimal dependencies, no framework required

## Installation

```bash
npm install reviewcycle-client
```

## Quick Start

```typescript
import ReviewCycle from 'reviewcycle-client';

const rc = new ReviewCycle({
  apiKey: 'your_api_key',
  mode: 'production',
  baseUrl: 'https://your-api.onrender.com',
});

rc.init();
```

## Configuration

```typescript
interface ReviewCycleConfig {
  apiKey: string;                    // Your project API key
  mode?: 'development' | 'production'; // Default: 'development'
  baseUrl?: string;                   // API base URL (required for production)
  authorName?: string;                // Default commenter name
  authorEmail?: string;               // Default commenter email
}
```

### Development Mode

In development mode, comments are stored in `localStorage` - perfect for prototyping without a backend:

```typescript
const rc = new ReviewCycle({
  apiKey: 'local',
  mode: 'development',
});
```

### Production Mode

In production mode, comments are synced to your backend and shared in real-time:

```typescript
const rc = new ReviewCycle({
  apiKey: 'rc_proj_your_key',
  mode: 'production',
  baseUrl: 'https://reviewcycle-api.onrender.com',
});
```

## API

### `init()`
Initialize ReviewCycle and activate commenting mode.

### `destroy()`
Clean up and remove all event listeners and UI elements.

## Backend Setup

ReviewCycle requires a backend API for production use. See the [ReviewCycle Server](https://github.com/your-org/reviewcycle) for deployment instructions.

## License

MIT
