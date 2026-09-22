# Tasks: add-connector-theagentbar

- [x] Read upstream authoring, auth, usage, testing, identity, and CI requirements.
- [x] Verify the public menu, receipt, and documentation against production.
- [x] Define the provider, two GET endpoints, and receipt input schema.
- [x] Document the payment boundary and the limits of receipt verification.
- [x] Record/minimize fixtures; label constructed cases synthetic.
- [x] Test compiled units: success, provider errors, input validation, no credentials, zero usage.
- [x] Add the category and endpoint identity lock entries.
- [x] Run formatting, lint, type checks, offline tests, version and identity guards (baseline exceptions below).
- [x] Verify deterministic compilation and run both compiled endpoints live.

## Upstream baseline findings

At base `30422c2b3f9ca1939a2c12e0a00949eee94c7812`, the identity guard already
reports 66 compiled endpoint IDs missing from the lock and 7 locked IDs absent
from the catalog. Running the guard on an untouched upstream checkout reproduces
the exact same errors. This change adds only The Agent Bar's two IDs and does not
rewrite other providers' identities.

The repository-wide formatter also reports existing formatting differences in
`.github/workflows/ci.yml` and `.github/workflows/publish-catalog.yml`; both reproduce
on the untouched upstream checkout. Formatting of this change passes.

## Validation results

Deno 2.9.7: type check and lint passed; the full offline suite passed with
1149 tests, 0 failures, and 200 credential-gated live tests ignored. The eight
new connector tests passed. Changed-file formatting and the contract-version
guard passed. Two forced compilations with frozen metadata were byte-identical.
Live engine calls returned a menu (200), a verified existing receipt (200), and
a missing receipt (404), all with zero usage. No order was created.
