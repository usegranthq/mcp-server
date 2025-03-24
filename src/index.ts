#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import UseGrant from '@usegrant/sdk';
import * as UgSchema from '@usegrant/sdk/schema';
import { z } from 'zod';

// Check for required API key
const apiKey = process.env.USEGRANT_API_KEY;
if (!apiKey) {
  console.error('Missing USEGRANT_API_KEY environment variable');
  process.exit(1);
}

// Initialize UseGrant SDK
const usegrant = new UseGrant(apiKey);

// Create MCP server
const server = new McpServer({
  name: 'usegrant',
  version: '1.0.3',
  description: 'UseGrant API integration for Model Context Protocol',
});

server.tool('list_providers', 'List all providers', async () => {
  const providers = await usegrant.listProviders();
  return {
    content: [{ type: 'text', text: JSON.stringify(providers, null, 2) }],
  };
});

server.tool(
  'create_provider',
  'Create a new provider',
  UgSchema.CreateProviderSchema.shape,
  async (args) => {
    const provider = await usegrant.createProvider(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(provider, null, 2) }],
    };
  },
);

server.tool(
  'get_provider',
  'Get a provider by ID',
  { id: UgSchema.ProviderIdSchema },
  async ({ id }) => {
    const provider = await usegrant.getProvider(id);
    return {
      content: [{ type: 'text', text: JSON.stringify(provider, null, 2) }],
    };
  },
);

server.tool(
  'delete_provider',
  'Delete a provider',
  { id: UgSchema.ProviderIdSchema },
  async ({ id }) => {
    await usegrant.deleteProvider(id);
    return {
      content: [{ type: 'text', text: `Provider ${id} deleted` }],
    };
  },
);

server.tool(
  'list_clients',
  'List all clients',
  { providerId: UgSchema.ProviderIdSchema },
  async ({ providerId }) => {
    const clients = await usegrant.listClients(providerId);
    return {
      content: [{ type: 'text', text: JSON.stringify(clients, null, 2) }],
    };
  },
);

server.tool(
  'create_client',
  'Create a new client for a provider',
  { providerId: UgSchema.ProviderIdSchema, ...UgSchema.CreateClientSchema.shape },
  async ({ providerId, ...payload }) => {
    const client = await usegrant.createClient(providerId, payload);
    return {
      content: [{ type: 'text', text: JSON.stringify(client, null, 2) }],
    };
  },
);

server.tool(
  'get_client',
  'Get client details by provider and client ID',
  {
    providerId: UgSchema.ProviderIdSchema,
    clientId: UgSchema.ClientIdSchema,
  },
  async ({ providerId, clientId }) => {
    const client = await usegrant.getClient(providerId, clientId);
    return {
      content: [{ type: 'text', text: JSON.stringify(client, null, 2) }],
    };
  },
);

server.tool(
  'delete_client',
  'Delete a client from a provider',
  {
    providerId: UgSchema.ProviderIdSchema,
    clientId: UgSchema.ClientIdSchema,
  },
  async ({ providerId, clientId }) => {
    await usegrant.deleteClient(providerId, clientId);
    return {
      content: [{ type: 'text', text: `Client ${clientId} deleted` }],
    };
  },
);

server.tool(
  'list_domains',
  'List all domains for a provider',
  {
    providerId: UgSchema.ProviderIdSchema,
  },
  async ({ providerId }) => {
    const domains = await usegrant.listDomains(providerId);
    return {
      content: [{ type: 'text', text: JSON.stringify(domains, null, 2) }],
    };
  },
);

server.tool(
  'add_domain',
  'Add a domain to a provider',
  {
    providerId: UgSchema.ProviderIdSchema,
    domain: UgSchema.DomainSchema.shape.domain,
  },
  async ({ providerId, domain }) => {
    const domainEntity = await usegrant.addDomain(providerId, { domain });
    return {
      content: [{ type: 'text', text: JSON.stringify(domainEntity, null, 2) }],
    };
  },
);

server.tool(
  'get_domain',
  'Get a domain by provider and domain ID',
  {
    providerId: UgSchema.ProviderIdSchema,
    domainId: UgSchema.DomainIdSchema,
  },
  async ({ providerId, domainId }) => {
    const domain = await usegrant.getDomain(providerId, domainId);
    return {
      content: [{ type: 'text', text: JSON.stringify(domain, null, 2) }],
    };
  },
);

server.tool(
  'delete_domain',
  'Delete a domain from a provider',
  {
    providerId: UgSchema.ProviderIdSchema,
    domainId: UgSchema.DomainIdSchema,
  },
  async ({ providerId, domainId }) => {
    await usegrant.deleteDomain(providerId, domainId);
    return {
      content: [{ type: 'text', text: `Domain ${domainId} deleted` }],
    };
  },
);

server.tool(
  'verify_domain',
  'Verify a domain for a provider',
  {
    providerId: UgSchema.ProviderIdSchema,
    domainId: UgSchema.DomainIdSchema,
  },
  async ({ providerId, domainId }) => {
    const domain = await usegrant.verifyDomain(providerId, domainId);
    return {
      content: [{ type: 'text', text: JSON.stringify(domain, null, 2) }],
    };
  },
);

server.tool(
  'create_access_token',
  'Create a new access token for a client',
  {
    providerId: UgSchema.ProviderIdSchema,
    clientId: UgSchema.ClientIdSchema,
    ...UgSchema.CreateTokenSchema.shape,
  },
  async ({ providerId, clientId, ...payload }) => {
    const token = await usegrant.createToken(providerId, clientId, payload);
    return {
      content: [{ type: 'text', text: JSON.stringify(token, null, 2) }],
    };
  },
);

