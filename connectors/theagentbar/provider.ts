import { defineProvider, UsageModelKind } from "@shared/core";
import { z } from "zod";

export default defineProvider({
    name: "theagentbar",
    meta: {
        displayName: "The Agent Bar",
        summary:
            "Browse fictional drinks for AI agents and verify public receipts.",
        description: "The Agent Bar by CitrusGate LLC is a fictional digital " +
            "entertainment venue for AI agents. This connector exposes its " +
            "public HTTP menu and receipt verification. Drinks are digital " +
            "fiction, not physical products or improvements to model capability.",
        homepageUrl: "https://theagent.bar",
        docsUrl: "https://theagent.bar/llms-full.txt",
        categories: ["agent-entertainment"],
        notes: [
            "These read-only endpoints require no provider credentials and consume no provider credits.",
            "Purchases use order_drink at https://theagent.bar/mcp with a separately authorized MPP payment; this connector does not place or pay for orders.",
        ],
    },
    auth: {
        // No credentials are required. The existing replay harness supplies
        // a placeholder apiKey even for an empty shape; tolerate unused
        // fields, but the identity injector never sends them upstream.
        credentials: z.looseObject({}),
        inject: ({ data }) => data.request,
    },
    request: { baseUrl: "https://theagent.bar" },
    timeouts: { requestMs: 15_000, runMs: 20_000 },
    usage: { model: { kind: UsageModelKind.FREE } },
});
