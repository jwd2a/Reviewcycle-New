# ReviewCycle Admin API - Delete Project
#
# Usage:
#   hurl scripts/hurl/delete-project.hurl --variable admin_key=YOUR_ADMIN_KEY --variable project_id=rc_proj_abc123
#
# Environment Variables:
#   REVIEWCYCLE_ADMIN_KEY - Your admin API key from Render
#   REVIEWCYCLE_API_URL   - API base URL (default: https://reviewcycle-api.onrender.com)

DELETE {{api_url}}/api/admin/projects/{{project_id}}
Authorization: Bearer {{admin_key}}

HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Project deleted"
