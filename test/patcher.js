var assert = require("assert"),
    Patcher = require("../lib/patcher").Patcher,
    fromString = require("../lib/lines").fromString;

var code = [
    "// file comment",
    "exports.foo({",
    "    // some comment",
    "    bar: 42,",
    "    baz: this",
    "});"
];

function loc(sl, sc, el, ec) {
    return {
        start: { line: sl, column: sc },
        end: { line: el, column: ec }
    };
}

exports.testPatcher = function(t) {
    var lines = fromString(code.join("\n")),
        patcher = new Patcher(lines),
        selfLoc = loc(5, 9, 5, 13);

    assert.strictEqual(patcher.get(selfLoc).toString(), "this");

    patcher.replace(selfLoc, "self");

    assert.strictEqual(patcher.get(selfLoc).toString(), "self");

    var got = patcher.get().toString();
    assert.strictEqual(got, code.join("\n").replace("this", "self"));

    // Make sure comments are preserved.
    assert.ok(got.indexOf("// some") >= 0);

    var oyezLoc = loc(2, 12, 6, 1),
        beforeOyez = patcher.get(oyezLoc).toString();
    assert.strictEqual(beforeOyez.indexOf("exports"), -1);
    assert.ok(beforeOyez.indexOf("comment") >= 0);

    patcher.replace(oyezLoc, "oyez");

    assert.strictEqual(patcher.get().toString(), [
        "// file comment",
        "exports.foo(oyez);"
    ].join("\n"));

    // "Reset" the patcher.
    patcher = new Patcher(lines);
    patcher.replace(oyezLoc, "oyez");
    patcher.replace(selfLoc, "self");

    assert.strictEqual(patcher.get().toString(), [
        "// file comment",
        "exports.foo(oyez);"
    ].join("\n"));

    t.finish();
};