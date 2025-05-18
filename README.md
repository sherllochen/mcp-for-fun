# MCP FOR FUN
## Requirements:
1. Node.js installed.
2. Clone this repo.
3. Build the repo via `npm run build`.
3. Check the absolute path of node via `which node`.
4. Install a MCP client that supports MCP server, like Claude. The follow steps take Claude as an example, the way configing MCP server might varies for different MCP clients.
5. Update MCP server config.
    ```
    vim ~/Library/Application\ Support/Claude/claude_desktop_config.json
    # paste the follow lines:
    {
        "mcpServers": {
            "weather": {
                "command": "/aboslute/path/to/node",
                "args": [
                    "/aboslute/path/to/mcp-for-fun/build/index.js"
                ]
            }
        }
    }
    ```
6. Restart Claude. You should not see any error messages about MCP server.
7. Test if the MCP server works: ask Claude with "What is the weather today in LA?"
