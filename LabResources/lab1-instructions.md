# Lab 1: Improving the UI/UX and Accessibility of the PhD Applications Forms

## Overview

The **PhD Applications** module (`PgrStudentManagement.Web/Modules/PhdApplications`) works, but its forms have been **deliberately left in a poor state**: every field is a plain `<input type="text">` and all form validation has been removed.

In **Lab 1**, you will redesign the PhD Applications forms so they are **easy to use, accessible (WCAG 2.2), and robust**.
In **Lab 2** ([`lab2-instructions.md`](./lab2-instructions.md)), you will run side-by-side **Pre vs. Post usability and automated accessibility tests** (using Playwright, Axe, Accessibility Insights, and Chrome DevTools) to measure the impact of your changes.

---

## Before You Start: Create Two Copies ("Pre" and "Post")

Because **Lab 2** compares the **original ("Pre")** application against your **improved ("Post")** application, you should keep an untouched copy of the original repository alongside the copy you modify in this lab:

1. Fork the original repository on GitHub:
   <https://github.com/mustbebuilt/PgrStudentManagement-ui-ux>
   *(If you want two separate repositories in your GitHub account, you can also use **+** → **Import repository** on GitHub and import `https://github.com/mustbebuilt/PgrStudentManagement-ui-ux` a second time as `PgrStudentManagement-ui-ux-pre`.)*
2. Clone **two separate folders** on your machine—one for your untouched **"Pre"** baseline, and one for your **"Post"** lab work:
   ```bash
   # 1. Untouched baseline copy (keep this unmodified for Lab 2 "Pre" testing)
   git clone https://github.com/<your-username>/PgrStudentManagement-ui-ux.git PgrStudentManagement-ui-ux-pre

   # 2. Working copy (make all of your Lab 1 improvements in this folder)
   git clone https://github.com/<your-username>/PgrStudentManagement-ui-ux.git PgrStudentManagement-ui-ux-post
   cd PgrStudentManagement-ui-ux-post
   ```

> [!IMPORTANT]
> **How to use this Lab 1 guide:**
> - Work inside your `PgrStudentManagement-ui-ux-post` folder and leave `PgrStudentManagement-ui-ux-pre` untouched for [Lab 2](./lab2-instructions.md).
> - Every file you need to edit already has **`TODO (Lab Part X)` comments** marking the exact spots to change.
> - Helper methods (`GetEligibleMainSupervisorsAsync`, `GenerateNextApplicationReferenceAsync`, and `GetAllowedTransitions`) are **already built for you** inside [`PhdApplicationService.cs`](../PgrStudentManagement.Web/Modules/PhdApplications/Services/PhdApplicationService.cs).
> - Companion file [**`code-snippets.md`**](./code-snippets.md) contains **complete, copy-and-adapt code snippets** for every step below.

### Learning outcomes

By the end of Lab 1 you should be able to:

1. Separate form models (ViewModels) from database entities to prevent over-posting and auto-generate system fields.
2. Replace plain text boxes with semantic HTML controls (`email`, `date`, `<select>`, `<textarea>`, radio `<fieldset>`s).
3. Add clear labels, hint text (`aria-describedby`), groupings (`<fieldset>`/`<legend>`), and live character counts (`aria-live="polite"`).
4. Add server-side validation and display errors accessibly (focusable error summary + inline field errors with `aria-invalid="true"`).
5. Add progressive client-side validation without breaking no-JavaScript support.
6. Split a long form into logical sections with a **Save as draft and return later** feature.

### Files you will work with

