# Lab 2: Pre vs. Post Usability & Accessibility Testing (`PhdApplications`)

## Learning Objectives

In [lab1-instructions.md](./lab1-instructions.md), you redesigned the **PhD Applications** forms (`Create.cshtml` and `EditStatus.cshtml`) to improve user experience, semantic HTML structure, validation recovery, and WCAG 2.2 AA accessibility.

In this second lab, you will **measure and verify** the impact of your improvements by comparing your untouched **"Pre"** copy against your improved **"Post"** copy using four complementary testing methods:

1. **5-Minute Peer Guerrilla Usability Test** — observing real human friction, completion time, and error rates.
2. **Browser DevTools Inspection** — inspecting the **Accessibility Tree**, running **Lighthouse** audits, and emulating visual impairments and 400% zoom reflow.
3. **Visual Keyboard & Tab-Stop Auditing** — using **Microsoft Accessibility Insights for Web** to map keyboard navigation paths.
4. **Automated Usability & Accessibility Testing with Playwright** — writing repeatable end-to-end tests that interact with your pages using human labels and ARIA roles (`getByLabel`, `getByRole`) and run automated **axe-core** WCAG 2.2 AA scans.

---

## Before You Start: Running "Pre" and "Post" Side-by-Side

In Lab 1, you cloned two separate folders from your fork of `https://github.com/mustbebuilt/PgrStudentManagement-ui-ux`:

- `PgrStudentManagement-ui-ux-pre` — the untouched baseline starter project
- `PgrStudentManagement-ui-ux-post` — your improved project from Lab 1

You can run both copies simultaneously on different local ports so you can test them side-by-side.

### 1. Start the "Pre" Application on Port `5277`

Open a terminal window in your **Pre** folder and run:

```bash
cd PgrStudentManagement-ui-ux-pre
dotnet run --project PgrStudentManagement.Web --urls "http://localhost:5277"
```

Verify you can open `http://localhost:5277/PhdApplications/Create` in your browser.

### 2. Start the "Post" Application on Port `5278`

Open a **second** terminal window in your **Post** folder and run:

```bash
cd PgrStudentManagement-ui-ux-post
dotnet run --project PgrStudentManagement.Web --urls "http://localhost:5278"
```

Verify you can open `http://localhost:5278/PhdApplications/Create` in a second browser tab.

---

## Part 1: 5-Minute Peer "Guerrilla Usability Test"

Automated tools can verify technical accessibility rules, but they cannot tell you whether a human understands what to type or feels overwhelmed by a wall of 19 inputs. Before running any tools, conduct a quick 5-minute observational test with a classmate.

### How to Run the Test

