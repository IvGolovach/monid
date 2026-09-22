# Tasks: add-connector-theagentbar

- [x] Read upstream authoring, authentication, usage, lifecycle, identity, and CI contracts.
- [x] Verify existing public menu and receipt behavior against the vendor.
- [x] Define four native paid operations and three free read operations.
- [x] Mirror the partner API input contract; keep service credentials out of agent input.
- [x] Bind purchases to the host run ID and guard run, price, currency, drink, and fulfillment before billing.
- [x] Document idempotency, free recovery, public content trust, and wallet/vendor settlement boundaries.
- [x] Add seven endpoint identities and the agent-entertainment category.
- [x] Add minimal synthetic paid fixtures and compiled sealed-unit tests.
- [x] Run type checks, lint, changed-file formatting, the full offline suite, and frozen deterministic compilation.
- [x] Re-run the identity guard and compare its failures with the untouched upstream baseline.
- [x] Exercise all four compiled purchase operations against the isolated local vendor Worker/D1 implementation.
- [ ] Deploy and verify partner routes and API documentation in the vendor staging/production environments.
- [ ] Agree service credential delivery, vendor settlement, fees, refunds, and reconciliation with Monid.
- [ ] Verify hosted Monid run persistence, exactly-once wallet settlement, and lost-response recovery.
- [ ] Complete a separately authorized live purchase and reconciliation before production activation.

## Observed local validation

Deno 2.9.7: `deno task check`, `deno lint`, and changed-file formatting passed.
`deno task test`: **1158 passed, 0 failed, 200 ignored** (credential-gated live tests).
The connector contributes 17 tests across public reads, native billing, malformed
successes, upstream errors, auth boundaries, recovery, and strict input validation.
Two forced compilations with frozen metadata were byte-identical.

A separate local vendor implementation passed its full `pnpm check` (171 unit
checks and 46 D1 integration cases, including 15 Monid cases). An additional
contract-price consistency test passed, with type checking, after the OpenAPI
contract was added. These vendor tests are outside this repository and are not
remote CI evidence for this contribution.

A loopback-only transport connected the compiled sealed units to the local
vendor Worker/D1: all four prices returned HTTP 200, exact same-run replays
returned the same result, different-run nonce reuse returned uncharged HTTP 409,
and free recovery returned the original result. The database contained exactly
four orders, four receipts, four Backbar posts, and four charges totaling 3800
synthetic cents. No real order, wallet debit, or payout was performed by this test.

## Upstream baseline exceptions

At `30422c2b3f9ca1939a2c12e0a00949eee94c7812`, `deno task ids:check` already
reports 66 compiled endpoint IDs missing from the lock and 7 stale locked IDs.
The untouched upstream checkout reproduces the identical errors. This
contribution adds only its seven IDs; unrelated provider identities are unchanged.

Whole-repository `deno fmt --check` also fails on pre-existing differences in
`.github/workflows/ci.yml` and `.github/workflows/publish-catalog.yml`, reproduced
on that untouched checkout. Formatting of all changed connector/catalog files
passes. These checks are documented as failures, not passing checks.
