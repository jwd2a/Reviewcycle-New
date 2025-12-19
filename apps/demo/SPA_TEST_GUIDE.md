# SPA Marker Tracking Test Guide

## How to Test the SPA Fix

This demo now includes an SPA navigation test that simulates real-world React/Vue/Angular behavior where:
- The URL doesn't change
- The DOM is completely re-rendered
- Elements are added and removed from the page

### Testing Steps

1. **Start the backend server** (if not already running):
   ```bash
   # From repo root
   cd packages/server
   pnpm dev
   ```

2. **Start the demo app**:
   ```bash
   # From repo root
   cd apps/demo
   pnpm dev
   ```

3. **Open the demo** at http://localhost:5173

### Test Scenario 1: Markers Disappear When Elements Are Removed

1. Click on **View 1** (Dashboard)
2. Add a comment to one of the stat cards (e.g., "Active Users" or "Revenue")
3. Notice the marker appears on the element
4. Switch to **View 2** (Settings) or **View 3** (Team)
5. ✅ **EXPECTED**: The marker should **disappear** because the element is no longer in the DOM

### Test Scenario 2: Markers Reappear When Elements Return

1. Add a comment to an element in View 1
2. Switch to View 2 (marker disappears)
3. Switch back to View 1
4. ✅ **EXPECTED**: The marker should **reappear** in the correct position on the element

### Test Scenario 3: Browser Navigation (Back/Forward)

1. Add comments to elements in View 1
2. Switch to View 2, then View 3
3. Use browser's **back button** to go back to View 2, then View 1
4. ✅ **EXPECTED**: Markers should appear/disappear correctly as you navigate

### Test Scenario 4: Multiple Markers Across Views

1. Add a comment in View 1 (Dashboard card)
2. Switch to View 2 and add a comment (Settings item)
3. Switch to View 3 and add a comment (Team member)
4. Navigate between views
5. ✅ **EXPECTED**: Only markers for visible elements should appear

## What the Fix Does

The new `useElementTracking` hook automatically:

- **Watches DOM mutations** with MutationObserver
- **Tracks element visibility** with IntersectionObserver
- **Intercepts SPA navigation** (history.pushState, popstate, hashchange)
- **Validates periodically** (every 2 seconds) to catch edge cases
- **Hides markers** when target elements are not found or not visible

## How It Works Technically

When you switch views:
1. The old view's DOM is removed (`container.innerHTML = ''`)
2. `history.pushState()` is called (triggers marker update)
3. New view is rendered with new elements
4. MutationObserver detects DOM changes
5. Markers automatically update positions or hide if elements are gone
6. When you return to a view, markers reappear on their target elements

## Before vs After

**BEFORE (broken):**
- Markers stayed at fixed viewport coordinates
- Markers pointed to empty space when elements were removed
- No response to DOM changes

**AFTER (fixed):**
- Markers automatically track element positions
- Markers disappear when elements are removed
- Markers reappear when elements return
- Zero configuration required
