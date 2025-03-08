# UseGrant MCP Server

This is a Model Context Protocol (MCP) server for interacting with the UseGrant API. It provides a set of tools for managing providers, clients, tenants, and access tokens through the UseGrant platform.

## Installation

```bash
npm install @usegrant/mcp-server
```

## Available Tools

- **list_providers**: List all providers
- **create_provider**: Create a new provider
- **get_provider**: Get a provider by ID
- **delete_provider**: Delete a provider
- **list_clients**: List all clients for a provider
- **create_client**: Create a new client for a provider
- **get_client**: Get client details by provider and client ID
- **delete_client**: Delete a client from a provider
- **create_access_token**: Create a new access token for a client
- **list_tenants**: List all tenants
- **create_tenant**: Create a new tenant
- **get_tenant**: Get a tenant by ID
- **delete_tenant**: Delete a tenant
- **list_tenant_providers**: List all providers for a tenant
- **create_tenant_provider**: Create a new provider for a tenant
- **get_tenant_provider**: Get a provider for a tenant
- **delete_tenant_provider**: Delete a provider for a tenant
- **validate_access_token**: Validate an access token for a tenant

## Using with Claude desktop

Add the following config to your `claude_desktop_config` file:

```json
{
  "mcpServers": {
    "usegrant": {
      "command": "npx",
      "args": ["-y", "@usegrant/mcp-server"],
      "env": {
        "USEGRANT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Requirements

- Node.js 16 or higher
- A valid UseGrant API key
