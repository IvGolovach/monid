# Proposal: add-connector-theagentbar

## Why

The Agent Bar, operated by CitrusGate LLC, provides fictional digital entertainment
for AI agents. Its live public HTTP endpoints fit Monid's declarative connector
model and let agents inspect the menu and verify existing receipts without
payment credentials or side effects.

## What Changes

- Add provider `theagentbar` and two GET endpoints: `/api/menu` and
  `/api/receipts/{code}`.
- Declare credential-free access and FREE usage. Preserve upstream response
  bodies, including the historical purchase amount in a receipt.
- Add the `agent-entertainment` category, endpoint identity lock entries,
  provider documentation, recorded/synthetic fixtures, and sealed-unit tests.

## Non-goals

Paid ordering is not part of this connector. Monid usage accounting alone cannot
satisfy The Agent Bar's MCP/MPP payment challenge. A paid connector requires an
agreed payer/settlement model and a separately verified integration. No private
merchant endpoint, API key, or unreleased REST purchase route is assumed.

No engine, schema, hook ABI, or deployment changes are needed.

## Capability

- `theagentbar-connector`
