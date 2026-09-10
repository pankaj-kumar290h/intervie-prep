# 8. Accessibility (a11y)

Covers: overview · keyboard · screen readers · focus management · color contrast ·
tools · how to fix

---

## 8.1 Overview

- ~15–20% of people have a disability: visual (blind, low‑vision, color‑blind), motor
  (keyboard‑only, switch, voice), auditory, cognitive. Also situational/temporary
  (bright sun, broken arm, noisy room).
- **WCAG 2.2** is the standard. Levels **A / AA / AAA** — target **AA**. Legal drivers:
  ADA, Section 508 (US), EN 301 549 / **European Accessibility Act** (2025), AODA.
- **POUR principles**:
  - **Perceivable** – text alternatives, captions, contrast, don't rely on color alone.
  - **Operable** – keyboard accessible, enough time, no seizure triggers, navigable,
    target size (2.2).
  - **Understandable** – readable, predictable, input assistance / error messages.
  - **Robust** – valid markup, name/role/value, works with assistive tech.
- **Semantic HTML first** — a `<button>` beats `<div onclick>` for free (focusable,
  keyboard, role, state). Reach for ARIA only when no native element fits.
- **First rule of ARIA: don't use ARIA** if a native element works. Bad ARIA is worse
  than none.
- **The accessibility tree**: browser derives it from the DOM (roles, names, states,
  properties); screen readers + automation read this, not the visual render.

---

## 8.2 Keyboard Accessibility

- Everything interactive must be usable with keyboard alone: **Tab / Shift+Tab** to move,
  **Enter / Space** to activate (Space for buttons/checkboxes, Enter for links),
  **arrows** within composite widgets (menus, tabs, radio groups, listbox, grid),
  **Esc** to dismiss, **Home/End**.
- **Focus order** follows DOM order — keep DOM order logical; avoid positive `tabindex`.
  - `tabindex="0"` – add to natural tab order (custom controls).
  - `tabindex="-1"` – focusable via script only (`.focus()`), not via Tab.
- **Visible focus indicator** — never `outline: none` without a replacement. Use
  `:focus-visible` to show it for keyboard, not mouse.
- **No keyboard traps** (except intentional modal focus trap, which must release on close).
- **Skip link** ("Skip to main content") as the first focusable element.
- **Roving tabindex** or `aria-activedescendant` for composite widgets (only one stop
  for the whole group).
- Custom widgets: follow the **ARIA Authoring Practices Guide (APG)** patterns exactly —
  they specify the keyboard interaction for combobox, dialog, tabs, tree, menu, etc.
- Don't hijack browser shortcuts; make custom shortcuts remappable/disable‑able.

---

## 8.3 Screen Readers

- **NVDA** (Windows, free), **JAWS** (Windows, paid, common in enterprise), **VoiceOver**
  (macOS/iOS, built‑in), **TalkBack** (Android), Narrator, Orca. Test with at least
  NVDA + VoiceOver.
- SR users navigate by **headings** (`h1`–`h6`, one logical outline), **landmarks**
  (`<nav> <main> <header> <footer> <aside>` / roles), **links list**, **form controls**,
  **tables**, **regions**.
- **Accessible name** comes from (priority): `aria-labelledby` → `aria-label` →
  native (`<label for>`, `alt`, `<caption>`, text content) → `title`. Every control,
  image, icon‑button, and input needs one.
- **Images**: meaningful → descriptive `alt`; decorative → `alt=""` (empty, not missing);
  complex → longer description nearby.
- **Icon buttons**: `aria-label="Close"`; hide the SVG with `aria-hidden="true"`.
- **`aria-live` regions** announce dynamic changes: `polite` (wait for pause),
  `assertive` (interrupt — errors, urgent). `role="status"` (polite) / `role="alert"`
  (assertive). Region must exist in DOM *before* content changes.
- **`aria-hidden="true"`** removes from a11y tree (visual‑only decor); never on focusable
  content.
