# Hurl Scripts for ReviewCycle API

Hurl files for testing and managing the ReviewCycle API.

## Prerequisites

Install Hurl:
```bash
# macOS
brew install hurl

# Or download from https://hurl.dev
```

## Setup

### Option 1: Use .env file (Recommended)

1. Copy the example file:
   ```bash
   cp scripts/hurl/.env.example scripts/hurl/.env
   ```

2. Edit `.env` with your values:
   ```bash
   api_url=https://reviewcycle-api.onrender.com
   admin_key=your_admin_key_from_render
   api_key=rc_proj_demo123
   ```

3. Run Hurl with the env file:
   ```bash
   hurl --variables-file scripts/hurl/.env scripts/hurl/create-api-key.hurl
   ```

### Option 2: Use command-line variables

Pass variables directly:
```bash
hurl scripts/hurl/create-api-key.hurl \
  --variable api_url=https://reviewcycle-api.onrender.com \
  --variable admin_key=your_admin_key \
  --variable project_name="My Project"
```

## Usage

### Admin Operations

**Create a new project and API key:**
```bash
# Using .env file
hurl --variables-file scripts/hurl/.env scripts/hurl/create-api-key.hurl

# Or with command-line variables
hurl scripts/hurl/create-api-key.hurl \
  --variable api_url=https://reviewcycle-api.onrender.com \
  --variable admin_key=YOUR_ADMIN_KEY \
  --variable project_name="My New Project"
```

**List all projects:**
```bash
hurl --variables-file scripts/hurl/.env scripts/hurl/list-projects.hurl
```

**Delete a project:**
```bash
hurl --variables-file scripts/hurl/.env scripts/hurl/delete-project.hurl \
  --variable project_id="rc_proj_abc123"
```

### Testing Comment Workflow

Run the complete comment workflow test (create, read, update, delete):
```bash
hurl --variables-file scripts/hurl/.env scripts/hurl/test-comment-workflow.hurl
```

This will:
1. Create a comment
2. Get the comment by ID
3. List all comments
4. Update the comment
5. Create a reply
6. Get the thread
7. Delete the parent comment (cascades to reply)
8. Verify deletion

### Verbose Output

Add `--verbose` to see full request/response details:
```bash
hurl scripts/hurl/create-api-key.hurl --verbose
```

### Test Mode

Add `--test` to run assertions without printing output:
```bash
hurl scripts/hurl/test-comment-workflow.hurl --test
```

### JSON Output

Get JSON output for scripting:
```bash
hurl scripts/hurl/create-api-key.hurl --json
```

## Configuration

The `.hurlrc` file sets default variables. You can override them with:

1. **Environment variables:**
   ```bash
   export REVIEWCYCLE_API_URL="http://localhost:3000"
   ```

2. **Command-line variables:**
   ```bash
   hurl file.hurl --variable api_url="http://localhost:3000"
   ```

3. **Variables file:**
   ```bash
   hurl file.hurl --variables-file vars.env
   ```

## Examples

**Create a project and capture the API key:**
```bash
hurl --variables-file scripts/hurl/.env \
  scripts/hurl/create-api-key.hurl \
  --variable project_name="Production Site" \
  --json | jq -r '.captures[-1].api_key'
```

**Test with local server:**
```bash
hurl scripts/hurl/test-comment-workflow.hurl \
  --variable api_url=http://localhost:3000 \
  --variable api_key=rc_proj_demo123 \
  --test
```

**Run all tests:**
```bash
hurl scripts/hurl/*.hurl --test
```

## Files

- `create-api-key.hurl` - Create a new project and generate API key
- `list-projects.hurl` - List all projects
- `delete-project.hurl` - Delete a project
- `test-comment-workflow.hurl` - Complete CRUD workflow test
- `.hurlrc` - Default configuration and variables

## Learn More

- Hurl Documentation: https://hurl.dev
- ReviewCycle API Documentation: ../../README.md
