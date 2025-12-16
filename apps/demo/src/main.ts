import ReviewCycle from '@reviewcycle/client';

// Initialize ReviewCycle
const rc = new ReviewCycle({
  apiKey: 'rc_proj_demo_key_123456789',
  mode: 'development',
});

rc.init();

console.log('ReviewCycle initialized!');
console.log('Click the floating button to add comments to any element on the page.');