- **State/props**: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-current`,
  `aria-disabled`, `aria-pressed`, `aria-describedby` (hint/error), `aria-invalid`,
  `aria-controls`, `aria-modal`.
- **SPA route changes**: move focus to the new page's `<h1>` (or a container) and/or
  announce via a live region — otherwise SR users don't know the page changed.
- Visually‑hidden utility class (`.sr-only`) for text that should be spoken but not seen
  (don't use `display:none` / `visibility:hidden` — those hide from SR too).

---

## 8.4 Focus Management

- **Modals / dialogs**: on open → move focus into the dialog (first field or the dialog
  itself), **trap focus** within it, `aria-modal="true"` + `role="dialog"` +
  `aria-labelledby`, background inert (`inert` attribute or `aria-hidden` on siblings),
  **Esc closes**, on close → **return focus to the trigger element**. Prefer native
  `<dialog>` element (`showModal()`).
- **Route changes** (SPA): programmatically focus the main heading/region after
  navigation; consider `scrollTo(0,0)`.
- **Disclosure / accordion / menu**: focus stays sensible; on close move focus back to
  the toggle if the focused element disappears.
- **After deleting an item** in a list: move focus to the next item (or previous, or the
  list container) — don't drop focus to `<body>`.
- **Newly revealed content**: move or send focus to it if it's the point of the action.
- **Async / loading**: don't steal focus unexpectedly; announce completion via live
  region.
- **`inert`** attribute – makes a subtree non‑focusable + non‑clickable + hidden from AT
  (great for off‑canvas nav, background behind modal).
- Save/restore focus utilities; libraries: `focus-trap`, Radix/Headless UI/React Aria
  handle this correctly — prefer them over hand‑rolling.

---

## 8.5 Color & Contrast

- **WCAG AA contrast ratios**:
  - Normal text: **4.5:1**
  - Large text (≥ 18.66px bold or ≥ 24px): **3:1**
  - **Non‑text** (UI components, icons, focus indicators, graph elements): **3:1**
  - AAA: 7:1 / 4.5:1.
- **Don't convey information by color alone** — add text, icon, pattern, underline (links
  in body text need a non‑color signal or 3:1 vs surrounding text + hover/focus cue).
- Consider **color blindness** (~8% of men): red/green (deuteranopia/protanopia),
  blue/yellow (tritanopia). Test with simulators.
- **Dark mode**: re‑check contrast; avoid pure‑black/pure‑white (halation) — use
  off‑black/off‑white; don't just invert.
- Respect **`prefers-reduced-motion`** (disable parallax/large animation), also
  `prefers-contrast`, `prefers-color-scheme`, `forced-colors` (Windows High Contrast —
  don't break it; use `system colors`, avoid `background-image` for essential info).
- **Focus indicator** must itself meet 3:1 against both the component and the background.

---

## 8.6 Accessibility Tools

- **Automated (catch ~30–40%)**:
  - **axe‑core** → axe DevTools extension, `@axe-core/react`, `jest-axe`,
    `@axe-core/playwright`, Cypress‑axe.
  - **Lighthouse** a11y audit, **WAVE**, **ARC Toolkit**, **IBM Equal Access**,
    **Pa11y** (CI), **Accessibility Insights** (incl. guided "Assessment" + "FastPass"
    + tab‑stop visualizer).
  - ESLint: `eslint-plugin-jsx-a11y`.
  - Storybook a11y addon.
- **Manual (the other 60%)**:
  - **Keyboard‑only** pass (unplug the mouse).
  - **Screen reader** pass (NVDA/VoiceOver).
  - **Zoom to 200% / 400%**, reflow at 320px CSS width, text spacing overrides.
  - **Browser DevTools**: accessibility tree inspector, contrast checker in color
    picker, "Emulate vision deficiencies", "Emulate `prefers-reduced-motion`",
    Full‑page a11y snapshot.
  - Contrast: WebAIM Contrast Checker, Stark, Polypane, Colour Contrast Analyser.
- **CI gating**: run axe on key pages/components; fail PR on new violations; track a
  score over time.

---

## 8.7 How to Fix Accessibility

### Prioritize by impact

1. **Blockers** – can't complete a core task with keyboard/SR (unlabeled critical
   control, keyboard trap, inaccessible checkout button, missing form labels).
2. **Serious** – major friction (poor focus management in modals, missing headings/
   landmarks, low contrast on primary content, no error announcements).
3. **Moderate / minor** – redundant ARIA, minor contrast on secondary text, missing
   `lang`, decorative `alt`.

### Common fixes

| Problem | Fix |
|---|---|
| `<div onClick>` control | use `<button>` (or add `role`, `tabindex="0"`, key handlers) |
| Icon button silent | `aria-label`, `aria-hidden` on the icon |
| Input not labeled | `<label for>` / wrap, or `aria-labelledby`; placeholder ≠ label |
| No focus outline | remove `outline:none`; add `:focus-visible` style ≥ 3:1 |
| Modal doesn't trap / return focus | focus in on open, trap, Esc, restore on close, `inert` background |
| Low contrast | adjust tokens; verify 4.5:1 / 3:1; fix in the design system, not per‑page |
| Color‑only status | add icon + text label |
| Dynamic content silent | `aria-live` / `role="status"` region present before update |
| SPA nav not announced | focus `<h1>` / announce route change |
| Images no alt | descriptive `alt`, or `alt=""` if decorative |
| Heading levels skip | logical `h1→h2→h3`, one `h1` |
| Custom widget wrong keys | follow ARIA APG pattern; or adopt Radix/React Aria/Headless UI |
| Non‑semantic layout | add landmarks (`<main> <nav> <header> <footer>`) + skip link |

### Process

- **Shift left**: a11y acceptance criteria on every story, accessible component library
  (Radix, React Aria, MUI, Chakra) as the foundation, design tokens that pass contrast,
  Figma annotations for reading order / focus order / alt text.
- Lint + axe in CI, manual audit each release, periodic full audit (internal or
  third‑party like Deque/TPGi), **VPAT/ACR** for enterprise sales, user testing with
  people who use AT.
- Fix root causes in shared components — one fix propagates.
- Document patterns; train the team; assign an a11y owner/champion.
