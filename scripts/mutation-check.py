"""Break each rule on purpose and confirm the test suite fails. A surviving mutation is a test gap.

Usage: python3 scripts/mutation-check.py
"""
import os
import re
import subprocess
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUTATIONS = [
    ("Summary minimum length ignored", "src/rules/index.ts", "const MIN_SUMMARY_WORDS = 8;", "const MIN_SUMMARY_WORDS = 1;"),
    ("Unresolved questions no longer block", "src/rules/index.ts", ".filter((item) => !item.checked)", ".filter((item) => item.checked)"),
    ("UI rules apply to every ticket type", "src/rules/index.ts", "if (t.type !== 'ui') return [];\n    const text", "const text"),
    ("Design link no longer required", "src/rules/index.ts", "return URL.test(sectionText(t.sections.get('design')))", "return true"),
    ("Vague words no longer flagged", "src/rules/index.ts", "VAGUE_TERMS.filter((term) => mentions(text, term))", "[]"),
    ("Given/When/Then always accepted", "src/rules/index.ts", ".filter((item) => !GIVEN_WHEN_THEN.test(item.text))", ".filter(() => false)"),
    ("Word-boundary check removed", "src/rules/index.ts", "`\\\\b${word.replace(/[-]/g, '\\\\-')}\\\\b`", "word.replace(/[-]/g, '\\\\-')"),
    ("Line numbers off by one", "src/parse.ts", "const line = index + 1;", "const line = index;"),
    ("Type matching ignores declared type", "src/parse.ts", "TYPES.find((t) => t === declared) ?? 'unknown'", "'unknown'"),
    ("Checked boxes not detected", "src/parse.ts", "box?.[1]?.toLowerCase() === 'x'", "false"),
    ("Warnings never fail --strict", "src/cli.ts", "if (strict && result.findings.length > 0) result.ready = false;", ""),
    ("Not-ready tickets exit 0", "src/cli.ts", "results.every((r) => r.ready) ? 0 : 1", "0"),
]

caught = stale = 0
for name, rel, old, new in MUTATIONS:
    path = os.path.join(root, rel)
    original = open(path).read()
    if old not in original:
        print(f"STALE (pattern not found): {name}")
        stale += 1
        continue
    open(path, "w").write(original.replace(old, new, 1))
    try:
        run = subprocess.run(["npx", "vitest", "run"], cwd=root, capture_output=True, text=True)
    finally:
        open(path, "w").write(original)
    failed = re.search(r"Tests\s+(\d+) failed", run.stdout + run.stderr)
    if run.returncode != 0:
        caught += 1
        print(f"CAUGHT ({failed.group(1) if failed else '?'} failing)".ljust(28), name)
    else:
        print("SURVIVED  <-- test gap".ljust(28), name)

print(f"\n{caught}/{len(MUTATIONS)} mutations caught")
sys.exit(0 if caught == len(MUTATIONS) and stale == 0 else 1)
