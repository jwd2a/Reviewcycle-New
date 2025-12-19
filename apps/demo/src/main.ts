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

// SPA Navigation Test Setup
const views = {
  view1: `
    <section class="spa-view">
      <div class="container">
        <h2 class="view-title">📱 Product Dashboard</h2>
        <div class="view-content">
          <div class="card">
            <h3 class="card-title">Active Users</h3>
            <p class="stat">1,234</p>
            <p class="card-text">Users active in the last 30 days</p>
          </div>
          <div class="card">
            <h3 class="card-title">Revenue</h3>
            <p class="stat">$12,345</p>
            <p class="card-text">Total revenue this month</p>
          </div>
          <div class="card">
            <h3 class="card-title">Conversions</h3>
            <p class="stat">23%</p>
            <p class="card-text">Conversion rate improvement</p>
          </div>
        </div>
        <button class="action-btn">View Detailed Analytics</button>
      </div>
    </section>
  `,
  view2: `
    <section class="spa-view">
      <div class="container">
        <h2 class="view-title">⚙️ Settings Panel</h2>
        <div class="view-content">
          <div class="settings-group">
            <h3 class="settings-header">Account Settings</h3>
            <div class="setting-item">
              <label>Email Notifications</label>
              <input type="checkbox" checked>
            </div>
            <div class="setting-item">
              <label>Dark Mode</label>
              <input type="checkbox">
            </div>
            <div class="setting-item">
              <label>Two-Factor Authentication</label>
              <input type="checkbox" checked>
            </div>
          </div>
          <div class="settings-group">
            <h3 class="settings-header">Privacy Settings</h3>
            <div class="setting-item">
              <label>Profile Visibility</label>
              <select>
                <option>Public</option>
                <option selected>Private</option>
              </select>
            </div>
          </div>
        </div>
        <button class="action-btn">Save Settings</button>
      </div>
    </section>
  `,
  view3: `
    <section class="spa-view">
      <div class="container">
        <h2 class="view-title">👥 Team Management</h2>
        <div class="view-content">
          <div class="team-member">
            <div class="member-avatar">JD</div>
            <div class="member-info">
              <h4 class="member-name">Jane Doe</h4>
              <p class="member-role">Product Manager</p>
            </div>
            <button class="member-action">Edit</button>
          </div>
          <div class="team-member">
            <div class="member-avatar">BS</div>
            <div class="member-info">
              <h4 class="member-name">Bob Smith</h4>
              <p class="member-role">Lead Designer</p>
            </div>
            <button class="member-action">Edit</button>
          </div>
          <div class="team-member">
            <div class="member-avatar">AC</div>
            <div class="member-info">
              <h4 class="member-name">Alice Chen</h4>
              <p class="member-role">Senior Developer</p>
            </div>
            <button class="member-action">Edit</button>
          </div>
        </div>
        <button class="action-btn">Add Team Member</button>
      </div>
    </section>
  `,
};

let currentView = 'view1';

function renderView(viewName: keyof typeof views) {
  const container = document.getElementById('spa-content');
  if (!container) return;

  // Remove old content (simulating SPA unmount)
  container.innerHTML = '';

  // Add new content (simulating SPA mount)
  setTimeout(() => {
    container.innerHTML = views[viewName];
    currentView = viewName;
  }, 50);

  // Update active button state
  document.querySelectorAll('.spa-btn').forEach((btn) => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    }
  });

  // Simulate history.pushState (without changing URL)
  history.pushState({ view: viewName }, '', window.location.href);
}

// Initialize with first view
renderView('view1');

// Setup navigation
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('spa-btn')) {
    const view = target.getAttribute('data-view') as keyof typeof views;
    if (view) {
      renderView(view);
    }
  }
});

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  if (e.state?.view) {
    renderView(e.state.view);
  }
});