server.tool('list_tenants', 'List all tenants', async () => {
  const tenants = await usegrant.listTenants();
  return {
    content: [{ type: 'text', text: JSON.stringify(tenants, null, 2) }],
  };
});

server.tool(
  'create_tenant',
  'Create a new tenant',
  UgSchema.CreateTenantSchema.shape,
  async (payload) => {
    const tenant = await usegrant.createTenant(payload);
    return {
      content: [{ type: 'text', text: JSON.stringify(tenant, null, 2) }],
    };
  },
);

server.tool(
  'get_tenant',
  'Get a tenant by ID',
  {
    id: UgSchema.TenantIdSchema,
  },
  async ({ id }) => {
    const tenant = await usegrant.getTenant(id);
    return {
      content: [{ type: 'text', text: JSON.stringify(tenant, null, 2) }],
    };
  },
);

server.tool(
  'delete_tenant',
  'Delete a tenant',
  {
    id: UgSchema.TenantIdSchema,
  },
  async ({ id }) => {
    await usegrant.deleteTenant(id);
    return {
      content: [{ type: 'text', text: `Tenant ${id} deleted` }],
    };
  },
);

server.tool(
  'list_tenant_providers',
  'List all providers for a tenant',
  {
    tenantId: UgSchema.TenantIdSchema,
  },
  async ({ tenantId }) => {
    const providers = await usegrant.listTenantProviders(tenantId);
    return {
      content: [{ type: 'text', text: JSON.stringify(providers, null, 2) }],
    };
  },
);

server.tool(
  'create_tenant_provider',
  'Create a new provider for a tenant',
  {
    tenantId: UgSchema.TenantIdSchema,
    ...UgSchema.CreateTenantProviderSchema.shape,
  },
  async ({ tenantId, ...payload }) => {
    const provider = await usegrant.createTenantProvider(tenantId, payload);
    return {
      content: [{ type: 'text', text: JSON.stringify(provider, null, 2) }],
    };
  },
);

server.tool(
  'get_tenant_provider',
  'Get a provider for a tenant',
  {
    tenantId: UgSchema.TenantIdSchema,
    providerId: UgSchema.TenantProviderIdSchema,
  },
  async ({ tenantId, providerId }) => {
    const provider = await usegrant.getTenantProvider(tenantId, providerId);
    return {
      content: [{ type: 'text', text: JSON.stringify(provider, null, 2) }],
    };
  },
);

server.tool(
  'delete_tenant_provider',
  'Delete a provider for a tenant',
  {
    tenantId: UgSchema.TenantIdSchema,
    providerId: UgSchema.TenantProviderIdSchema,
  },
  async ({ tenantId, providerId }) => {
    await usegrant.deleteTenantProvider(tenantId, providerId);
    return {
      content: [{ type: 'text', text: `Provider ${providerId} deleted` }],
    };
  },
);

server.tool(
  'list_tenant_provider_policies',
  'List all policies for a tenant provider',
  {
    tenantId: UgSchema.TenantIdSchema,
    providerId: UgSchema.TenantProviderIdSchema,
  },
  async ({ tenantId, providerId }) => {
    const policies = await usegrant.listTenantProviderPolicies(tenantId, providerId);
    return {
      content: [{ type: 'text', text: JSON.stringify(policies, null, 2) }],
    };
  },
);

server.tool(
  'create_tenant_provider_policy',
  'Create a new policy for a tenant provider',
  {
    tenantId: UgSchema.TenantIdSchema,
    providerId: UgSchema.TenantProviderIdSchema,
    ...UgSchema.CreateTenantProviderPolicySchema.shape,
  },
  async ({ tenantId, providerId, ...payload }) => {
    const policy = await usegrant.createTenantProviderPolicy(tenantId, providerId, payload);
    return {
      content: [{ type: 'text', text: JSON.stringify(policy, null, 2) }],
    };
  },
);

server.tool(
  'get_tenant_provider_policy',
  'Get a policy for a tenant provider',
  {
    tenantId: UgSchema.TenantIdSchema,
    providerId: UgSchema.TenantProviderIdSchema,
    policyId: UgSchema.TenantProviderPolicyIdSchema,
  },
  async ({ tenantId, providerId, policyId }) => {
    const policy = await usegrant.getTenantProviderPolicy(tenantId, providerId, policyId);
    return {
      content: [{ type: 'text', text: JSON.stringify(policy, null, 2) }],
    };
  },
);

server.tool(
  'delete_tenant_provider_policy',
  'Delete a policy for a tenant provider',
  {
    tenantId: UgSchema.TenantIdSchema,
    providerId: UgSchema.TenantProviderIdSchema,
    policyId: UgSchema.TenantProviderPolicyIdSchema,
  },
  async ({ tenantId, providerId, policyId }) => {
    await usegrant.deleteTenantProviderPolicy(tenantId, providerId, policyId);
    return {
      content: [{ type: 'text', text: `Policy ${policyId} deleted` }],
    };
  },
);

server.prompt(
  'validate_access_token',
  'Validate an access token',
  {
    tenantId: UgSchema.TenantIdSchema,
    policyId: UgSchema.TenantProviderPolicyIdSchema,
    accessToken: z.string(),
  },
  async ({ tenantId, policyId, accessToken }) => {
    const isValid = await usegrant.validateToken(tenantId, policyId, accessToken);

    return {
      messages: [
        {
          role: 'assistant',
          content: { type: 'text', text: JSON.stringify(isValid, null, 2) },
        },
      ],
    };
  },
);

// Start the server
try {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UseGrant MCP Server running on stdio');
} catch (error) {
  console.error('Fatal error in main():', error);
  process.exit(1);
}
