# Rack Ready

A browser training ground for a **Data Center Infrastructure Delivery Manager** technical interview.

**Play: https://marcusperdue.github.io/network-studying/**

## Training modes

- **Quick-fire quiz:** 144 questions across 11 domains, practice and timed challenge modes, difficulty/topic filters, weak-topic rounds, explanations, memory hooks, and missed-question retries.
- **Memory deck:** active recall with self-rated review intervals, due/new/all decks, and saved review schedules.
- **Incident room:** multi-step operational scenarios that reward safety, scope, evidence, coordination, verification, and documentation.
- **Linux lab:** a simulated terminal for investigating links, addresses, routes, DNS, sockets, services, logs, disk use, and permissions. Commands do not execute on your computer.
- **Interview rehearsal:** definition, troubleshooting, management, and truthful STAR practice with two follow-up questions, answer drafts, optional timer, coaching, and a five-dimension self-assessment rubric.
- **Field guide and progress:** searchable explanations and primary references, domain coverage, practice accuracy, XP, milestones, streaks, and backup export/import.

Responsive layouts support phones and iPads in portrait and landscape. Navigation becomes a drawer on narrow screens, touch controls have larger targets, and command/text inputs stay at a readable size. Tested in Chromium with phone/tablet viewports and touch emulation; physical-device Safari testing is not included.

## Study approach

Start with a 10-question mixed round. Review its explanations, practice the weaker topics, complete one Linux mission, then answer an interview prompt out loud. Return to your due flashcards regularly. Use real examples from your work and explain your personal actions and measurable outcomes.

The content follows the supplied study outline. It is independent practice, not an official Amazon/AWS interview packet, exact interview prediction, or hiring-readiness score. Site-specific safety procedures and equipment specifications take precedence. Public reference links are included in the field guide.

## Run locally

No build step, account, API key, or application dependency is required. Open `index.html` or run:

```sh
node serve.cjs
```

Visit `http://localhost:4173`. The runtime uses plain HTML, CSS, and JavaScript. All asset paths are relative, so it works under a GitHub Pages repository path. Web fonts have system-font fallbacks.

## GitHub Pages

The repository publishes the root of `main` through GitHub Pages. In **Settings → Pages**, use **Deploy from a branch**, branch **main**, folder **/(root)**. `.nojekyll` serves the static files directly. Subsequent pushes update the site.

## Saved data and privacy

Progress is saved under `rackready.v1` in browser local storage. Nothing is sent to an application server. Progress is device/browser specific and can be cleared by browser settings. The progress export/import covers quiz records, flashcard scheduling, XP, sessions, and milestones. Interview answer drafts are saved separately and are not included in that backup. Do not enter confidential employer/customer information. External reference links and optional Google Fonts use their respective public services.

## Checks

```sh
node --test tests/content.test.cjs
```

The browser integration test requires Playwright installed in a development environment:

```sh
node tests/browser.test.cjs
```

Set `PLAYWRIGHT_MODULE` to an installed Playwright module directory and `BROWSER_PATH` to a Chromium executable if they are outside default locations. Tests use a fresh isolated browser context, exercise actual UI flows, and save screenshots to the ignored `test-results/` directory.

## Content and architecture

`data.js` holds the question bank and references. `app.js` manages navigation, quizzes, flashcards, progress, and the field guide. `linux.js` and `scenarios.js` expose mounted training modules. Each module has a companion stylesheet. Progress and draft data stay in the browser; there is no live shell or AI evaluator.
