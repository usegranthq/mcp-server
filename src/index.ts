#!/usr/bin/env node

import { createRequire } from 'node:module';

import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

import { createServer } from './server.js';
import { loadTools, SPEC_URL } from './tools.js';

const apiKey = process.env.USEGRANT_API_KEY;
if (!apiKey) {
  console.error('Missing USEGRANT_API_KEY environment variable');
  process.exit(1);
}

const { version } = createRequire(import.meta.url)('../package.json') as { version: string };

try {
  const tools = await loadTools(SPEC_URL);
  const server = createServer({ apiKey, tools, version });
  await server.connect(new StdioServerTransport());
  console.error(`UseGrant MCP Server running on stdio with ${tools.length} tools`);
} catch (error) {
  console.error('Failed to start the UseGrant MCP Server:', error);
  process.exit(1);
}
