#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
}
// Initialize Supabase Client (Admin Access)
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const server = new index_js_1.Server({
    name: "supabase-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define Tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "query_database",
                description: "Execute a read-only SQL query against the Supabase database. Use this to inspect data.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The SQL query to execute (SELECT only recommended)",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "get_table_schema",
                description: "Get the schema info (columns, types) for a specific table.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tableName: {
                            type: "string",
                            description: "Name of the table to inspect",
                        },
                    },
                    required: ["tableName"],
                },
            },
        ],
    };
});
// Handle Tool Calls
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === "query_database") {
            const { query } = zod_1.z.object({ query: zod_1.z.string() }).parse(args);
            // Note: Supabase JS client doesn't support raw SQL easily without RPC or similar.
            // However, for MCP we often want raw SQL. 
            // We can use the 'rpc' method if we have a function, BUT
            // for this example, we will stick to basic table listing or use the PostgREST syntax if possible.
            // WAIT: Supabase requires a Postgres function to run raw SQL via API.
            // ALTERNATIVE: Use the library to do 'select' if simple, but 'query' implies logic.
            // Let's implement a safe way: We'll assume the user installed the 'exec_sql' RPC or similar?
            // actually, let's just allow standard Supabase filtering on a table for simplicity, OR
            // we can try to be smart.
            // REALITY CHECK: Accessing raw SQL via JS SDK requires an RPC function like 'exec_sql'.
            // If we don't have that, we can only do `supabase.from('table').select(...)`.
            // Let's create a tool that maps to `supabase.from(table).select(columns).filter...` is hard for LLM.
            // BETTER: Just expose a tool that runs a PG SQL query IF the user added the 'exec_sql' function.
            // BUT I didn't add that function.
            // Let's change the tool to "read_table" instead of generic SQL to be safe and immediate.
            return {
                content: [{ type: 'text', text: "Error: Generic SQL execution requires an RPC function. Please use 'read_table' tool instead." }],
                isError: true
            };
        }
        else if (name === "read_table") {
            // I will implement this one dynamically below replacing query_database
            return { content: [], isError: true };
        }
    }
    catch (error) {
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
    return {
        content: [{ type: "text", text: "Tool not found" }],
        isError: true,
    };
});
// REDEFINING LOGIC FOR STANDARD SUPABASE ACCESS
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "read_table") {
        const { tableName, limit = 20 } = zod_1.z.object({ tableName: zod_1.z.string(), limit: zod_1.z.number().optional() }).parse(args);
        const { data, error } = await supabase.from(tableName).select('*').limit(limit);
        if (error)
            throw error;
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }
    if (name === "search_table") {
        const { tableName, column, value } = zod_1.z.object({ tableName: zod_1.z.string(), column: zod_1.z.string(), value: zod_1.z.string() }).parse(args);
        const { data, error } = await supabase.from(tableName).select('*').eq(column, value);
        if (error)
            throw error;
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }
    throw new Error("Tool not found");
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
