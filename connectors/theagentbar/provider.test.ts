import { assertEquals } from "@std/assert";
import { directTransport, Engine } from "@monid/connector-engine";
import { testBundle, testSealedUnit } from "@shared/testing";

Deno.test("theagentbar: exposes only two read-only, free endpoints", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("theagentbar#")
    ).sort();
    assertEquals(ids, [
        "theagentbar#api/menu",
        "theagentbar#api/receipts/{code}",
    ]);
    for (const id of ids) {
        const unit = await testSealedUnit(id);
        assertEquals(unit.doc.request.method, "GET");
        assertEquals(unit.doc.auth.credentials.required ?? [], []);
        assertEquals(unit.doc.auth.credentials.properties, {});
    }
});

Deno.test("theagentbar: runs with empty credentials and never forwards unused secrets", async () => {
    const unit = await testSealedUnit("theagentbar#api/menu");
    const credentials: Record<string, string>[] = [{}, {
        apiKey: "unused-test-placeholder",
    }];
    for (const params of credentials) {
        let calls = 0;
        const engine = new Engine({
            transport: directTransport({
                params: () => Promise.resolve(params),
                fetch: (url, init) => {
                    calls++;
                    assertEquals(String(url), "https://theagent.bar/api/menu");
                    assertEquals(init?.method, "GET");
                    assertEquals(
                        Object.fromEntries(new Headers(init?.headers)),
                        {},
                    );
                    assertEquals(init?.body, undefined);
                    return Promise.resolve(Response.json({ menu: [] }));
                },
            }),
        });
        const loaded = await engine.load(unit);
        const result = await loaded.run({});
        assertEquals(result.httpStatus, 200);
        assertEquals(result.usage, { credits: {}, evidence: {} });
        assertEquals(calls, 1);
    }
});
