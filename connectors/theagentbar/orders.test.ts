import { assertEquals, assertRejects } from "@std/assert";
import { directTransport, Engine } from "@monid/connector-engine";
import { loadFixture, replayFetch, testSealedUnit } from "@shared/testing";
import type { Fixture } from "@shared/testing";
import { fromFileUrl } from "@std/path";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const body = {
    order_nonce: "684895e3-f280-4b76-a646-9e24b59c572b",
    message: "A toast to useful questions.",
    message_kind: "observation",
    agent_alias: "fixture-agent",
};
const run = { runId: "fixture-monid-run" };
const drinks = [
    ["context-window-collins", 0.50],
    ["hallucination-highball", 2.50],
    ["recursive-negroni", 10],
    ["null-pointer-nightcap", 25],
] as const;

async function loaded(slug: string, fixture: Fixture) {
    const unit = await testSealedUnit(
        `theagentbar#api/partners/monid/v1/drinks/${slug}`,
    );
    const replay = replayFetch(fixture, {
        "request.url": unit.doc.request.url,
    });
    const engine = new Engine({
        transport: directTransport({
            params: () =>
                Promise.resolve({ apiKey: "synthetic-restricted-key" }),
            fetch: (url, init) => {
                const headers = new Headers(init?.headers);
                assertEquals(
                    headers.get("authorization"),
                    "Bearer synthetic-restricted-key",
                );
                assertEquals(headers.get("idempotency-key"), run.runId);
                assertEquals(
                    headers.get("x-theagentbar-price-minor"),
                    String(drinks.find((item) => item[0] === slug)![1] * 100),
                );
                assertEquals(JSON.parse(String(init?.body)), body);
                return replay(url, init);
            },
        }),
    });
    return engine.load(unit);
}

for (const [slug, price] of drinks) {
    Deno.test(`theagentbar ${slug}: fixed estimate, authenticated purchase, exact vendor cost`, async () => {
        const fixture = await loadFixture(
            `${fixtures}synthetic-order-fulfilled.json`,
        );
        const output = fixture.calls[0].res.body as Record<string, any>;
        output.receipt.drink = slug;
        output.receipt.amount = price.toFixed(2);
        output.billing.amount_minor = price * 100;
        const endpoint = await loaded(slug, fixture);
        assertEquals(endpoint.estimate({ body }).credits, { default: price });
        const result = await endpoint.start({ body }, run);
        if (result.kind !== "COMPLETED") {
            throw new Error("Expected synchronous completion");
        }
        assertEquals(result.httpStatus, 200);
        assertEquals(result.usage.credits, { default: price });
        assertEquals(result.output, output);
    });
}

for (
    const name of ["synthetic-order-conflict", "synthetic-partner-unavailable"]
) {
    Deno.test(`theagentbar ${name}: preserves vendor error with zero usage`, async () => {
        const fixture = await loadFixture(`${fixtures}${name}.json`);
        const endpoint = await loaded(drinks[0][0], fixture);
        const result = await endpoint.start({ body }, run);
        if (result.kind !== "COMPLETED") throw new Error("Expected completion");
        assertEquals(result.httpStatus, fixture.calls[0].res.status);
        assertEquals(result.usage, { credits: {}, evidence: {} });
        assertEquals(result.output, fixture.calls[0].res.body);
    });
}

Deno.test("theagentbar: malformed success, wrong run, price, or receipt never bills", async () => {
    const variants: Array<(value: Record<string, any>) => void> = [
        (value) => {
            value.status = "pending";
        },
        (value) => {
            value.billing.run_id = "another-run";
        },
        (value) => {
            value.billing.amount_minor = 250;
        },
        (value) => {
            value.receipt.amount = "2.50";
        },
        (value) => {
            value.receipt.paymentMethod = "stripe";
        },
        (value) => {
            delete value.receipt.signature;
        },
        (value) => {
            value.experience.text = "";
        },
    ];
    for (const change of variants) {
        const fixture = await loadFixture(
            `${fixtures}synthetic-order-fulfilled.json`,
        );
        change(fixture.calls[0].res.body as Record<string, any>);
        const endpoint = await loaded(drinks[0][0], fixture);
        const result = await endpoint.start({ body }, run);
        if (result.kind !== "COMPLETED") throw new Error("Expected completion");
        assertEquals(result.httpStatus, 502);
        assertEquals(result.usage, { credits: {}, evidence: {} });
    }
});

Deno.test("theagentbar: invalid input fails before vendor IO", async () => {
    const fixture = await loadFixture(
        `${fixtures}synthetic-order-fulfilled.json`,
    );
    const endpoint = await loaded(drinks[0][0], fixture);
    await assertRejects(() =>
        endpoint.start({ body: { ...body, order_nonce: "invalid" } }, run)
    );
    await assertRejects(() =>
        endpoint.start({ body: { ...body, price: 0 } }, run)
    );
    await assertRejects(() =>
        endpoint.start({ body: { ...body, message_kind: "invalid" } }, run)
    );
});

Deno.test("theagentbar: authenticated order recovery never bills the historical amount", async () => {
    const unit = await testSealedUnit(
        "theagentbar#api/partners/monid/v1/orders/{nonce}",
    );
    const fixture = await loadFixture(
        `${fixtures}synthetic-order-fulfilled.json`,
    );
    const engine = new Engine({
        transport: directTransport({
            params: () =>
                Promise.resolve({ apiKey: "synthetic-restricted-key" }),
            fetch: (url, init) => {
                assertEquals(
                    String(url),
                    `https://theagent.bar/api/partners/monid/v1/orders/${body.order_nonce}`,
                );
                assertEquals(init?.method, "GET");
                assertEquals(
                    new Headers(init?.headers).get("authorization"),
                    "Bearer synthetic-restricted-key",
                );
                return Promise.resolve(
                    Response.json(fixture.calls[0].res.body),
                );
            },
        }),
    });
    const endpoint = await engine.load(unit);
    assertEquals(
        endpoint.estimate({ pathParams: { nonce: body.order_nonce } }),
        { credits: {}, evidence: {} },
    );
    const result = await endpoint.run({
        pathParams: { nonce: body.order_nonce },
    });
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(result.output, fixture.calls[0].res.body);
});
