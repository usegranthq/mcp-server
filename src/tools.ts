import { OpenAPIToolGenerator, type McpOpenAPITool } from 'mcp-from-openapi';

export const SPEC_URL = 'https://sdk.usegrant.dev/open-api.json';

// tool names may only contain `[A-Za-z0-9_-]` for most clients, e.g. `providers.clients.create` -> `providers_clients_create`
const toolName = (path: string, method: string, operationId?: string) =>
  (operationId ?? `${method}_${path}`).replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');

/**
 * Generates one MCP tool per operation of the UseGrant OpenAPI spec.
 * Accepts the spec URL or the parsed spec.
 */
export async function loadTools(spec: string | object = SPEC_URL): Promise<McpOpenAPITool[]> {
  const generator =
    typeof spec === 'string'
      ? await OpenAPIToolGenerator.fromURL(spec, { timeout: 10_000 })
      : await OpenAPIToolGenerator.fromJSON(spec);

  const tools = await generator.generateTools({
    namingStrategy: { toolNameGenerator: toolName },
  });

  // annotations are inferred from the HTTP method, which marks every POST as destructive.
  // POST operations of the UseGrant API create, verify or validate resources, none of them destroy anything
  return tools.map((tool) =>
    tool.metadata.method === 'post' && tool.annotations
      ? { ...tool, annotations: { ...tool.annotations, destructiveHint: false } }
      : tool,
  );
}
