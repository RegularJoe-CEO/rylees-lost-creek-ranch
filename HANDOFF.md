# Ranch adventure update: validation and publication handoff

This branch contains the actual game source and all three artwork assets, not a design mockup.
It is based on main at 6bc8217eb6448d8062e369629ca49451d8b2fd30.

## Status

Implementation is ready for validation. The originating environment blocked the test runner with
"network approval was cancelled before a decision was returned." **No passing test or browser
validation result is claimed.** Do not deploy before completing the checks below.

Main and gh-pages have not been changed by this handoff. An unpublished private Sites project
was registered during development; its non-secret identity is in .openai/hosting.json.
The requested destination remains this existing GitHub repository and its existing game address.
Do not create another repository or replace the family's game URL without asking.

## What changed

- Replaced the primitive character/scenery drawings with illustrated ranch, Grandma, and porch assets.
- Replaced nine fixed questions with generators for seven skills: multiplying by ten, dividing by
  ten, equivalent place-value units, digit value, number forms, comparisons/order, and rounding.
- Shuffles copies of answer choices using Fisher-Yates; the correct answer is not fixed on the left.
- Includes typed numeric answers, retry feedback, a place-value chart, unit trades, and number lines.
- Six-question adventures lead to Grandma's game porch, with a turn-taking matching game and
  a stone-skipping game. The matching game can be played solo or by passing one device.
- The learning journal separates independent answers from supported answers and lets a parent
  choose a tens focus or the next step of comparing, ordering, and rounding.
- Safely migrates old star counts from lcr5/lcr3 into lcr6 on the same browser origin. Saves remain
  device-local. A different game URL/origin cannot read the old URL's storage.
- Does not claim official Bluebonnet lesson pacing or a specific current classroom lesson.

## Validate

No third-party application dependencies are needed. Use a current Node.js version.

    npm test
    npm run build
    git diff --check 6bc8217eb6448d8062e369629ca49451d8b2fd30 HEAD

Equivalent direct local commands:

    node --test tests/math.test.js tests/progress.test.js
    node build.js

The test source checks question keys, unique answer choices, answer-position distribution,
typed-answer parsing, reproducibility, recent-question avoidance, progress migration,
corrupt storage, and supported-vs-independent progress.

Perform browser checks on desktop and narrow mobile viewports before publication:

1. Load every trail. Complete an adventure using choices and typed responses.
2. Verify wrong answers give help, hints do not count as independent success, and repeated taps
   cannot award duplicate stars or finish a question twice.
3. Navigate away while a timer is pending; it must not replace the new screen.
4. Unlock the porch, finish a matching round, try solo and family turns, and play stone skipping.
5. Change the focus in the learning journal; reload and verify stars, focus, and history survive.
6. Seed a legacy lcr5 star count and verify it migrates without deleting the original.
7. Confirm all images load, text and controls fit mobile screens, keyboard focus works, and
   touch targets are usable. Check empty/corrupt/blocked storage does not crash the game.
8. Check read-aloud availability and the written fallback.

Fix real failures within this update and rerun the affected checks. Do not weaken the tests.
The automated suite has not yet been executed here, so investigate rather than assuming it passes.

## Publish the existing game

Inspect the repository's GitHub Pages configuration and current deployment workflow first.
Both main and gh-pages exist. Do not assume updating main alone changes GitHub Pages.
The original README also links a raw.githack.com main/index.html address.

Once validation passes, use the repository's normal update/deployment flow, preserving unrelated
files and changes. Publish the generated static assets (dist/) if the configured deployment uses
build output, or the root HTML/CSS/JS/assets if it serves the source directly. Never deploy Git
metadata, credentials, test output, or the private Sites configuration as public application files.

Keep e@ewaller.com as Eric Waller's requested commit email when making follow-up commits.
Do not modify any other repositories or Rust-Bio pull requests.
Return the exact working game URL, final commit, actual test results, and deployment result.
