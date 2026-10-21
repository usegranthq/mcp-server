import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import type { McpOpenAPITool } from 'mcp-from-openapi';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import { createServer } from './server.js';
import { loadTools } from './tools.js';

const error = (code: string) => ({
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { code: { const: code }, message: { type: 'string' } },
        required: ['code', 'message'],
      },
    },
  },
});

const spec = {
  openapi: '3.1.1',
  info: { title: 'UseGrant SDK', version: '1.0.0' },
  servers: [{ url: 'https://sdk.usegrant.dev' }],
  components: { securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer' } } },
  security: [{ BearerAuth: [] }],
  paths: {
    '/v1/providers/{providerId}/clients': {
      get: {
        operationId: 'providers.clients.list',
        summary: 'List Clients',
        parameters: [
          {
            name: 'providerId',
            in: 'path',
            required: true,
            schema: { type: 'string', description: 'Provider ID' },
          },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: '404', ...error('PROVIDER_NOT_FOUND') },
        },
      },
      post: {
        operationId: 'providers.clients.create',
        summary: 'Create Client',
        parameters: [
          {
            name: 'providerId',
            in: 'path',
            required: true,
            schema: { type: 'string', description: 'Provider ID' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 3 },
                  audience: { type: 'string' },
                },
                required: ['name', 'audience'],
              },
            },
          },
        },
        responses: { 201: { description: 'OK' } },
      },
    },
    '/v1/providers/{providerId}/clients/{clientId}': {
      delete: {
        operationId: 'providers.clients.delete',
        summary: 'Delete Client',
        parameters: [
          { name: 'providerId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 204: { description: 'OK' } },
      },
    },
  },
};

describe('loadTools', () => {
  let tools: McpOpenAPITool[];

  beforeAll(async () => {
    tools = await loadTools(spec);
  });

  it('should create a tool per operation named after the operationId', () => {
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'providers_clients_create',
      'providers_clients_delete',
      'providers_clients_list',
    ]);
  });

  it('should combine path parameters and body fields in the input schema', () => {
    const tool = tools.find((tool) => tool.name === 'providers_clients_create')!;

    expect(tool.title).toBe('Create Client');
    expect(Object.keys(tool.inputSchema.properties ?? {}).sort()).toEqual([
      'audience',
      'name',
      'providerId',
    ]);
    expect(tool.inputSchema.required).toEqual(
      expect.arrayContaining(['providerId', 'name', 'audience']),
    );
  });

  it('should annotate tools based on the HTTP method', () => {
    const annotations = Object.fromEntries(tools.map((tool) => [tool.name, tool.annotations]));

    expect(annotations.providers_clients_list).toMatchObject({ readOnlyHint: true });
    expect(annotations.providers_clients_create).toMatchObject({
      readOnlyHint: false,
      destructiveHint: false,
    });
    expect(annotations.providers_clients_delete).toMatchObject({
      readOnlyHint: false,
      destructiveHint: true,
    });
  });
});

describe('createServer', () => {
  const fetchMock = vi.fn<typeof fetch>();
  let client: Client;

  beforeEach(async () => {
    fetchMock.mockReset();
    const server = createServer({
      apiKey: 'test-api-key',
      tools: await loadTools(spec),
      version: '1.0.0',
      fetch: fetchMock,
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  const lastRequest = () => {
    const [url, init] = fetchMock.mock.calls.at(-1)!;
    return {
      url,
      method: init?.method,
      headers: init?.headers as Record<string, string>,
      body: init?.body,
    };
  };

  it('should list the tools', async () => {
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name)).toHaveLength(3);
    expect(tools.find((tool) => tool.name === 'providers_clients_create')).toMatchObject({
      title: 'Create Client',
      inputSchema: { type: 'object', required: expect.arrayContaining(['providerId']) },
      annotations: { destructiveHint: false },
    });
  });

  it('should call the API with the path parameters, body and api key', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ id: 'client-123', name: 'My Client' }, { status: 201 }),
    );

    const result = await client.callTool({
      name: 'providers_clients_create',
      arguments: { providerId: 'p-123', name: 'My Client', audience: 'my-audience' },
    });

    expect(lastRequest()).toMatchObject({
      url: 'https://sdk.usegrant.dev/v1/providers/p-123/clients',
      method: 'POST',
      headers: { Authorization: 'Bearer test-api-key', 'content-type': 'application/json' },
    });
    expect(JSON.parse(lastRequest().body as string)).toEqual({
      name: 'My Client',
      audience: 'my-audience',
    });
    expect(result.isError).toBeFalsy();
    expect(JSON.parse((result.content as { text: string }[])[0].text)).toEqual({
      id: 'client-123',
      name: 'My Client',
    });
  });

  it('should report success for empty responses', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await client.callTool({
      name: 'providers_clients_delete',
      arguments: { providerId: 'p-123', clientId: 'client-123' },
    });

    expect(lastRequest()).toMatchObject({
      url: 'https://sdk.usegrant.dev/v1/providers/p-123/clients/client-123',
      method: 'DELETE',
    });
    expect(result).toMatchObject({ content: [{ type: 'text', text: 'Delete Client succeeded' }] });
    expect(result.isError).toBeFalsy();
  });

  it('should return API errors as tool errors', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        { code: 'PROVIDER_NOT_FOUND', message: 'The specified provider could not be found' },
        { status: 404 },
      ),
    );

    const result = await client.callTool({
      name: 'providers_clients_list',
      arguments: { providerId: 'p-404' },
    });

    expect(result).toMatchObject({
      isError: true,
      content: [
        { type: 'text', text: '404 PROVIDER_NOT_FOUND: The specified provider could not be found' },
      ],
    });
  });

  it('should return non JSON errors as tool errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));

    const result = await client.callTool({
      name: 'providers_clients_list',
      arguments: { providerId: 'p-123' },
    });

    expect(result).toMatchObject({
      isError: true,
      content: [{ type: 'text', text: '502: Bad Gateway' }],
    });
  });

  it('should return network errors as tool errors', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    const result = await client.callTool({
      name: 'providers_clients_list',
      arguments: { providerId: 'p-123' },
    });

    expect(result).toMatchObject({
      isError: true,
      content: [{ type: 'text', text: 'fetch failed' }],
    });
  });

  it('should validate the arguments against the input schema without calling the API', async () => {
    const result = await client.callTool({
      name: 'providers_clients_create',
      arguments: { providerId: 'p-123', name: 'ab', audience: 'my-audience' },
    });

    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0].text).toContain(
      'Invalid arguments for tool providers_clients_create',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should reject unknown tools', async () => {
    await expect(client.callTool({ name: 'unknown_tool', arguments: {} })).rejects.toThrow(
      'Tool unknown_tool not found',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
