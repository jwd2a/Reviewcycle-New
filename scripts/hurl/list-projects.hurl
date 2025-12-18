# ReviewCycle Admin API - List All Projects
#
# Usage:
#   hurl scripts/hurl/list-projects.hurl --variable admin_key=YOUR_ADMIN_KEY
#
# Environment Variables:
#   REVIEWCYCLE_ADMIN_KEY - Your admin API key from Render
#   REVIEWCYCLE_API_URL   - API base URL (default: https://reviewcycle-api.onrender.com)

GET {{api_url}}/api/admin/projects
Authorization: Bearer {{admin_key}}

HTTP 200
[Asserts]
jsonpath "$.projects" isCollection
jsonpath "$.projects[*].apiKey" exists
jsonpath "$.projects[*].projectId" exists
jsonpath "$.projects[*].name" exists
