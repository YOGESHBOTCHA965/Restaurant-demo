---
target: the homepage
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\yoges\\Desktop\\bombay palace 1\\Bombay-Palace-Website\\Bombay-Palace-Website\\dist\\index.html"
target_fingerprint: "sha256:93ae7098f66a68e0b1773a57d38d97f3e7a145b8fc1e0f649083799759bb284c"
target_path: "C:\\Users\\yoges\\Desktop\\bombay palace 1\\Bombay-Palace-Website\\Bombay-Palace-Website\\dist\\index.html"
timestamp: 2026-10-30T21-42-07Z
slug: dist-index-html
closed: true
---
Method: dual-agent (A: 90f66dc4-df17-490d-9827-bbe704613cf8 · B: e774bf85-544c-40bc-ba0b-dfae784e57ee)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Oven note changes silently |
| 2 | Match System / Real World | 3 | "8 dishes in this preview", "Staff editor" leak system language |
| 3 | User Control and Freedom | 3 | Band button scrolls backwards |
| 4 | Consistency and Standards | 2 | Four selected-state styles; Visit vs "Hours and location"; menu photo circle breaks Mouth Rule |
| 5 | Error Prevention | 3 | |
| 6 | Recognition Rather Than Recall | 3 | |
| 7 | Flexibility and Efficiency | n/a | Persuade surface |
| 8 | Aesthetic and Minimalist Design | 2 | Caveats in every section; name set 4 times |
| 9 | Error Recovery | 3 | |
| 10 | Help and Documentation | n/a | Persuade surface |
| Total | | 22/32 | Acceptable |

## Design Specificity Verdict
Hero is authored; past the fold the page becomes a generic premium-restaurant stack. Detector: 4 cramped-padding warnings, all false positives (measured). Overlay: 1 straggler on #spice-text.

## Priority Issues
- [P1] Caveat overload: ~7 notes + 11 asterisks make the page read unfinished. Disclose once. (clarify)
- [P1] Visit section weakest at the decision moment: bottom-aligned right column, empty headings, address outranks heading, "31907" orphan, ~290px dead padding before footer. (layout)
- [P1] Images reused and carelessly cropped: aside circle duplicates hero samosa, off-centre, breaks Mouth Rule; band headline collides with skewers; only plates. (layout)
- [P2] Type hierarchy inverted: footer wordmark largest; hero h1 only 1.4x section heads; category labels weaker than dish names; filter dot indents labels. (typeset)
- [P2] Hard section cuts; band CTA sends visitor backwards. (layout)
- [P3] Name redundancy and generic hero intro. (clarify)

## Detector/browser defects
Touch targets <44 at mobile (filters 38px, text links, copy address, staff editor); #menu-search outline:none; spice body text 10th pct contrast 4.45 over texture; mobile band heading min 2.3; images ~833KB first view, hidden dish images eager, #menu-photo wrong width/height.

## Persona Red Flags
Jordan: caveats read as broken site; "Staff editor" visible. Riley: All/Appetizers share photo; band button scrolls up; tablet/mobile menu has no images. Casey: oven dishes at viewport bottom; filter grid indent; empty visit states.
