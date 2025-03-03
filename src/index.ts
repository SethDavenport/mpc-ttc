import 'dotenv/config'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getNearbyStops, getNearbyStopsSchema } from "./tools/get-nearby-stops.js";
import { getNextArrivals, getNextArrivalsSchema } from "./tools/get-next-arrivals.js";

// Create an MCP server
const server = new McpServer({
  name: "TTC-MCP",
  version: "1.0.0"
});

// Add the getNearbyStops tool
server.tool(
  getNearbyStopsSchema.name,
  getNearbyStopsSchema.parameters.shape,
  async ({ postalCode }) => {
    const stops = await getNearbyStops({postalCode});
    return {
      content: [{ type: "text", text: JSON.stringify(stops, null, 2) }]
    };
  }
);

// Add the getNextArrivals tool
server.tool(
  getNextArrivalsSchema.name,
  getNextArrivalsSchema.parameters.shape,
  async ({ stopId, routeId }) => {
    const arrivals = await getNextArrivals({ stopId, routeId });
    return {
      content: [{ type: "text", text: JSON.stringify(arrivals, null, 2) }]
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
