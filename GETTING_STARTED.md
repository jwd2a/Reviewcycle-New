# Getting Started with ReviewCycle

Congratulations! Phase 1 of ReviewCycle is complete. Here's how to use it:

## What's Working Now (Phase 1)

✅ **Lightweight npm package** - Only 17.79 KB gzipped!
✅ **Click-to-comment** - Select any element on your prototype to leave a comment
✅ **Comment markers** - See all comments overlaid directly on the prototype
✅ **Comment threads** - Reply to comments and view conversations
✅ **Local persistence** - Comments stored in browser localStorage
✅ **Shadow DOM isolation** - No CSS conflicts with your host application
✅ **Beautiful UI** - Polished Preact-based interface

## Try It Out

The demo app is running at **http://localhost:5173/**

### How to Use:

1. **Open the demo**: Visit http://localhost:5173/ in your browser

2. **Add a comment**:
   - Click the blue floating button in the bottom-right
   - Your cursor will change to a crosshair
   - Click any element on the page (button, heading, form field, etc.)
   - Enter your comment in the dialog
   - Optionally add your name
   - Click "Add Comment"

3. **View comments**:
   - Blue circular markers appear on elements with comments
   - Click a marker to view the thread
   - Add replies to continue the conversation

4. **Persistence**:
   - Refresh the page - your comments are still there!
   - Comments are stored in browser localStorage
   - Each URL has its own set of comments

## Development Commands

```bash
# Run demo app
pnpm demo

# Build client package
pnpm build

# Build specific package
pnpm --filter @reviewcycle/client build
pnpm --filter @reviewcycle/shared build
```

## Project Structure

```
reviewcycle/
├── packages/
│   ├── client/          # @reviewcycle/client npm package
│   │   ├── src/
│   │   │   ├── ReviewCycle.ts      # Core class
│   │   │   ├── components/         # Preact UI
│   │   │   ├── services/           # StateManager, ElementSelector
│   │   │   └── utils/              # DOM helpers, styles
│   │   └── dist/                   # Built output
│   │
│   └── shared/          # @reviewcycle/shared types
│       └── src/types/   # TypeScript interfaces
│
└── apps/
    └── demo/            # Demo application
        ├── index.html
        └── src/main.ts  # ReviewCycle initialization
```

## Using in Your Own Projects

To add ReviewCycle to any web project:

```html
<script type="module">
  import ReviewCycle from '@reviewcycle/client';

  const rc = new ReviewCycle({
    apiKey: 'rc_proj_your_key_here',
    mode: 'development'
  });

  rc.init();
</script>
```

Currently works in `development` mode (local storage only). The `apiKey` is validated in format but not yet connected to a backend.

## What's Next

### Phase 2: Backend & Multi-User Sync
- [ ] Backend API (Fastify + PostgreSQL)
- [ ] Real API key validation
- [ ] Multi-user real-time sync
- [ ] Comments visible across sessions and users
- [ ] Deploy to hosting platform

### Phase 3: AI Prompt Generation
- [ ] Claude API integration
- [ ] Capture enhanced context (deeper DOM tree, screenshots)
- [ ] Generate detailed prompts optimized for Claude Code
- [ ] Copy-to-clipboard for easy sharing
- [ ] Token usage tracking

## Bundle Size Achievement 🎉

Target: < 50KB gzipped
**Actual: 17.79 KB gzipped** (64% under target!)

Breakdown:
- Preact core: ~3KB
- Application code: ~10KB
- Utilities: ~5KB

## Known Limitations (Phase 1)

- Comments only stored locally (no backend yet)
- Single user per browser (no sync between devices)
- No AI prompt generation (Phase 3 feature)
- Basic comment resolution workflow

## Testing Checklist

Try these scenarios in the demo:

- [ ] Click button in hero section, add comment
- [ ] Click form input, add comment
- [ ] Click feature card, add comment
- [ ] View comment thread and add replies
- [ ] Refresh page - comments persist
- [ ] Open different URL - comments are URL-specific
- [ ] Hover over elements - see selection outline
- [ ] ESC or click overlay to cancel selection
- [ ] Comment markers follow elements on scroll

## Troubleshooting

**Markers not appearing?**
- Check browser console for errors
- Verify elements have valid CSS selectors or IDs

**Comments not persisting?**
- Check localStorage isn't disabled
- Clear localStorage: `localStorage.clear()`

**Styling conflicts?**
- Shadow DOM should prevent this
- All ReviewCycle styles are scoped

## Feedback & Issues

Open issues or questions:
- Use GitHub Issues (once repository is published)
- Check the plan file at .claude/plans/ for implementation details

---

**Built with**:
- Preact (3KB UI library)
- TypeScript (type safety)
- Vite (fast builds)
- Shadow DOM (style isolation)
- localStorage (persistence)
