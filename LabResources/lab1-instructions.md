# Lab 1: Improving the UI/UX and Accessibility of the PhD Applications Forms

## Overview

The **PhD Applications** module (`PgrStudentManagement.Web/Modules/PhdApplications`) works, but its forms have been **deliberately left in a poor state**: the primary submit button has poor colour contrast, field prompts use `<span>` tags instead of `<label>` elements, every field is a plain `<input type="text">`, and all form validation has been removed.

In **Lab 1**, you will redesign the PhD Applications forms on a dedicated Git branch (`ui-ux-improvements`) so they are **easy to use, accessible (WCAG 2.2), and robust**, while keeping your `main` branch untouched as a baseline.
In **Lab 2** ([`lab2-instructions.md`](./lab2-instructions.md)), you will run **usability and automated accessibility tests** (using Playwright, Axe, Accessibility Insights, and Chrome DevTools) against both the `main` branch and your new `ui-ux-improvements` branch to measure the impact of your changes.

---

## Before You Start: Create a Feature Branch

Because **Lab 2** compares the untouched **`main` branch** against your improved branch, you should do all of your Lab 1 work on a new Git branch:

1. Fork the repository on GitHub (if you have not already) and clone it to your machine:
   ```bash
   git clone https://github.com/<your-username>/PgrStudentManagement-ui-ux.git
   cd PgrStudentManagement-ui-ux
   ```
2. Ensure your `main` branch is clean, then create and switch to a new branch named `ui-ux-improvements`:
   ```bash
   git switch -c ui-ux-improvements
   ```
   *(Or `git checkout -b ui-ux-improvements` on older Git versions.)*
3. Push the new branch to your GitHub repository so it tracks your remote branch:
   ```bash
   git push -u origin ui-ux-improvements
   ```

> [!IMPORTANT]
> **How to use this Lab 1 guide:**
> - Make and commit all of your Lab 1 changes on the **`ui-ux-improvements`** branch, leaving **`main`** untouched for comparison in [Lab 2](./lab2-instructions.md).
> - Every file you need to edit already has **`TODO (Lab Part X)` comments** marking the exact spots to change.
> - Helper methods (`GetEligibleMainSupervisorsAsync`, `GenerateNextApplicationReferenceAsync`, and `GetAllowedTransitions`) are **already built for you** inside [`PhdApplicationService.cs`](../PgrStudentManagement.Web/Modules/PhdApplications/Services/PhdApplicationService.cs).
> - Companion file [**`code-snippets.md`**](./code-snippets.md) contains **complete, copy-and-adapt code snippets** for every step below.

### Learning outcomes

By the end of Lab 1 you should be able to:

1. Fix **WCAG 2.2 AA colour contrast** (`4.5:1` minimum under Criterion 1.4.3) using centralized CSS custom properties (`:root` variables in `wwwroot/css/site.css`) and associate form controls programmatically using `<label asp-for="...">` (WCAG 1.3.1 & 4.1.2).
2. **Minimise user input and prevent errors** by separating form models (ViewModels) from database entities, auto-generating system fields on the server, and providing post-redirect confirmation feedback using `TempData` and `role="status"` (WCAG 4.1.3 Status Messages).
3. Replace plain text boxes with constrained, semantic HTML controls (`email`, `date`, `<select>`, `<textarea>`, radio `<fieldset>`s) that support recognition over recall.
4. Add clear human-readable display names, hint text (`aria-describedby`), groupings (`<fieldset>`/`<legend>`), and live character counts (`aria-live="polite"`) to communicate expectations upfront.
5. Add server-side validation and display errors accessibly (focusable error summary + inline field errors with `aria-invalid="true"`).
6. Use native HTML5 client-side constraint validation (`required`, `maxlength`, `type="email"`, `type="date"`).
7. *(Optional Stretch Goal)* Split a long form into navigable sections with a **Save as draft and return later** feature.

### Files you will work with

