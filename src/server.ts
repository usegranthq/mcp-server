import { fromJsonSchema, McpServer, type CallToolResult } from '@modelcontextprotocol/server';
import { buildHttpRequest, type McpOpenAPITool } from 'mcp-from-openapi';

export interface ServerOptions {
  apiKey: string;
  tools: McpOpenAPITool[];
  version: string;
  fetch?: typeof fetch;
}

const errorResult = (text: string): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text }],
});

// prefer the `code` and `message` of UseGrant API errors over the raw body
const describeError = (status: number, body: string) => {
  try {
    const { code, message } = JSON.parse(body) as { code?: string; message?: string };
    if (message) {
      return `${status}${code ? ` ${code}` : ''}: ${message}`;
    }
  } catch {
    // not a JSON body
  }
  return `${status}: ${body || 'Request failed'}`;
};

const formatBody = (body: string) => {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
};

export function createServer({ apiKey, tools, version, fetch = globalThis.fetch }: ServerOptions) {
  const server = new McpServer({
    name: 'usegrant',
    version,
    description: 'UseGrant API integration for Model Context Protocol',
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        // validates the arguments against the JSON Schema generated from the OpenAPI spec as is
        inputSchema: fromJsonSchema<Record<string, unknown>>(
          tool.inputSchema as Parameters<typeof fromJsonSchema>[0],
        ),
        annotations: tool.annotations,
      },
      async (args): Promise<CallToolResult> => {
        try {
          const request = buildHttpRequest(tool, args);
          const response = await fetch(request.url, {
            method: request.method,
            headers: { ...request.headers, Authorization: `Bearer ${apiKey}` },
            body: request.body as BodyInit | undefined,
          });
          const body = await response.text();

          if (!response.ok) {
            return errorResult(describeError(response.status, body));
          }
          return {
            content: [
              {
                type: 'text',
                text: body ? formatBody(body) : `${tool.title ?? tool.name} succeeded`,
              },
            ],
          };
        } catch (error) {
          return errorResult(error instanceof Error ? error.message : String(error));
        }
      },
    );
  }

  return server;
}
