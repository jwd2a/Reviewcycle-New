# ReviewCycle Admin API - Create Project & API Key
#
# Usage:
#   hurl scripts/hurl/create-api-key.hurl --variable admin_key=YOUR_ADMIN_KEY --variable project_name="My Project"
#
# Environment Variables:
#   REVIEWCYCLE_ADMIN_KEY - Your admin API key from Render
#   REVIEWCYCLE_API_URL   - API base URL (default: https://reviewcycle-api.onrender.com)

POST {{api_url}}/api/admin/projects
Authorization: Bearer {{admin_key}}
Content-Type: application/json

{
  "name": "{{project_name}}"
}

HTTP 201
[Asserts]
jsonpath "$.apiKey" exists
jsonpath "$.apiKey" startsWith "rc_proj_"
jsonpath "$.projectId" exists
jsonpath "$.name" == "{{project_name}}"
jsonpath "$.createdAt" exists

[Captures]
api_key: jsonpath "$.apiKey"
project_id: jsonpath "$.projectId"