| File | What you will do | Matching Snippets |
| :--- | :--- | :--- |
| `Modules/PhdApplications/Models/CreatePhdApplicationViewModel.cs` | *(New file)* Form view model with display & validation attributes | [Snippet 1.A](./code-snippets.md#snippet-1a-create-createphdapplicationviewmodelcs), [Snippet 4.A](./code-snippets.md#snippet-4a-createphdapplicationviewmodelcs-with-validation--display-attributes) |
| `Modules/PhdApplications/Controllers/PhdApplicationsController.cs` | Bind to the view model, load dropdown data, and handle Draft vs Submit | [Snippet 1.B](./code-snippets.md#snippet-1b-update-phdapplicationscontrollercreate-get--post), [Snippet 7.D](./code-snippets.md#snippet-7d-dual-submit-buttons-submit-vs-save-and-return-later), [Snippet 8.A](./code-snippets.md#snippet-8a-controller--view-for-allowed-status-transitions) |
| `Views/PhdApplications/Create.cshtml` | Replace `type="text"` inputs with semantic controls, hints, errors, and sections | [Snippets 2.A–2.D](./code-snippets.md#part-2--appropriate-html-input-types--controls), [3.A–3.B](./code-snippets.md#part-3--labels-hints-aria-describedby--live-character-counter), [5.A–5.B](./code-snippets.md#part-5--accessible-error-summary--inline-error-messages), [7.D–7.E](./code-snippets.md#part-7--sectioned-form-with-save-and-return-later) |
| `Views/PhdApplications/EditStatus.cshtml` | Replace free-text status with radio buttons for valid transitions | [Snippet 8.A](./code-snippets.md#snippet-8a-controller--view-for-allowed-status-transitions) |
| `Views/PhdApplications/Index.cshtml` | *(Optional)* Add table `<caption>`, `scope="col"`, status filter, and screen-reader context | [Snippet 9.A](./code-snippets.md#snippet-9a-accessible-table-with-caption-scopecol-filter-and-context-links) |

Run the app with:
```bash
dotnet watch --project PgrStudentManagement.Web
```
Then open **PhD Applications** in the top navigation bar.

---

## Part 0 – Inspect the Starting Point (5–10 mins)

Before changing any code, try using `/PhdApplications/Create` and `/PhdApplications/EditStatus` in your browser. Look for these 10 deliberate flaws:

| # | Flaw in the starter code | Where |
| :--- | :--- | :--- |
| 1 | Every field is `<input type="text">` (even dates, emails, enums, and the 2,000-character research summary) | `Create.cshtml`, `EditStatus.cshtml` |
| 2 | Labels show raw C# property names (`ApplicationReference`, `ProposedSupervisorStaffNumber`) | `Create.cshtml` |
| 3 | No hint text explaining expected date formats or funding options | Both forms |
| 4 | Users are forced to invent **system-owned data**: `ApplicationReference`, `SubmittedDate`, and a supervisor's **staff number** (`AS1001`) | `Create.cshtml` |
| 5 | **Silent failures**: if binding fails (e.g. typing `"Offer made"` with a space), the page reloads with zero error messages | Both forms |
| 6 | Optional fields (`ResearchSummary`, `ProposedSupervisorStaffNumber`) look identical to required fields | `Create.cshtml` |
| 7 | One long ungrouped list of 12 inputs with no way to save progress | `Create.cshtml` |
| 8 | `Create (POST)` binds directly to the EF Core `PhdApplication` entity (**over-posting** vulnerability) | `PhdApplicationsController.cs` |
| 9 | `[HttpPost]` actions are missing `[ValidateAntiForgeryToken]` | `PhdApplicationsController.cs` |
| 10 | `EditStatus` lets users type any status string, including disallowed transitions | `EditStatus.cshtml` |

---

## Part 1 – Introduce a View Model & Auto-Generate System Fields

**Goal:** Stop asking the user for `ApplicationReference` and `SubmittedDate`, and stop binding the database entity directly in the form.

### Step-by-Step Instructions

1. **Create the View Model:**
   Create a new file `PgrStudentManagement.Web/Modules/PhdApplications/Models/CreatePhdApplicationViewModel.cs`.
   - Include **only** the 9 fields the applicant actually provides: `FirstName`, `LastName`, `EmailAddress`, `ProgrammeCode`, `ModeOfStudy`, `ProposedStartDate`, `ProposedThesisTitle`, `ResearchSummary`, `FundingSource` (make this nullable `FundingType?`), and `ProposedSupervisorStaffNumber`.
   - **Clue:** Copy [**Snippet 1.A** in `code-snippets.md`](./code-snippets.md#snippet-1a-create-createphdapplicationviewmodelcs).

2. **Update `PhdApplicationsController.Create` (GET & POST):**
   Open `Modules/PhdApplications/Controllers/PhdApplicationsController.cs` and find the `TODO (Lab Part 1)` comments:
   - In `[HttpGet] Create`, call `await _phdApplicationService.GetEligibleMainSupervisorsAsync(cancellationToken)` and store the list in `ViewBag.Supervisors`, then return `View(new CreatePhdApplicationViewModel())`.
   - In `[HttpPost] Create`, add `[ValidateAntiForgeryToken]`, change the parameter type to `CreatePhdApplicationViewModel model`, and generate the reference automatically using:
     ```csharp
     var reference = await _phdApplicationService.GenerateNextApplicationReferenceAsync(cancellationToken);
     ```
   - Set `Status = ApplicationStatus.Submitted` and `SubmittedDate = DateTime.UtcNow.Date` on the new `PhdApplication` object.
   - **Clue:** Copy [**Snippet 1.B** in `code-snippets.md`](./code-snippets.md#snippet-1b-update-phdapplicationscontrollercreate-get--post).

3. **Update `Views/PhdApplications/Create.cshtml`:**
   - Change line 1 `@model` to `CreatePhdApplicationViewModel`.
   - **Delete** the `<div class="mb-3">` blocks for `ApplicationReference` and `SubmittedDate`.

---

## Part 2 – Replace Plain Text Inputs with Appropriate Controls

**Goal:** Use semantic HTML controls so browsers, mobile keyboards, and screen readers give users the right input experience.

### Step-by-Step Instructions

Open `Views/PhdApplications/Create.cshtml` and work through the `TODO (Lab Part 2)` comments:

1. **First Name, Last Name & Email (`Snippet 2.A`):**
   - Switch the inputs to use `asp-for`.
   - Add `autocomplete="given-name"` to `FirstName`, `autocomplete="family-name"` to `LastName`, and `spellcheck="false"` to both.
   - Change `EmailAddress` to `type="email"` with `autocomplete="email"` and `spellcheck="false"`.
   - **Clue:** See [**Snippet 2.A** in `code-snippets.md`](./code-snippets.md#snippet-2a-personal-details--email-typeemail-autocomplete).

2. **Programme Dropdown & Mode of Study Radios (`Snippet 2.B`):**
   - Replace the `ProgrammeCode` text box with a `<select asp-for="ProgrammeCode" class="form-select">` offering `PHD-COMP`, `PHD-DESIGN`, and `MPHIL-COMP`.
   - Replace the `ModeOfStudy` text box with two `<input type="radio">` buttons (`Full-time` and `Part-time`) wrapped in a `<fieldset>` with `<legend class="form-label">Mode of study</legend>`.
   - Change `ProposedStartDate` to `<input asp-for="ProposedStartDate" type="date" class="form-control" />`.
   - **Clue:** Why radios for Mode of Study? There are only 2 choices, so showing both immediately saves a click and lets users compare them at a glance. See [**Snippet 2.B** in `code-snippets.md`](./code-snippets.md#snippet-2b-programme-select--mode-of-study-radio-buttons-fieldset).

3. **Funding Source Radio Buttons (`Snippet 2.C`):**
   - Replace the `FundingSource` text box with a `<fieldset>` + `<legend>` that loops over `Html.GetEnumSelectList<FundingType>()` to render a radio button for each enum value.
   - **Clue:** See [**Snippet 2.C** in `code-snippets.md`](./code-snippets.md#snippet-2c-funding-source-radio-buttons-from-enum).

4. **Proposed Supervisor Dropdown (`Snippet 2.D`):**
   - Applicants don't know staff numbers like `AS1001`—they know supervisor names!
   - Replace the `ProposedSupervisorStaffNumber` text box with a `<select asp-for="ProposedSupervisorStaffNumber" class="form-select">` that loops over `ViewBag.Supervisors` (populated in Part 1).
   - Make the first option `<option value="">I have not identified a supervisor yet</option>` so the field remains optional.
   - **Clue:** See [**Snippet 2.D** in `code-snippets.md`](./code-snippets.md#snippet-2d-proposed-supervisor-select-dropdown).

---

## Part 3 – Labels, Hint Text, Grouping & Live Character Count

**Goal:** Ensure every input has a human-friendly label, clear formatting/length hints announced by screen readers, and a multi-line `<textarea>` with a live character counter.

### Step-by-Step Instructions

1. **Add Human-Readable `[Display(Name = "...")]` Attributes:**
   - In `CreatePhdApplicationViewModel.cs`, add `[Display(Name = "...")]` to each property (e.g. `[Display(Name = "Proposed thesis title")]`).
   - Mark the two optional fields right in their display names: `[Display(Name = "Research summary (optional)")]` and `[Display(Name = "Proposed main supervisor (optional)")]`.
   - In `FundingType.cs`, add `[Display(Name = "...")]` to each enum value (e.g. `[Display(Name = "Self-funded")]`).
   - **Clue:** See [**Snippet 4.A**](./code-snippets.md#snippet-4a-createphdapplicationviewmodelcs-with-validation--display-attributes) and [**Snippet 4.B**](./code-snippets.md#snippet-4b-adding-display-names-to-fundingtypecs).

2. **Convert `ResearchSummary` to a `<textarea>` with `aria-describedby` (`Snippet 3.A`):**
   - Replace the `ResearchSummary` text input with `<textarea asp-for="ResearchSummary" rows="6" class="form-control">`.
   - Add a hint `<div id="ResearchSummary-hint" class="form-text">` above the textarea and link it using `aria-describedby="ResearchSummary-hint ResearchSummary-count"`.
   - **Clue:** See [**Snippet 3.A** in `code-snippets.md`](./code-snippets.md#snippet-3a-textarea-with-hint-text-linked-via-aria-describedby).

3. **Add a Live Character Counter (`Snippet 3.B`):**
   - Below the textarea, add `<div id="ResearchSummary-count" class="form-text" aria-live="polite">You have 2,000 characters remaining</div>`.
   - Add the short script from [**Snippet 3.B**](./code-snippets.md#snippet-3b-accessible-live-character-counter-aria-livepolite) to update the remaining character count as the user types.

4. **Section Headings:**
   - Group the fields under four `<h2>` headings: `1. About you`, `2. Programme and mode of study`, `3. Research proposal`, and `4. Funding and supervision`.

---

## Part 4 – Add Server-Side Validation Rules

**Goal:** Enforce required fields, maximum lengths, and email formatting on the server with clear, polite, actionable error messages.

### Step-by-Step Instructions

1. Open `CreatePhdApplicationViewModel.cs` and add Data Annotations to each property:
   - `[Required(ErrorMessage = "...")]` on `FirstName`, `LastName`, `EmailAddress`, `ProgrammeCode`, `ModeOfStudy`, `ProposedStartDate`, `ProposedThesisTitle`, and `FundingSource`.
   - `[EmailAddress(ErrorMessage = "Enter an email address in the correct format, like name@example.com")]` on `EmailAddress`.
   - `[StringLength(...)]` matching the database limits (`100` for names, `255` for email, `300` for thesis title, `2000` for research summary).
2. **Clue:** Copy the complete annotated class from [**Snippet 4.A** in `code-snippets.md`](./code-snippets.md#snippet-4a-createphdapplicationviewmodelcs-with-validation--display-attributes).

---

## Part 5 – Display Errors Accessibly (Error Summary + Inline Messages)

**Goal:** When validation fails, immediately alert keyboard and screen-reader users at the top of the page, let them jump straight to each invalid field, and attach inline error messages to the inputs.

### Step-by-Step Instructions

1. **Prefix the Page `<title>` on Error:**
   - At the top of `Create.cshtml`, set `ViewData["Title"] = !ViewData.ModelState.IsValid ? "Error: Create PhD Application" : "Create PhD Application";`.
2. **Add a Focusable Error Summary Box (`Snippet 5.A`):**
   - Right above `<form>`, render an `<div id="error-summary" class="alert alert-danger" role="alert" tabindex="-1">` whenever `!ViewData.ModelState.IsValid`.
   - Loop through `ViewData.ModelState` and render each error as a clickable anchor `<a href="#@entry.Key">@error.ErrorMessage</a>` that jumps focus directly to the input with that `id`.
   - Call `document.getElementById('error-summary')?.focus();` so screen-reader and keyboard users land on the summary immediately after page reload.
   - **Clue:** Copy [**Snippet 5.A** in `code-snippets.md`](./code-snippets.md#snippet-5a-focusable-error-summary-with-anchor-links-to-fields).
3. **Add Inline Field Error Spans (`Snippet 5.B`):**
   - Ensure every field has `<span asp-validation-for="..." class="text-danger"></span>`.
   - For an extra accessibility boost, see [**Snippet 5.B**](./code-snippets.md#snippet-5b-inline-error-message-with-aria-invalid-and-aria-describedby) to see how `aria-invalid="true"` and `aria-describedby` connect the error message to the input.

---

## Part 6 – Client-Side Validation (Progressive Enhancement)

**Goal:** Give instant feedback in the browser while keeping server-side validation as the fallback when JavaScript is disabled.

### Step-by-Step Instructions

1. Add `novalidate` to `<form asp-action="Create" method="post" novalidate>` in `Create.cshtml` so the browser's unstyled native tooltips don't obscure your accessible error messages.
2. At the bottom of `Create.cshtml`, include the validation scripts partial:
   ```cshtml
   @section Scripts {
       <partial name="_ValidationScriptsPartial" />
   }
   ```
   *(If you already added `@section Scripts` in Part 3 for the character counter, place `<partial name="_ValidationScriptsPartial" />` at the top of that section—see [**Snippet 3.B**](./code-snippets.md#snippet-3b-accessible-live-character-counter-aria-livepolite).)*

---

## Part 7 – Split the Form into Sections with "Save and Return Later"

**Goal:** Writing a PhD research proposal takes time. Let applicants step through the 4 sections one at a time and save a **Draft** application so they don't lose work.

### Step-by-Step Instructions (Simplified Zero-Migration Path)

1. **Add `Draft` to `ApplicationStatus.cs` (`Snippet 7.A`):**
   - Open `Modules/PhdApplications/Models/ApplicationStatus.cs` and add `Draft` at the top of the enum.
   - **Heavy Hint:** Because `Status` is stored as a `TEXT` string in SQLite and we can default blank draft strings to `string.Empty`, **you don't even need to run a database migration** if you use [**Snippet 7.D**](./code-snippets.md#snippet-7d-dual-submit-buttons-submit-vs-save-and-return-later)! *(If you prefer making the database columns nullable, see [**Snippet 7.B**](./code-snippets.md#snippet-7b-update-studentmanagementdbcontextcs-configurephdapplications).)*

2. **Add `SaveDraftApplicationAsync` to `PhdApplicationService.cs` (`Snippet 7.C`):**
   - Open `Modules/PhdApplications/Services/PhdApplicationService.cs` at the `TODO (Lab Part 7)` comment and paste `SaveDraftApplicationAsync` from [**Snippet 7.C** in `code-snippets.md`](./code-snippets.md#snippet-7c-add-draft-save--final-submit-methods-to-phdapplicationservicecs).

3. **Add the "Save as draft and return later" Button (`Snippet 7.D`):**
   - In `Create.cshtml`, replace the submit button with the two buttons in [**Snippet 7.D**](./code-snippets.md#snippet-7d-dual-submit-buttons-submit-vs-save-and-return-later):
     - `<button type="submit" name="command" value="submit" class="btn btn-primary">Submit application</button>`
     - `<button type="submit" name="command" value="draft" formnovalidate class="btn btn-outline-secondary">Save as draft and return later</button>`
   - Update `[HttpPost] Create` in `PhdApplicationsController.cs` to accept `string command = "submit"` and call `SaveDraftApplicationAsync` when `command == "draft"` (see [**Snippet 7.D**](./code-snippets.md#snippet-7d-dual-submit-buttons-submit-vs-save-and-return-later)).

4. **Split `Create.cshtml` into 4 Navigable Step Panels (`Snippet 7.E`):**
   - Wrap each of the 4 `<h2>` sections from Part 3 in `<div class="app-step" data-step-panel="1"> ... </div>` (for steps `1`, `2`, `3`, and `4`).
   - Add the step navigation pills and short progressive-enhancement script from [**Snippet 7.E** in `code-snippets.md`](./code-snippets.md#snippet-7e-multi-step-wizard-tabs--sections-with-fieldset-panels).
   - **Why this works so well:** With JavaScript enabled, users see one clean section at a time with `aria-current="step"` on the active step. If JavaScript is disabled, all 4 sections remain visible on the page and submit normally!

---

## Part 8 – Improve the `EditStatus` Form (Admissions Decisions)

**Goal:** Prevent staff from typing invalid statuses by showing radio buttons for **only the allowed transitions** from the current status.

### Step-by-Step Instructions

1. **Pass Allowed Transitions from the Controller:**
   - Open `PhdApplicationsController.cs` and find `TODO (Lab Part 8)` in `EditStatus`.
   - `PhdApplicationService` already has a `GetAllowedTransitions(application.Status)` helper ready for you! Call it and store the result in `ViewBag.AllowedTransitions` in both `[HttpGet] EditStatus` and `[HttpPost] EditStatus` (when returning the view on error).
2. **Replace the Text Input in `Views/PhdApplications/EditStatus.cshtml`:**
   - Show the current status clearly as a badge above the form.
   - If `allowed.Count == 0` (meaning the application is already `Rejected`, `Withdrawn`, or `Enrolled`), show an informational alert explaining that the decision is final and cannot be changed.
   - Otherwise, render a `<fieldset>` with radio buttons for each status in `ViewBag.AllowedTransitions`.
   - **Clue:** Copy [**Snippet 8.A** in `code-snippets.md`](./code-snippets.md#snippet-8a-controller--view-for-allowed-status-transitions).

---

## Part 9 – Optional Bonus: Accessible Table & Filtering on `Index.cshtml`

If you finish early, open `Views/PhdApplications/Index.cshtml` and apply [**Snippet 9.A** in `code-snippets.md`](./code-snippets.md#snippet-9a-accessible-table-with-caption-scopecol-filter-and-context-links):

1. Add a `<form method="get">` with a `<select name="statusFilter">` so users can filter applications by status (the controller's `Index(ApplicationStatus? statusFilter)` parameter is already wired up!).
2. Add `<caption class="visually-hidden">List of PhD applications</caption>` inside `<table>` and `scope="col"` on every `<th>`.
3. Add visually hidden context to the row action links (`Details<span class="visually-hidden"> for @application.ApplicationReference</span>`) so screen-reader users navigating by links don't hear dozens of identical "Details" links (WCAG 2.4.4 Link Purpose).

---

## Next Step: Proceed to Lab 2 (Pre vs. Post Testing)

Once your improvements in `PgrStudentManagement-ui-ux-post` are complete, move on to [**`lab2-instructions.md`**](./lab2-instructions.md) to test and compare your **Pre** and **Post** versions using Playwright, Accessibility Insights, and Chrome DevTools!

