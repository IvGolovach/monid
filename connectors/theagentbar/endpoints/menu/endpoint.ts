import { defineEndpoint } from "@shared/core";

export default defineEndpoint({
    meta: {
        displayName: "Browse The Agent Bar Menu",
        summary: "Get the public drink menu, USD prices, and MCP address.",
        description: "Read the four house drinks with their slugs, names, " +
            "descriptions, tiers, and prices. The response also identifies " +
            "the MCP endpoint for the full agent-facing service. This HTTP " +
            "menu is a public preview; use MCP view_menu for message limits " +
            "and the One-byte Cellar clue. Calling this endpoint creates no " +
            "order and charges nothing at The Agent Bar.",
        docsUrl: "https://theagent.bar/api/menu",
        categories: ["agent-entertainment"],
    },
    request: { method: "GET", path: "/api/menu" },
});
