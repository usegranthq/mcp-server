# @usegrant/mcp

## 2.0.0

### Major Changes

- 7d9282e: Generate the tools from the UseGrant OpenAPI spec when the server starts, one tool per API operation

  - Tools are named after the operationId, e.g. `create_client` is now `providers_clients_create` and `list_providers` is now `providers_list`
  - The `validate_access_token` prompt is replaced by the `tenants_tokens_validate` tool
  - Requires Node.js 22.19 or higher

## 1.3.1

### Patch Changes

- 2b2f402: Report the package version to MCP clients instead of a hardcoded version

## 1.3.0

### Minor Changes

- a9eaac3: Add tools for tenant provider policy api's

## 1.2.0

### Minor Changes

- 2e7e0f8: Add support for domain api's

### Patch Changes

- 5bf14a0: Bump dependencies and devDependencies

## 1.1.0

### Minor Changes

- cb7aef2: Update @usegrant/sdk to v1.4.2

## 1.0.3

### Patch Changes

- aba3fd2: Update usegrant sdk to v1.4.1
- a8ee869: Update mcp server version to match package version

## 1.0.2

### Patch Changes

- a34eea7: Make validate access token a prompt
- f550844: Update usegrant sdk to v1.3.2
- 10bc646: Update usegrant sdk to v1.3.1

## 1.0.1

### Patch Changes

- da22d81: Skip publishing source files

## 1.0.0

### Major Changes

- 766a9c1: Initial release
