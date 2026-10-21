---
'@usegrant/mcp': major
---

Generate the tools from the UseGrant OpenAPI spec when the server starts, one tool per API operation

- Tools are named after the operationId, e.g. `create_client` is now `providers_clients_create` and `list_providers` is now `providers_list`
- The `validate_access_token` prompt is replaced by the `tenants_tokens_validate` tool
- Requires Node.js 22.19 or higher
