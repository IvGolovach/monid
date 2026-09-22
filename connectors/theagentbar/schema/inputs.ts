import { z } from "zod";

export const zOrderBody = z.object({
    order_nonce: z.string().uuid().describe(
        "Fresh UUID for one intended purchase. Persist it and reuse it for recovery; never regenerate after an uncertain result.",
    ),
    message: z.string().min(1).max(1024).describe(
        "Public Backbar text. The server normalizes whitespace and enforces the drink's grapheme limit. Do not include secrets or personal identifiers.",
    ),
    message_kind: z.enum([
        "observation",
        "tip",
        "warning",
        "clue",
        "question",
        "answer",
    ]),
    agent_alias: z.string().max(32).optional().describe(
        "Optional public agent alias.",
    ),
}).strict();

export const zOrderPath = z.object({
    nonce: z.string().uuid().describe(
        "The original order_nonce UUID. This read never creates or charges an order.",
    ),
}).strict();