1. Pair up with another student.
2. Ask your partner to complete the **User Scenario** below on the **Pre** version (`http://localhost:5277/PhdApplications/Create`) first, thinking aloud as they go.
3. **Do not give hints** (for example, do not tell them what numbers `FundingType` expects or where to find a Supervisor's GUID). Only step in if they are completely stuck for more than 60 seconds.
4. Repeat the exact same scenario on your **Post** version (`http://localhost:5278/PhdApplications/Create`).

### User Scenario Script

> *"Imagine you are **Alex Morgan** (`alex.morgan@example.ac.uk`, phone `07700 900123`, born `14 May 1999`, from `United Kingdom`, First-Class BSc Honours). You want to apply for a **Part-Time PhD** starting in **October 2027**, funded by a **Studentship**, supervised by **Dr Robin Carter**, researching **'Automated Accessibility Testing in Higher Education Portals'**.*
>
> *1. Start filling out the application and save a draft after entering your personal details.*
> *2. Complete and submit the full application.*
> *3. Finally, act as an Admissions Tutor and update your application status to **Under Review**."*

### Record Your Observations

| Metric | Pre (`:5277`) | Post (`:5278`) |
|---|---|---|
| **Time to complete task (seconds)** | | |
| **Number of times user asked "What do I put here?"** | | |
| **Number of failed form submissions** | | |
| **Did the user have to leave the page to look up an ID or code?** | | |
| **Was the user able to save partial progress and return?** | | |
| **Subjective Cognitive Load (1 = effortless, 5 = frustrating)** | | |

---

## Part 2: Chrome DevTools — Accessibility Tree, Lighthouse & Vision Emulation

Modern browsers compile the HTML DOM into an **Accessibility Tree** that screen readers (NVDA, VoiceOver, JAWS) actually read. Inspecting this tree directly shows you how assistive technology perceives your form controls.

### 2.1 Inspect the Accessibility Tree

1. Open Chrome or Edge DevTools (`F12` or `Cmd+Opt+I` / `Ctrl+Shift+I`).
2. In the **Elements** panel, open the secondary sidebar (`Computed` / `Layout` / **Accessibility**) and select **Accessibility**, then check **Enable full-page accessibility tree** (or inspect individual inputs).
3. Inspect the **`IsPartTime` (Mode of study)** and **`MainSupervisorId`** controls on both versions and compare what the browser reports:

| Property in Accessibility Tree | Pre (`:5277`) | Post (`:5278`) |
|---|---|---|
| **`IsPartTime` Role** | `textbox` | `radio` inside `group` (`"Mode of study"`) |
| **`MainSupervisorId` Role** | `textbox` | `combobox` with named `<option>` items |
| **`ApplicationReference` Computed Name** | `"ApplicationReference"` (CamelCase) | `"Application reference"` (or auto-generated) |
| **`Description` (`aria-describedby`)** | *(empty)* | Format hint + error message when invalid |
| **`Invalid` state on empty submit** | `false` (silent failure) | `true` (`aria-invalid="true"`) |

### 2.2 Run a Lighthouse Accessibility Audit

1. In Chrome DevTools, open the **Lighthouse** tab.
2. Select **Mode: Navigation**, **Device: Desktop**, and check **Categories: Accessibility**.
3. Run the audit on `http://localhost:5277/PhdApplications/Create` (**Pre**) and `http://localhost:5278/PhdApplications/Create` (**Post**).
4. Also trigger a failed form submission on **Post** and run a **Snapshot** audit in Lighthouse to verify that error states maintain sufficient colour contrast and valid ARIA attributes.

### 2.3 Vision Deficiency Emulation & 400% Reflow (WCAG 1.4.1 & 1.4.10)

1. With a validation error visible on your form, open the DevTools Command Menu (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux) and type **`Show Rendering`**.
2. Scroll down to **Emulate vision deficiencies**:
   - Select **Achromatopsia (no colour)**: Can you still tell which fields are invalid without seeing red? *(Hint: Look for borders, error text, and icons rather than colour alone — WCAG 1.4.1).*
   - Select **Blurred vision**: Are field labels, hint text, and error messages clearly grouped next to their inputs?
3. Reset vision emulation to **No emulation**, set the browser window width to `1280px`, and zoom the page to **400%** (`Cmd/+` or `Ctrl/+`).
   - Verify that all form inputs stack cleanly into a single column without horizontal scrolling or overlapping labels (**WCAG 1.4.10 Reflow**).

---

## Part 3: Visual Keyboard & Tab-Stop Auditing (Accessibility Insights for Web)

One of the clearest ways to see the difference between the **Pre** and **Post** forms is to trace the keyboard `Tab` path visually.

### 3.1 Install Accessibility Insights for Web

1. Install the free **Accessibility Insights for Web** extension for Chrome or Edge (`https://accessibilityinsights.io/downloads/`).
2. Click the extension icon in your browser toolbar and select **FastPass**.

### 3.2 Run Automated Checks

1. Run **FastPass → Automated Checks** on `http://localhost:5277/PhdApplications/Create` and `http://localhost:5278/PhdApplications/Create`.
2. Note any violations flagged directly on the page.

### 3.3 Record Visual Tab Stops

1. In the FastPass window, select **Tab Stops** and toggle **Show tab stops** to **On**.
2. Click the address bar, then press `Tab` repeatedly through the entire `Create` form on **Pre** (`:5277`) and then on **Post** (`:5278`).
3. The tool draws numbered circles (`1`, `2`, `3`…) connected by lines showing the exact focus trajectory. Compare both versions:
   - **Focus visibility**: Is the `:focus-visible` outline clearly visible on every control?
   - **Radio button behaviour**: On **Post**, pressing `Tab` moves into the `<fieldset>` radio group once, and arrow keys switch between choices.
   - **Error recovery**: Submit an empty form on **Post** and press `Tab` once from the Error Summary — does clicking an error link jump keyboard focus directly into the offending input?
4. Take a screenshot of the **Tab Stops** overlay on both **Pre** and **Post** to include in your lab reflection.

---

## Part 4: Automated Usability & Accessibility Testing with Playwright

Why use **Playwright** for UI/UX and accessibility testing?

Playwright encourages writing tests that locate elements the exact same way a human or screen reader user does: by **visible label** (`page.getByLabel('First name')`) and by **semantic role** (`page.getByRole('radio', { name: 'Full-Time (3–4 years)' })`) rather than brittle CSS selectors (`#FirstName`).

Because of this:
- A test written from a **human user's perspective** will naturally **fail** on the poorly designed **Pre** form (where labels are CamelCase property names and every control is a plain text box) and **pass** on your improved **Post** form!
- Combining Playwright with **`@axe-core/playwright`** gives you automated WCAG 2.2 AA auditing across multi-step states and validation error states.

Below you can choose **Option A (Node.js / TypeScript — recommended for Playwright's interactive `--ui` runner)** or **Option B (.NET / C# xUnit)**.

---

### Option A: Playwright with Node.js (Recommended)

#### Step 1: Initialise a Playwright Test Folder

Create a dedicated `ui-ux-tests` folder alongside your `pre` and `post` folders:

```bash
mkdir ui-ux-tests
cd ui-ux-tests
npm init -y
npm install -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

#### Step 2: Create `playwright.config.ts`

Create a file named `playwright.config.ts` in `ui-ux-tests` so you can switch between testing your **Pre** server (`:5277`) and your **Post** server (`:5278`) using an environment variable:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    // Defaults to Post (:5278), or override with BASE_URL=http://localhost:5277
    baseURL: process.env.BASE_URL || 'http://localhost:5278',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});
```

#### Step 3: Create the Pre vs. Post Usability & Accessibility Test Suite

Create `tests/phd-applications-ux.spec.ts` inside `ui-ux-tests`:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('PhD Application Form — UI/UX & Accessibility Suite', () => {

  test('1. Human-Readable Labels: Controls can be found by plain-English labels', async ({ page }) => {
    await page.goto('/PhdApplications/Create');

    // A user (or screen reader) looks for "First name", "Last name", "Email address"
    // PRE FAILS: Labels are raw C# property names ("FirstName", "LastName", "Email")
    // POST PASSES: Labels use human-readable text
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByLabel('Last name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Date of birth')).toBeVisible();
  });

  test('2. Semantic Controls: Constrained choices use radios and dropdowns instead of textboxes', async ({ page }) => {
    await page.goto('/PhdApplications/Create');

    // Navigate to Step 3 if using a progressive multi-step form
    const step3Btn = page.getByRole('button', { name: /3\. Supervision & Funding/i });
    if (await step3Btn.isVisible()) {
      await step3Btn.click();
    }

    // PRE FAILS: IsPartTime and MainSupervisorId are generic role="textbox" inputs
    // POST PASSES: Mode of study is a fieldset radio group and Supervisor is a combobox
    const studyModeGroup = page.getByRole('group', { name: /Mode of study/i });
    await expect(studyModeGroup).toBeVisible();
    await expect(studyModeGroup.getByRole('radio')).toHaveCount(2);

    const supervisorSelect = page.getByRole('combobox', { name: /Proposed main supervisor/i });
    await expect(supervisorSelect).toBeVisible();
    // Should contain real supervisor names rather than requiring a raw GUID
    const optionCount = await supervisorSelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(1);
  });

  test('3. Error Recovery & Keyboard Focus: Empty submit focuses Error Summary and links to invalid fields', async ({ page }) => {
    await page.goto('/PhdApplications/Create');

    // Submit the form empty
    const submitBtn = page.getByRole('button', { name: /Submit application|Create Application/i }).first();
    await submitBtn.click();

    // PRE FAILS: Page reloads silently with no alert, no title change, and no aria-invalid
    // POST PASSES:
    // a) Page <title> is prefixed with "Error:" for screen reader announcement (WCAG 3.3.1)
    await expect(page).toHaveTitle(/^Error:/);

    // b) Error summary banner with role="alert" is visible and receives keyboard focus
    const errorSummary = page.locator('#error-summary[role="alert"]');
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary).toBeFocused();

    // c) Clicking the first error summary link moves keyboard focus directly to the invalid input
    const firstErrorLink = errorSummary.locator('a').first();
    const targetHref = await firstErrorLink.getAttribute('href');
    await firstErrorLink.click();

    if (targetHref) {
      const targetInput = page.locator(targetHref);
      await expect(targetInput).toBeFocused();
      await expect(targetInput).toHaveAttribute('aria-invalid', 'true');
    }
  });

  test('4. Live Feedback & Task-Saving: Character counter updates and Save Draft works with partial data', async ({ page }) => {
    await page.goto('/PhdApplications/Create');

    // Navigate to Step 2 if using multi-step panels
    const step2Btn = page.getByRole('button', { name: /2\. Qualification & Proposal/i });
    if (await step2Btn.isVisible()) {
      await step2Btn.click();
    }

    // Check live character counter on Research Summary
    const summaryField = page.getByLabel(/Research summary/i);
    await summaryField.fill('Exploring automated accessibility testing in academic portals.');
    const counter = page.locator('#ResearchSummary-count');
    await expect(counter).toContainText(/remaining/i);

    // Navigate back to Step 1 if needed, enter minimal details, and Save as Draft
    const step1Btn = page.getByRole('button', { name: /1\. Applicant Details/i });
    if (await step1Btn.isVisible()) {
      await step1Btn.click();
    }

    await page.getByLabel('First name').fill('Alex');
    await page.getByLabel('Last name').fill('Morgan');
    await page.getByLabel('Email address').fill('alex.morgan@example.ac.uk');

    const saveDraftBtn = page.getByRole('button', { name: /Save as draft/i });
    await expect(saveDraftBtn).toBeVisible();
    await saveDraftBtn.click();

    // Should redirect to Details or Index with Draft status saved
    await expect(page).toHaveURL(/\/PhdApplications\/(Details|Index)/);
  });

  test('5. Automated WCAG 2.2 AA Audit (axe-core)', async ({ page }) => {
    await page.goto('/PhdApplications/Create');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

#### Step 4: Run the Tests Against "Pre" vs. "Post"

1. **Run against your untouched "Pre" server (`:5277`)**:

   ```bash
   BASE_URL=http://localhost:5277 npx playwright test
   ```

   Observe how tests 1–4 fail because the starter form lacks human-readable labels, semantic radio/select roles, an error summary, `aria-invalid` attributes, and draft saving.

2. **Run against your improved "Post" server (`:5278`)**:

   ```bash
   BASE_URL=http://localhost:5278 npx playwright test
   ```

   Verify that all 5 tests pass!

3. **Explore interactively with Playwright UI Mode**:

   ```bash
   BASE_URL=http://localhost:5278 npx playwright test --ui
   ```

   In Playwright UI Mode, click through each step on the timeline and inspect the DOM snapshot and accessibility locators at every millisecond of the test.

---

### Option B: Playwright for .NET (C# / xUnit)

If you prefer to write your automated tests in C# alongside the ASP.NET Core project:

#### Step 1: Create an xUnit Test Project

```bash
mkdir PgrStudentManagement.UiTests
cd PgrStudentManagement.UiTests
dotnet new xunit
dotnet add package Microsoft.Playwright
dotnet add package Deque.AxeCore.Playwright
dotnet build
pwsh bin/Debug/net10.0/playwright.ps1 install chromium
```

*(Note: If you do not have PowerShell `pwsh` installed, you can install the Chromium binary via `npx playwright install chromium`.)*

#### Step 2: Add `PhdApplicationUxTests.cs`

Replace `UnitTest1.cs` with `PhdApplicationUxTests.cs`:

```csharp
using Deque.AxeCore.Playwright;
using Microsoft.Playwright;
using Xunit;

namespace PgrStudentManagement.UiTests;

public class PhdApplicationUxTests : IAsyncLifetime
{
    private IPlaywright _playwright = null!;
    private IBrowser _browser = null!;
    private readonly string _baseUrl =
        Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost:5278";

    public async Task InitializeAsync()
    {
        _playwright = await Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true
        });
    }

    public async Task DisposeAsync()
    {
        await _browser.DisposeAsync();
        _playwright.Dispose();
    }

    [Fact]
    public async Task CreateForm_UsesHumanReadableLabelsAndSemanticRoles()
    {
        var page = await _browser.NewPageAsync();
        await page.GotoAsync($"{_baseUrl}/PhdApplications/Create");

        // Verify human-readable labels exist
        Assert.True(await page.GetByLabel("First name").IsVisibleAsync());
        Assert.True(await page.GetByLabel("Last name").IsVisibleAsync());
        Assert.True(await page.GetByLabel("Email address").IsVisibleAsync());

        // Verify WCAG 2.2 AA compliance via AxeCore
        var axeResults = await page.RunAxe();
        Assert.Empty(axeResults.Violations);
    }

    [Fact]
    public async Task EmptySubmit_FocusesErrorSummaryAndMarksFieldsInvalid()
    {
        var page = await _browser.NewPageAsync();
        await page.GotoAsync($"{_baseUrl}/PhdApplications/Create");

        await page.GetByRole(AriaRole.Button, new() { NameRegex = new("Submit application|Create Application") })
            .First.ClickAsync();

        // Title starts with "Error:"
        var title = await page.TitleAsync();
        Assert.StartsWith("Error:", title);

        // Error summary is visible
        var errorSummary = page.Locator("#error-summary[role='alert']");
        Assert.True(await errorSummary.IsVisibleAsync());
    }
}
```

#### Step 3: Run Against "Pre" and "Post"

```bash
# Test against Pre (:5277)
BASE_URL=http://localhost:5277 dotnet test

# Test against Post (:5278)
BASE_URL=http://localhost:5278 dotnet test
```

---

## Part 5: Pre vs. Post Scorecard & Reflection

Complete the summary table below comparing your findings across all four testing approaches:

| Evaluation Dimension | Tool / Method Used | Pre (`:5277`) Result | Post (`:5278`) Result | Key WCAG 2.2 Criterion |
|---|---|---|---|---|
| **Human Task Completion Time** | Part 1: Peer Guerrilla Test | | | — |
| **User Confusion / Lookup Errors** | Part 1: Peer Guerrilla Test | | | **3.3.2** Labels or Instructions |
| **Semantic Control Roles** | Part 2: DevTools Accessibility Tree | | | **1.3.1** Info & Relationships / **4.1.2** Name, Role, Value |
| **400% Zoom Reflow** | Part 2: Browser Zoom (`1280px` @ 400%) | | | **1.4.10** Reflow |
| **Error Identification Without Colour** | Part 2: DevTools Achromatopsia Emulation | | | **1.4.1** Use of Color |
| **Keyboard Tab Path & Radio Grouping** | Part 3: Accessibility Insights Tab Stops | | | **2.1.1** Keyboard / **2.4.7** Focus Visible |
| **Playwright Semantic Locator Tests** | Part 4: Playwright (`getByLabel` / `getByRole`) | | | **2.4.6** Headings & Labels / **3.3.1** Error Identification |
| **Automated WCAG 2.2 AA Violations** | Part 4: `@axe-core/playwright` | | | WCAG 2.2 Level A & AA |

### Reflection Questions

1. **Automated vs. Manual Detection**: Why did Lighthouse and `axe-core` give the **Pre** version a relatively high score despite the form being almost unusable for a human (requiring raw GUIDs and integer enum codes)? What does this tell you about relying solely on automated accessibility scanners?
2. **Playwright Locators as UX Tests**: How did writing Playwright tests with `getByLabel` and `getByRole` expose usability flaws that a CSS selector test (`page.locator('#MainSupervisorId')`) would have missed?
3. **Error Recovery**: How did adding the focusable `#error-summary[role="alert"]`, the `Error:` page `<title>` prefix, and `aria-invalid="true"` change the experience for a keyboard-only or screen-reader user when submitting an incomplete form?

