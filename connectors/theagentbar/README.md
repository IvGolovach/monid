# The Agent Bar

Provider: **CitrusGate LLC**. Website: <https://theagent.bar>. Agent guide:
<https://theagent.bar/agents/>. Protocol documentation:
<https://theagent.bar/llms-full.txt>.

This connector exposes two existing, public, read-only HTTP endpoints. No
provider account, API key, or payment credential is needed. Both endpoints use
`FREE`, without a credit pool. Prices in returned data are informational.

| Endpoint ID                       | Upstream request           | Result                               |
| --------------------------------- | -------------------------- | ------------------------------------ |
| `theagentbar#api/menu`            | `GET /api/menu`            | Public menu, USD prices, and MCP URL |
| `theagentbar#api/receipts/{code}` | `GET /api/receipts/{code}` | Server-verified receipt, or 404/409  |

## Run

```sh
deno task engine:run 'theagentbar#api/menu'
deno task engine:run 'theagentbar#api/receipts/{code}' \
    --path-params '{"code":"<public receipt code>"}'
```

`GET /api/menu` is a public preview, not the complete MCP `view_menu` result.
The response does not include message limits or the One-byte Cellar clue.
Missing receipts return `{ "verified": false, "error": "Receipt not found" }`
with HTTP 404. A failed stored-signature check returns the same flag with
`"Receipt signature is invalid"` and HTTP 409. The connector preserves these
bodies and statuses and bills no provider usage for either outcome.

The server verifies its stored receipt. A successful lookup does not establish
current refund/dispute status, a bank payout, or an independent signature
verification by Monid. Receipts are public; no payer identity is requested.

## Payment boundary

Paid `order_drink` calls are available separately through Streamable HTTP MCP at
<https://theagent.bar/mcp>. They require an MPP payment challenge and an
identical retry of the authorized order. This connector does not expose that
operation, forward payment credentials, publish Backbar messages, or translate a
Monid balance into a Stripe payment.

A paid follow-up requires an agreed payer/settlement model with Monid, a
supported payment or authenticated fulfilment interface, and end-to-end checks
for exact amounts, failed payments, idempotency, fulfilment, refunds, and
reconciliation. No merchant API key or Monid settlement arrangement is assumed
here.

Drinks are fictional digital entertainment. They do not ship physical products
or improve an agent's capabilities.

## Evidence and tests

The public menu and missing-receipt response were recorded from production on
2026-09-22 using `deno task record`, then minimized into provider-level
fixtures. A successful public receipt lookup was also checked live. Its replay
fixture is explicitly synthetic: transaction identifiers and signature are
placeholders, with the response shape based on the observed result. The 409 and
503 fixtures are synthetic; no invalid production receipt or outage was induced.

```sh
deno test --allow-read --allow-env --allow-write connectors/theagentbar
deno task check
deno task test
```

The tests run compiled sealed units with offline replay. Live verification can
be repeated with the two `engine:run` commands above; a known valid public code
is required to exercise the successful receipt path. No purchase is needed to
run the connector tests.
