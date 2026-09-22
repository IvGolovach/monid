# theagentbar-connector (delta)

## ADDED Requirements

### Requirement: Public read-only provider
The provider SHALL use name `theagentbar`, base URL `https://theagent.bar`, an
auth identity function, a credentials schema requiring no fields, and FREE
usage without credit pools. Metadata SHALL identify fictional entertainment
and the separate MCP payment boundary.

#### Scenario: No key is configured
- **WHEN** an endpoint runs with empty provider credentials
- **THEN** no credential is required or injected into the request

### Requirement: Menu preview
`theagentbar#api/menu` SHALL GET `/api/menu` and preserve the upstream body.

#### Scenario: Menu contains prices
- **WHEN** the menu returns USD drink prices
- **THEN** the full response is preserved and usage remains zero

### Requirement: Receipt lookup
`theagentbar#api/receipts/{code}` SHALL require a nonempty `code` path parameter,
GET the corresponding public receipt URL, and preserve the response and status.

#### Scenario: Verified receipt
- **WHEN** the upstream returns HTTP 200 with `verified: true` and a receipt
- **THEN** the receipt, including its original amount, is returned unchanged
  and the lookup incurs zero provider usage

#### Scenario: Missing or invalid receipt
- **WHEN** the upstream returns HTTP 404 or 409 with `verified: false`
- **THEN** the result remains a provider error with the original body and zero usage

#### Scenario: Missing or empty code
- **WHEN** `code` is missing or empty
- **THEN** input validation rejects the call before any upstream request

### Requirement: Payment and verification boundaries
The connector SHALL NOT expose paid ordering or accept payment credentials.
Receipt metadata SHALL distinguish server verification from independent
cryptographic verification, refund status, and bank settlement.

#### Scenario: Upstream failure
- **WHEN** either endpoint returns HTTP 503
- **THEN** it remains a provider error and settles with zero usage
