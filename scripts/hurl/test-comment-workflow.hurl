# ReviewCycle API - Complete Comment Workflow
#
# Tests: Create, Read, Update, Delete comments
#
# Usage:
#   hurl scripts/hurl/test-comment-workflow.hurl --variable api_key=rc_proj_demo123
#
# Environment Variables:
#   REVIEWCYCLE_API_KEY - Your project API key
#   REVIEWCYCLE_API_URL - API base URL (default: https://reviewcycle-api.onrender.com)

# 1. Create a comment
POST {{api_url}}/api/projects/{{api_key}}/comments
Authorization: Bearer {{api_key}}
Content-Type: application/json

{
  "text": "This is a test comment from Hurl",
  "url": "https://example.com/test",
  "authorName": "Test User",
  "authorEmail": "test@example.com",
  "elementSelector": "#test-element",
  "elementXPath": "/html/body/div[1]",
  "elementText": "Test Element",
  "boundingRect": {
    "x": 100,
    "y": 200,
    "width": 300,
    "height": 50
  }
}

HTTP 201
[Asserts]
jsonpath "$.comment.id" exists
jsonpath "$.comment.text" == "This is a test comment from Hurl"
jsonpath "$.comment.url" == "https://example.com/test"
jsonpath "$.comment.threadId" exists

[Captures]
comment_id: jsonpath "$.comment.id"
thread_id: jsonpath "$.comment.threadId"

# 2. Get the comment
GET {{api_url}}/api/projects/{{api_key}}/comments/{{comment_id}}
Authorization: Bearer {{api_key}}

HTTP 200
[Asserts]
jsonpath "$.comment.id" == "{{comment_id}}"
jsonpath "$.comment.text" == "This is a test comment from Hurl"

# 3. List all comments
GET {{api_url}}/api/projects/{{api_key}}/comments
Authorization: Bearer {{api_key}}

HTTP 200
[Asserts]
jsonpath "$.comments" isCollection
jsonpath "$.comments[?(@.id == '{{comment_id}}')]" exists

# 4. Update the comment
PATCH {{api_url}}/api/projects/{{api_key}}/comments/{{comment_id}}
Authorization: Bearer {{api_key}}
Content-Type: application/json

{
  "text": "Updated comment text",
  "resolved": true
}

HTTP 200
[Asserts]
jsonpath "$.comment.text" == "Updated comment text"
jsonpath "$.comment.resolved" == true

# 5. Create a reply
POST {{api_url}}/api/projects/{{api_key}}/comments
Authorization: Bearer {{api_key}}
Content-Type: application/json

{
  "text": "This is a reply",
  "url": "https://example.com/test",
  "authorName": "Test User",
  "parentId": "{{comment_id}}"
}

HTTP 201
[Asserts]
jsonpath "$.comment.parentId" == "{{comment_id}}"
jsonpath "$.comment.threadId" == "{{thread_id}}"

[Captures]
reply_id: jsonpath "$.comment.id"

# 6. Get thread
GET {{api_url}}/api/projects/{{api_key}}/threads/{{thread_id}}
Authorization: Bearer {{api_key}}

HTTP 200
[Asserts]
jsonpath "$.comments" isCollection
jsonpath "$.comments" count == 2

# 7. Delete the parent comment (cascades to reply)
DELETE {{api_url}}/api/projects/{{api_key}}/comments/{{comment_id}}
Authorization: Bearer {{api_key}}

HTTP 200
[Asserts]
jsonpath "$.deletedIds" isCollection
jsonpath "$.deletedIds" includes "{{comment_id}}"
jsonpath "$.deletedIds" includes "{{reply_id}}"

# 8. Verify deletion
GET {{api_url}}/api/projects/{{api_key}}/comments/{{comment_id}}
Authorization: Bearer {{api_key}}

HTTP 404
