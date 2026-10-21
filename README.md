# UseGrant MCP Server

This is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server for interacting with the UseGrant API. It provides a set of tools for managing providers, clients, tenants, and access tokens through the UseGrant platform.

## Tools

The tools are generated from the [UseGrant OpenAPI spec](https://sdk.usegrant.dev/open-api.json) when the server starts, one tool per API operation, so new API operations are available without updating the server.

Tools are named after the operation, for example:

- **providers_list**: List Providers
- **providers_clients_create**: Create Client
- **providers_domains_verify**: Verify Domain
- **tenants_providers_policies_create**: Create Tenant Provider Policy
- **tenants_tokens_validate**: Validate Token

Read-only operations are marked with `readOnlyHint` and delete operations with `destructiveHint`, so MCP clients can ask for confirmation before changing anything.

## Requirements

- Node.js 22.19 or higher
- Network access to `sdk.usegrant.dev`, the OpenAPI spec is loaded on start
- A valid UseGrant API key. Refer [here](https://usegrant.dev/docs/authentication) for more details.

## Using with Claude desktop

Add the following config to your `claude_desktop_config` file:

```json
{
  "mcpServers": {
    "usegrant": {
      "command": "npx",
      "args": ["-y", "@usegrant/mcp"],
      "env": {
        "USEGRANT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Testing

To test the MCP server, we can use [mcp inspector](https://github.com/modelcontextprotocol/inspector).

Copy the `.env.example` file to `.env` and set the `USEGRANT_API_KEY` environment variable.

```bash
npx @modelcontextprotocol/inspector -e USEGRANT_API_KEY=$USEGRANT_API_KEY npx tsx src/index.ts
```

To watch and build the project:

```bash
npm run dev
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