| File | What you will do | Matching Snippets |
| :--- | :--- | :--- |
| `wwwroot/css/site.css` | Fix the non-WCAG-compliant colour contrast on `.btn-primary` (`Create` button) via `:root` CSS custom properties | [Snippet 1.A](./code-snippets.md#snippet-1a-fix-primary-button-colour-contrast-in-wwwrootcsssitecss) |
| `Views/PhdApplications/Create.cshtml` | Replace `<span>` tags with `<label asp-for="...">`, replace `type="text"` inputs with semantic controls, add hints, error summary, and (optionally) step sections | [Snippet 1.B](./code-snippets.md#snippet-1b-replace-span-prompts-with-semantic-label-asp-for-elements-in-createcshtml), [Snippets 3.A–3.D](./code-snippets.md#part-3--appropriate-html-input-types--controls), [4.A–4.B](./code-snippets.md#part-4--labels-hints-aria-describedby--live-character-counter), [6.A–6.B](./code-snippets.md#part-6--accessible-error-summary--inline-error-messages), [7.A](./code-snippets.md#part-7--client-side-validation-native-html5-constraints), [8.D–8.E](./code-snippets.md#part-8-optional-stretch-goal--sectioned-form-with-save-and-return-later) |
| `Modules/PhdApplications/Models/CreatePhdApplicationViewModel.cs` | *(New file)* Form view model with display & validation attributes | [Snippet 2.A](./code-snippets.md#snippet-2a-create-createphdapplicationviewmodelcs), [Snippet 5.A](./code-snippets.md#snippet-5a-createphdapplicationviewmodelcs-with-validation--display-attributes) |
| `Modules/PhdApplications/Controllers/PhdApplicationsController.cs` | Bind to the view model, load dropdown data, set `TempData["SuccessMessage"]` for user feedback, and (optionally) handle Draft vs Submit | [Snippet 2.B](./code-snippets.md#snippet-2b-update-phdapplicationscontrollercreate-get--post), [Snippet 8.D](./code-snippets.md#snippet-8d-dual-submit-buttons-submit-vs-save-and-return-later), [Snippet 9.A](./code-snippets.md#snippet-9a-controller--view-for-allowed-status-transitions) |
| `Views/PhdApplications/Details.cshtml` | Render the `TempData["SuccessMessage"]` confirmation banner (`role="status"`) after creating an application or updating its status | [Snippet 2.C](./code-snippets.md#snippet-2c-display-tempdatasuccessmessage-banner-in-detailscshtml) |
| `Views/PhdApplications/EditStatus.cshtml` | Replace free-text status with radio buttons for valid transitions | [Snippet 9.A](./code-snippets.md#snippet-9a-controller--view-for-allowed-status-transitions) |
| `Views/PhdApplications/Index.cshtml` | *(Optional)* Add table `<caption>`, `scope="col"`, status filter, and screen-reader context | [Snippet 10.A](./code-snippets.md#snippet-10a-accessible-table-with-caption-scopecol-filter-and-context-links) |
| `wwwroot/js/site.js` | Vanilla JS helpers for live character count and progressive multi-step sections | [Snippet 4.B](./code-snippets.md#snippet-4b-accessible-live-character-counter-aria-livepolite), [Snippet 8.E](./code-snippets.md#snippet-8e-optional-stretch-goal-multi-step-wizard-tabs--sections-with-fieldset-panels) |

Run the app with (no external database server required—SQLite and static JSON data run out of the box):
```bash
dotnet watch --project PgrStudentManagement.Web
```
Then open **PhD Applications** in the top navigation bar (or click **New PhD Application** on the home dashboard).

---

## Part 0 – Inspect the Starting Point (5–10 mins)

**Goal:** Build the habit of inspecting a live interface critically for visual, semantic, and workflow barriers before writing code.

Open `/PhdApplications/Create` and `/PhdApplications/EditStatus` in your browser and look for these 12 deliberate flaws:

| # | Flaw in the starter code | Where |
| :--- | :--- | :--- |
| 1 | **Low colour contrast on the `Create` button**: white text (`#ffffff`) on a light sky-blue background (`#7cb8eb`) gives a contrast ratio of only **`2.12:1`**, failing WCAG 2.2 AA (`4.5:1` minimum) | `wwwroot/css/site.css` (`.btn-primary`) |
| 2 | **Missing `<label>` tags**: field prompts are plain `<span class="form-label">` tags with no `for` attribute—clicking a prompt does not focus its input, and screen readers announce every input as unlabelled | `Create.cshtml` |
| 3 | Every field is `<input type="text">` (even dates, emails, enums, and the 2,000-character research summary) | `Create.cshtml`, `EditStatus.cshtml` |
| 4 | Prompts show raw C# property names (`ApplicationReference`, `ProposedSupervisorStaffNumber`) | `Create.cshtml` |
| 5 | No hint text explaining expected date formats or funding options | Both forms |
| 6 | Users are forced to invent **system-owned data**: `ApplicationReference`, `SubmittedDate`, and a supervisor's **staff number** (`AS1001`) | `Create.cshtml` |
| 7 | **Silent failures & missing confirmation feedback**: if binding fails (e.g. typing `"Offer made"` with a space), the page reloads with zero error messages, and successful redirects show no `TempData` confirmation banner | Both forms & `Details.cshtml` |
| 8 | Optional fields (`ResearchSummary`, `ProposedSupervisorStaffNumber`) look identical to required fields | `Create.cshtml` |
| 9 | One long ungrouped list of 12 inputs with no way to save progress | `Create.cshtml` |
| 10 | `Create (POST)` binds directly to the EF Core `PhdApplication` entity (**over-posting** vulnerability) | `PhdApplicationsController.cs` |
| 11 | `[HttpPost]` actions are missing `[ValidateAntiForgeryToken]` | `PhdApplicationsController.cs` |
| 12 | `EditStatus` lets users type any status string, including disallowed transitions | `EditStatus.cshtml` |

---

## Part 1 – Quick Wins: Colour Contrast & Semantic `<label>` Elements

**Goal:** **Ensure form controls are visually perceivable and programmatically labelled so every user—and assistive technology—can read and interact with them.** Visual styling alone is never enough for accessibility:
1. A primary call-to-action button with a `2.12:1` contrast ratio (`#ffffff` on `#7cb8eb`) is difficult to read for users with low vision, colour vision deficiencies, or screens in bright glare (**WCAG 2.2 AA Criterion 1.4.3 Contrast Minimum** requires at least **`4.5:1`** for normal text). Using `:root` CSS custom properties in `wwwroot/css/site.css` lets you fix this across the entire portal in one place.
2. Placing a `<span class="form-label">` above an `<input>` only creates a *visual* association for sighted users. Because a `<span>` has no programmatic relationship with the `<input>`, clicking the text does not focus the field (hurting users with motor impairments who rely on a larger click target), and screen readers announce the field simply as `"edit text, blank"` (**WCAG 1.3.1 Info and Relationships** & **4.1.2 Name, Role, Value**). Replacing `<span>` with `<label asp-for="...">` outputs `<label for="FieldId">`, linking each label directly to its control.

### Task 1: Fix the `Create` Button Colour Contrast in `wwwroot/css/site.css` (`Snippet 1.A`)

1. On `/PhdApplications/Create`, right-click the **Create** button (`.btn.btn-primary`) and select **Inspect** to open Browser DevTools.
2. In the **Styles** pane, find `.btn-primary` and click the small colour swatch next to `background-color: var(--btn-primary-bg)`:
   - Notice that `#ffffff` text on `#7cb8eb` has a contrast ratio of **`2.12:1`**, failing **WCAG 2.2 AA** (`4.5:1` minimum).
3. Open `PgrStudentManagement.Web/wwwroot/css/site.css` and locate the `TODO (Lab Part 1 - Task 1: Colour Contrast)` comment inside `:root` (around line 36).
4. Replace the low-contrast primary button variables with a deep accessible navy (`#0f4c81`, which achieves an **`8.86:1`** contrast ratio against `#ffffff`—passing both WCAG AA and AAA):
   ```css
   --btn-primary-bg: #0f4c81;
   --btn-primary-hover: #09355c;
   --btn-primary-border: #0f4c81;
   --btn-primary-text: #ffffff;
   ```
5. **Clue:** See [**Snippet 1.A** in `code-snippets.md`](./code-snippets.md#snippet-1a-fix-primary-button-colour-contrast-in-wwwrootcsssitecss).

### Task 2: Replace `<span class="form-label">` with `<label asp-for="...">` in `Create.cshtml` (`Snippet 1.B`)

1. On `/PhdApplications/Create`, try clicking the text `FirstName` above the first text box—notice that the cursor does **not** jump into the input box!
2. Open `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml`. Every field currently uses a plain `<span>`:
   ```cshtml
   <span class="form-label">FirstName</span>
   ```
3. Replace each `<span class="form-label">...</span>` with an ASP.NET Core `<label asp-for="..." class="form-label"></label>` tag helper:
   ```cshtml
   <label asp-for="FirstName" class="form-label"></label>
   ```
   ASP.NET Core automatically renders `<label class="form-label" for="FirstName">FirstName</label>`, matching the `id="FirstName"` on the `<input>`.
4. Save and test in your browser: clicking any label now focuses its input immediately!
5. **Clue:** Copy [**Snippet 1.B** in `code-snippets.md`](./code-snippets.md#snippet-1b-replace-span-prompts-with-semantic-label-asp-for-elements-in-createcshtml).

---

## Part 2 – Introduce a View Model, Auto-Generate System Fields & Add `TempData` User Feedback

**Goal:** **Do not rely on user input wherever the system can generate or infer the data itself.** Minimising required user input reduces cognitive load, speeds up task completion, and eliminates entire categories of avoidable human error (such as mistyping an application reference format or entering an inaccurate submission date). At the same time, binding the form to a dedicated `ViewModel` instead of the database entity prevents **over-posting (mass-assignment)** security vulnerabilities, and displaying a `TempData` confirmation banner (`role="status"`, **WCAG 4.1.3 Status Messages**) after redirecting gives users—and screen readers—immediate certainty that their action succeeded along with their newly generated reference number.

### Step-by-Step Instructions

1. **Create the View Model (`Snippet 2.A`):**
   Create a new file `PgrStudentManagement.Web/Modules/PhdApplications/Models/CreatePhdApplicationViewModel.cs`.
   - Include **only** the 9 fields the applicant actually provides: `FirstName`, `LastName`, `EmailAddress`, `ProgrammeCode`, `ModeOfStudy`, `ProposedStartDate`, `ProposedThesisTitle`, `ResearchSummary`, `FundingSource` (make this nullable `FundingType?`), and `ProposedSupervisorStaffNumber`.
   - **Clue:** Copy [**Snippet 2.A** in `code-snippets.md`](./code-snippets.md#snippet-2a-create-createphdapplicationviewmodelcs).

2. **Update `PhdApplicationsController.Create` (GET & POST) (`Snippet 2.B`):**
   Open `Modules/PhdApplications/Controllers/PhdApplicationsController.cs` and find the `TODO (Lab Part 2)` comments:
   - In `[HttpGet] Create`, call `await _phdApplicationService.GetEligibleMainSupervisorsAsync(cancellationToken)` and store the list in `ViewBag.Supervisors`, then return `View(new CreatePhdApplicationViewModel())`.
   - In `[HttpPost] Create`, add `[ValidateAntiForgeryToken]`, change the parameter type to `CreatePhdApplicationViewModel model`, and generate the reference automatically using:
     ```csharp
     var reference = await _phdApplicationService.GenerateNextApplicationReferenceAsync(cancellationToken);
     ```
   - Set `Status = ApplicationStatus.Submitted` and `SubmittedDate = DateTime.UtcNow.Date` on the new `PhdApplication` object.
   - When `outcome == ApplicationOutcome.Created`, store a confirmation message in `TempData` right before `RedirectToAction(nameof(Details), ...)`:
     ```csharp
     TempData["SuccessMessage"] =
         $"Application {application.ApplicationReference} submitted successfully.";
     ```
   - **Why `TempData` instead of `ViewBag` or `ViewData`?** Because `Create (POST)` uses the **Post-Redirect-Get (PRG)** pattern (`RedirectToAction`), the browser makes a brand-new HTTP `GET` request to `/PhdApplications/Details`. `ViewData` and `ViewBag` only last for a single request and would be lost on redirect, whereas `TempData` persists across one redirect and is automatically cleared once read.
   - **Clue:** Copy [**Snippet 2.B** in `code-snippets.md`](./code-snippets.md#snippet-2b-update-phdapplicationscontrollercreate-get--post).

3. **Update `Views/PhdApplications/Create.cshtml`:**
   - Change line 1 `@model` to `CreatePhdApplicationViewModel`.
   - **Delete** the `<div class="mb-3">` blocks for `ApplicationReference` and `SubmittedDate`.

4. **Display the `TempData["SuccessMessage"]` Feedback Banner in `Views/PhdApplications/Details.cshtml` (`Snippet 2.C`):**
   - Open `Views/PhdApplications/Details.cshtml` at the `TODO (Lab Part 2)` comment right below `<h1>PhD Application Details</h1>`.
   - Render `TempData["SuccessMessage"]` inside `<div class="alert alert-success" role="status">`:
     ```cshtml
     @if (TempData["SuccessMessage"] is string successMessage)
     {
         <div class="alert alert-success" role="status">
             @successMessage
         </div>
     }
     ```
   - **Accessibility note (WCAG 4.1.3 Status Messages):** Adding `role="status"` creates a polite live region (`aria-live="polite"`) so screen readers announce the confirmation message and generated reference number without stealing keyboard focus, and refreshing `Details` afterwards won't re-show a stale alert because `TempData` is consumed on read.
   - **Clue:** See [**Snippet 2.C** in `code-snippets.md`](./code-snippets.md#snippet-2c-display-tempdatasuccessmessage-banner-in-detailscshtml).

---

## Part 3 – Replace Plain Text Inputs with Appropriate Controls

**Goal:** **Prevent user errors by constraining inputs to valid choices and matching each HTML control to its underlying data type.** Free-text inputs force users to *recall* internal codes (`PHD-COMP`, `AS1001`, `Studentship`) from memory instead of *recognising* valid options on screen (violating Nielsen's **"Recognition rather than recall"** heuristic). Replacing plain text boxes with radio buttons (`<fieldset>`), `<select>` dropdowns populated with human-readable supervisor names, `<input type="email">`, `<input type="date">`, and `autocomplete` attributes (**WCAG 1.3.5 Identify Input Purpose**) makes invalid choices impossible for constrained fields, presents the right virtual keyboard on mobile devices, and exposes accurate semantic roles (`radio`, `combobox`) to assistive technologies (**WCAG 4.1.2 Name, Role, Value**).

### Step-by-Step Instructions

Open `Views/PhdApplications/Create.cshtml` and work through the `TODO (Lab Part 3)` comments:

1. **First Name, Last Name & Email (`Snippet 3.A`):**
   - Switch the inputs to use `asp-for`.
   - Add `autocomplete="given-name"` to `FirstName`, `autocomplete="family-name"` to `LastName`, and `spellcheck="false"` to both.
   - Change `EmailAddress` to `type="email"` with `autocomplete="email"` and `spellcheck="false"`.
   - **Clue:** See [**Snippet 3.A** in `code-snippets.md`](./code-snippets.md#snippet-3a-personal-details--email-typeemail-autocomplete).

2. **Programme Dropdown & Mode of Study Radios (`Snippet 3.B`):**
   - Replace the `ProgrammeCode` text box with a `<select asp-for="ProgrammeCode" class="form-select">` offering `PHD-COMP`, `PHD-DESIGN`, and `MPHIL-COMP`.
   - Replace the `ModeOfStudy` text box with two `<input type="radio">` buttons (`Full-time` and `Part-time`) wrapped in a `<fieldset>` with `<legend class="form-label">Mode of study</legend>`.
   - Change `ProposedStartDate` to `<input asp-for="ProposedStartDate" type="date" class="form-control" />`.
   - **Clue:** Why radios for Mode of Study? There are only 2 choices, so showing both immediately saves a click and lets users compare them at a glance. See [**Snippet 3.B** in `code-snippets.md`](./code-snippets.md#snippet-3b-programme-select--mode-of-study-radio-buttons-fieldset).

3. **Funding Source Radio Buttons (`Snippet 3.C`):**
   - Replace the `FundingSource` text box with a `<fieldset>` + `<legend>` that loops over `Html.GetEnumSelectList<FundingType>()` to render a radio button for each enum value.
   - **Clue:** See [**Snippet 3.C** in `code-snippets.md`](./code-snippets.md#snippet-3c-funding-source-radio-buttons-from-enum).

4. **Proposed Supervisor Dropdown (`Snippet 3.D`):**
   - Applicants don't know staff numbers like `AS1001`—they know supervisor names!
   - Replace the `ProposedSupervisorStaffNumber` text box with a `<select asp-for="ProposedSupervisorStaffNumber" class="form-select">` that loops over `ViewBag.Supervisors` (populated in Part 2).
   - Make the first option `<option value="">I have not identified a supervisor yet</option>` so the field remains optional.
   - **Clue:** See [**Snippet 3.D** in `code-snippets.md`](./code-snippets.md#snippet-3d-proposed-supervisor-select-dropdown).

---

## Part 4 – Human-Readable Display Names, Hint Text, Grouping & Live Character Count

**Goal:** **Communicate expectations upfront so users succeed on their first attempt without guesswork or trial-and-error.** Raw C# property names (`ProposedSupervisorStaffNumber`) leak internal database naming into the user interface. Providing plain-English labels (**WCAG 2.4.6 Headings and Labels**), explicit `(optional)` markers (so users know which fields they can safely skip), programmatic hint text linked via `aria-describedby` (**WCAG 1.3.1 Info and Relationships** & **3.3.2 Labels or Instructions**), logical section headings, and a polite live character counter (`aria-live="polite"`, **WCAG 4.1.3**) ensures both sighted and screen-reader users understand format and length constraints *before* they submit.

### Step-by-Step Instructions

1. **Add Human-Readable `[Display(Name = "...")]` Attributes:**
   - In `CreatePhdApplicationViewModel.cs`, add `[Display(Name = "...")]` to each property (e.g. `[Display(Name = "Proposed thesis title")]`).
   - Mark the two optional fields right in their display names: `[Display(Name = "Research summary (optional)")]` and `[Display(Name = "Proposed main supervisor (optional)")]`.
   - In `FundingType.cs`, add `[Display(Name = "...")]` to each enum value (e.g. `[Display(Name = "Self-funded")]`).
   - **Clue:** See [**Snippet 5.A**](./code-snippets.md#snippet-5a-createphdapplicationviewmodelcs-with-validation--display-attributes) and [**Snippet 5.B**](./code-snippets.md#snippet-5b-adding-display-names-to-fundingtypecs).

2. **Convert `ResearchSummary` to a `<textarea>` with `aria-describedby` (`Snippet 4.A`):**
   - Replace the `ResearchSummary` text input with `<textarea asp-for="ResearchSummary" rows="6" class="form-control">`.
   - Add a hint `<div id="ResearchSummary-hint" class="form-text">` above the textarea and link it using `aria-describedby="ResearchSummary-hint ResearchSummary-count"`.
   - **Clue:** See [**Snippet 4.A** in `code-snippets.md`](./code-snippets.md#snippet-4a-textarea-with-hint-text-linked-via-aria-describedby).

3. **Add a Live Character Counter (`Snippet 4.B`):**
   - Below the textarea, add `<div id="ResearchSummary-count" class="form-text" aria-live="polite">You have 2,000 characters remaining</div>`.
   - Add the short script from [**Snippet 4.B**](./code-snippets.md#snippet-4b-accessible-live-character-counter-aria-livepolite) to update the remaining character count as the user types.

4. **Section Headings:**
   - Group the fields under four `<h2>` headings: `1. About you`, `2. Programme and mode of study`, `3. Research proposal`, and `4. Funding and supervision`.

---

## Part 5 – Add Server-Side Validation Rules

**Goal:** **Enforce data integrity on the server as the authoritative safety net while writing polite, specific error messages that help users recover quickly.** Because client-side checks in the browser can be bypassed or disabled, the server must always validate every required field, length limit, and data format. Good validation is not just about rejecting invalid requests—it is about **constructive error recovery** (**WCAG 3.3.1 Error Identification** & **3.3.3 Error Suggestion**): replacing generic framework defaults (`"The EmailAddress field is required."`) with clear, actionable guidance (`"Enter an email address in the correct format, like name@example.com"`) that explains both *what* is wrong and *how* to fix it.

### Step-by-Step Instructions

1. Open `CreatePhdApplicationViewModel.cs` and add Data Annotations to each property:
   - `[Required(ErrorMessage = "...")]` on `FirstName`, `LastName`, `EmailAddress`, `ProgrammeCode`, `ModeOfStudy`, `ProposedStartDate`, `ProposedThesisTitle`, and `FundingSource`.
   - `[EmailAddress(ErrorMessage = "Enter an email address in the correct format, like name@example.com")]` on `EmailAddress`.
   - `[StringLength(...)]` matching the database limits (`100` for names, `255` for email, `300` for thesis title, `2000` for research summary).
2. **Clue:** Copy the complete annotated class from [**Snippet 5.A** in `code-snippets.md`](./code-snippets.md#snippet-5a-createphdapplicationviewmodelcs-with-validation--display-attributes).

---

## Part 6 – Display Errors Accessibly (Error Summary + Inline Messages)

**Goal:** **Ensure no user is ever left stranded after a failed form submission, whether they navigate by sight, keyboard, or screen reader.** When a server postback returns validation errors, a sighted mouse user might notice red text halfway down the page, but keyboard-only and screen-reader users are placed back at the top of the document with no explanation unless we actively guide their focus. Prefixing the page `<title>` with `"Error: "`, moving keyboard focus immediately to a top-of-page **Error Summary** (`role="alert"`, `tabindex="-1"`) with anchor links that jump straight to each invalid field, and programmatically attaching inline error messages to inputs via `aria-invalid="true"` and `aria-describedby` guarantees fast, accessible error recovery without relying on colour alone (**WCAG 3.3.1**, **2.4.3 Focus Order**, and **1.4.1 Use of Color**).

### Step-by-Step Instructions

1. **Prefix the Page `<title>` on Error:**
   - At the top of `Create.cshtml`, set `ViewData["Title"] = !ViewData.ModelState.IsValid ? "Error: Create PhD Application" : "Create PhD Application";`.
2. **Add a Focusable Error Summary Box (`Snippet 6.A`):**
   - Right above `<form>`, render an `<div id="error-summary" class="alert alert-danger" role="alert" tabindex="-1">` whenever `!ViewData.ModelState.IsValid`.
   - Loop through `ViewData.ModelState` and render each error as a clickable anchor `<a href="#@entry.Key">@error.ErrorMessage</a>` that jumps focus directly to the input with that `id`.
   - Call `document.getElementById('error-summary')?.focus();` so screen-reader and keyboard users land on the summary immediately after page reload.
   - **Clue:** Copy [**Snippet 6.A** in `code-snippets.md`](./code-snippets.md#snippet-6a-focusable-error-summary-with-anchor-links-to-fields).
3. **Add Inline Field Error Spans (`Snippet 6.B`):**
   - Ensure every field has `<span asp-validation-for="..." class="text-danger"></span>`.
   - For an extra accessibility boost, see [**Snippet 6.B**](./code-snippets.md#snippet-6b-inline-error-message-with-aria-invalid-and-aria-describedby) to see how `aria-invalid="true"` and `aria-describedby` connect the error message to the input.

---

## Part 7 – Client-Side Validation (Native HTML5 Constraints)

**Goal:** **Provide instant, zero-latency feedback in the browser before a network round-trip occurs, using lightweight native web standards.** Adding HTML5 constraint validation attributes (`required`, `maxlength`, `type="email"`, `type="date"`) allows the browser to catch missing required fields or malformed email addresses the moment the user attempts to submit—saving time and preserving scroll position—without requiring external JavaScript or jQuery validation libraries, while keeping server-side validation (Parts 5 & 6) as the authoritative check.

### Step-by-Step Instructions

1. Add native HTML5 validation attributes (`required`, `maxlength`, `type="email"`, `type="date"`) directly to the form controls in `Create.cshtml` matching the rules in `CreatePhdApplicationViewModel` (see [**Snippet 7.A** in `code-snippets.md`](./code-snippets.md#snippet-7a-adding-html5-validation-attributes-in-createcshtml)).
2. Leave `required` off the optional `ResearchSummary` and `ProposedSupervisorStaffNumber` controls.
3. No jQuery or JavaScript validation libraries are needed—the browser enforces HTML constraints natively, while `formnovalidate` on the draft button (Part 8) allows saving partial drafts.

---

## Part 8 (Optional Stretch Goal) – Split the Form into Sections with "Save and Return Later"

> [!TIP]
> **Optional Stretch Goal:** Complete **Part 9** (`EditStatus.cshtml`) first if you are short on time, then return here to implement multi-step section panels and draft saving.

**Goal:** **Reduce cognitive overload on long forms through progressive disclosure ("chunking") and protect users' work across multiple sessions.** Writing a PhD research proposal takes time, and applicants often need to gather funding details or refine their 2,000-character summary before submitting. Splitting the 4 logical sections into navigable step panels (`data-step-panel` with `aria-current="step"`) lets users focus on one manageable group of questions at a time while degrading gracefully if JavaScript is unavailable, and providing a **"Save as draft and return later"** button (`formnovalidate`) prevents frustrating data loss when users are interrupted (**WCAG 2.2.6 Timeouts** / task continuity).

### Step-by-Step Instructions (Simplified Zero-Migration Path)

1. **Add `Draft` to `ApplicationStatus.cs` (`Snippet 8.A`):**
   - Open `Modules/PhdApplications/Models/ApplicationStatus.cs` and add `Draft` at the top of the enum.
   - **Heavy Hint:** Because `Status` is stored as a `TEXT` string in SQLite and we can default blank draft strings to `string.Empty`, **you don't even need to run a database migration** if you use [**Snippet 8.D**](./code-snippets.md#snippet-8d-dual-submit-buttons-submit-vs-save-and-return-later)! *(If you prefer making the database columns nullable, see [**Snippet 8.B**](./code-snippets.md#snippet-8b-update-studentmanagementdbcontextcs-configurephdapplications).)*

2. **Add `SaveDraftApplicationAsync` to `PhdApplicationService.cs` (`Snippet 8.C`):**
   - Open `Modules/PhdApplications/Services/PhdApplicationService.cs` at the `TODO (Lab Part 8)` comment and paste `SaveDraftApplicationAsync` from [**Snippet 8.C** in `code-snippets.md`](./code-snippets.md#snippet-8c-add-draft-save--final-submit-methods-to-phdapplicationservicecs).

3. **Add the "Save as draft and return later" Button (`Snippet 8.D`):**
   - In `Create.cshtml`, replace the submit button with the two buttons in [**Snippet 8.D**](./code-snippets.md#snippet-8d-dual-submit-buttons-submit-vs-save-and-return-later):
     - `<button type="submit" name="command" value="submit" class="btn btn-primary">Submit application</button>`
     - `<button type="submit" name="command" value="draft" formnovalidate class="btn btn-outline-secondary">Save as draft and return later</button>`
   - Update `[HttpPost] Create` in `PhdApplicationsController.cs` to accept `string command = "submit"` and call `SaveDraftApplicationAsync` when `command == "draft"` (see [**Snippet 8.D**](./code-snippets.md#snippet-8d-dual-submit-buttons-submit-vs-save-and-return-later)).

4. **Split `Create.cshtml` into 4 Navigable Step Panels (`Snippet 8.E`):**
   - Wrap each of the 4 `<h2>` sections from Part 4 in `<div class="app-step" data-step-panel="1"> ... </div>` (for steps `1`, `2`, `3`, and `4`).
   - Add the step navigation pills and short progressive-enhancement script from [**Snippet 8.E** in `code-snippets.md`](./code-snippets.md#snippet-8e-optional-stretch-goal-multi-step-wizard-tabs--sections-with-fieldset-panels).
   - **Why this works so well:** With JavaScript enabled, users see one clean section at a time with `aria-current="step"` on the active step. If JavaScript is disabled, all 4 sections remain visible on the page and submit normally!

---

## Part 9 – Improve the `EditStatus` Form (Admissions Decisions)

**Goal:** **Embed domain business rules directly into the interface so staff can only select valid workflow transitions (error prevention over error reporting).** In the starter form, an Admissions Tutor must type a raw status name into a text box and can easily type a misformatted string (`"Offer made"`) or attempt an illegal state transition (such as changing a finalized `Rejected` application back to `OfferMade`). By querying `GetAllowedTransitions(application.Status)` and presenting radio buttons *only* for the valid next states—or replacing the form with an informational lock message (`role="status"`) when the application has reached a final state—the UI guides staff through the workflow and makes invalid transitions impossible (**WCAG 3.3.4 Error Prevention**).

### Step-by-Step Instructions

1. **Pass Allowed Transitions & Set `TempData` Confirmation in the Controller:**
   - Open `PhdApplicationsController.cs` and find `TODO (Lab Part 9)` in `EditStatus`.
   - `PhdApplicationService` already has a `GetAllowedTransitions(application.Status)` helper ready for you! Call it and store the result in `ViewBag.AllowedTransitions` in both `[HttpGet] EditStatus` and `[HttpPost] EditStatus` (when returning the view on error).
   - In `[HttpPost] EditStatus`, when `outcome == ApplicationOutcome.Updated`, set `TempData["SuccessMessage"]` before redirecting to `Details` so the banner you added in Part 2 confirms the decision change:
     ```csharp
     TempData["SuccessMessage"] =
         $"Application {applicationReference} status updated to {status}.";
     ```
2. **Replace the Text Input in `Views/PhdApplications/EditStatus.cshtml`:**
   - Show the current status clearly as a badge above the form.
   - If `allowed.Count == 0` (meaning the application is already `Rejected`, `Withdrawn`, or `Enrolled`), show an informational alert explaining that the decision is final and cannot be changed.
   - Otherwise, render a `<fieldset>` with radio buttons for each status in `ViewBag.AllowedTransitions`.
   - **Clue:** Copy [**Snippet 9.A** in `code-snippets.md`](./code-snippets.md#snippet-9a-controller--view-for-allowed-status-transitions).

---

## Part 10 – Optional Bonus: Accessible Table & Filtering on `Index.cshtml`

**Goal:** **Support fast visual scanning, status filtering, and unambiguous screen-reader link navigation across data tables.** As the number of PhD applications grows, staff need a simple filter control to narrow records by status, while screen-reader users navigating via a list of links need row-specific context so they do not hear dozens of identical, indistinguishable `"Details"` and `"Edit status"` links (**WCAG 1.3.1 Info and Relationships** & **2.4.4 Link Purpose in Context**).

If you finish early, open `Views/PhdApplications/Index.cshtml` and apply [**Snippet 10.A** in `code-snippets.md`](./code-snippets.md#snippet-10a-accessible-table-with-caption-scopecol-filter-and-context-links):

1. Add a `<form method="get">` with a `<select name="statusFilter">` so users can filter applications by status (the controller's `Index(ApplicationStatus? statusFilter)` parameter is already wired up!).
2. Add `<caption class="visually-hidden">List of PhD applications</caption>` inside `<table>` and `scope="col"` on every `<th>`.
3. Add visually hidden context to the row action links (`Details<span class="visually-hidden"> for @application.ApplicationReference</span>`) so screen-reader users navigating by links don't hear dozens of identical "Details" links (WCAG 2.4.4 Link Purpose).

---

## Next Step: Commit Your Branch & Proceed to Lab 2

Once your improvements are complete, commit and push your changes on the `ui-ux-improvements` branch:

```bash
git add .
git commit -m "Improve PhD Applications UI/UX and WCAG 2.2 accessibility"
git push
```

Then move on to [**`lab2-instructions.md`**](./lab2-instructions.md) to test and compare **`main`** against **`ui-ux-improvements`** using Playwright, Accessibility Insights, and Chrome DevTools!
