import ReviewCycle from 'reviewcycle-client';

// Initialize ReviewCycle in production mode with local backend
const rc = new ReviewCycle({
  apiKey: 'rc_proj_demo123',
  mode: 'production',
  baseUrl: 'http://localhost:3000',
});

rc.init();

console.log('ReviewCycle initialized in PRODUCTION mode!');
console.log('Connected to backend at http://localhost:3000');
console.log('Click the floating button to add comments to any element on the page.');
console.log('Open multiple browser windows to see real-time sync!');
