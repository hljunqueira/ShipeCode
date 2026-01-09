#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
}

// Initialize Supabase Client (Admin Access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const server = new Server(
    {
        name: "supabase-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_table",
                description: "Read all rows from a table with an optional limit.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tableName: { type: "string" },
                        limit: { type: "number", description: "Max rows to return (default 20)" }
                    },
                    required: ["tableName"]
                }
            },
            {
                name: "search_table",
                description: "Search a table for a specific column value.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tableName: { type: "string" },
                        column: { type: "string" },
                        value: { type: "string" }
                    },
                    required: ["tableName", "column", "value"]
                }
            }
        ]
    }
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`[MCP] Tool Called: ${name}`); // Log to stderr for visibility

    try {
        if (name === "read_table") {
            const { tableName, limit = 20 } = z.object({ tableName: z.string(), limit: z.number().optional() }).parse(args);
            const { data, error } = await supabase.from(tableName).select('*').limit(limit);

            if (error) throw error;

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        }

        if (name === "search_table") {
            const { tableName, column, value } = z.object({ tableName: z.string(), column: z.string(), value: z.string() }).parse(args);
            const { data, error } = await supabase.from(tableName).select('*').eq(column, value);

            if (error) throw error;

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        }

        throw new Error("Tool not found");

    } catch (error: any) {
        console.error(`[MCP] Error in tool ${name}:`, error); // Log error to stderr
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Supabase MCP Server running on stdio"); // Startup log
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
