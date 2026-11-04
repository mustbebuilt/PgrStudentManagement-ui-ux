# Lab Companion: Step-by-Step Code Snippets & Heavy Hints

This companion file contains ready-to-adapt code snippets for every part of [`lab-instructions.md`](./lab-instructions.md). Each section matches the corresponding **Part** in the lab instructions and tells you **which file to edit** and **what to replace**.

---

## Table of Contents

- [Part 1 – View Model & Controller Binding](#part-1--view-model--controller-binding)
  - [Snippet 1.A: Create `CreatePhdApplicationViewModel.cs`](#snippet-1a-create-createphdapplicationviewmodelcs)
  - [Snippet 1.B: Update `PhdApplicationsController.Create` (GET & POST)](#snippet-1b-update-phdapplicationscontrollercreate-get--post)
- [Part 2 – Appropriate HTML Input Types & Controls](#part-2--appropriate-html-input-types--controls)
  - [Snippet 2.A: Personal Details & Email (`type="email"`, `autocomplete`)](#snippet-2a-personal-details--email-typeemail-autocomplete)
  - [Snippet 2.B: Programme `<select>` & Mode of Study Radio Buttons (`<fieldset>`)](#snippet-2b-programme-select--mode-of-study-radio-buttons-fieldset)
  - [Snippet 2.C: Funding Source Radio Buttons from Enum](#snippet-2c-funding-source-radio-buttons-from-enum)
  - [Snippet 2.D: Proposed Supervisor `<select>` Dropdown](#snippet-2d-proposed-supervisor-select-dropdown)
- [Part 3 – Labels, Hints (`aria-describedby`) & Live Character Counter](#part-3--labels-hints-aria-describedby--live-character-counter)
  - [Snippet 3.A: Textarea with Hint Text Linked via `aria-describedby`](#snippet-3a-textarea-with-hint-text-linked-via-aria-describedby)
  - [Snippet 3.B: Accessible Live Character Counter (`aria-live="polite"`)](#snippet-3b-accessible-live-character-counter-aria-livepolite)
- [Part 4 – Server-Side Validation Attributes](#part-4--server-side-validation-attributes)
  - [Snippet 4.A: `CreatePhdApplicationViewModel.cs` with Validation & Display Attributes](#snippet-4a-createphdapplicationviewmodelcs-with-validation--display-attributes)
  - [Snippet 4.B: Adding Display Names to `FundingType.cs`](#snippet-4b-adding-display-names-to-fundingtypecs)
- [Part 5 – Accessible Error Summary & Inline Error Messages](#part-5--accessible-error-summary--inline-error-messages)
  - [Snippet 5.A: Focusable Error Summary with Anchor Links to Fields](#snippet-5a-focusable-error-summary-with-anchor-links-to-fields)
  - [Snippet 5.B: Inline Error Message with `aria-invalid` and `aria-describedby`](#snippet-5b-inline-error-message-with-aria-invalid-and-aria-describedby)
- [Part 6 – Client-Side Validation (Progressive Enhancement)](#part-6--client-side-validation-progressive-enhancement)
  - [Snippet 6.A: Enabling Unobtrusive Validation in `Create.cshtml`](#snippet-6a-enabling-unobtrusive-validation-in-createcshtml)
- [Part 7 – Sectioned Form with "Save and Return Later"](#part-7--sectioned-form-with-save-and-return-later)
  - [Snippet 7.A: Update `ApplicationStatus.cs` and `PhdApplication.cs` for Drafts](#snippet-7a-update-applicationstatuscs-and-phdapplicationcs-for-drafts)
  - [Snippet 7.B: Update `StudentManagementDbContext.cs` (`ConfigurePhdApplications`)](#snippet-7b-update-studentmanagementdbcontextcs-configurephdapplications)
  - [Snippet 7.C: Add Draft Save & Final Submit Methods to `PhdApplicationService.cs`](#snippet-7c-add-draft-save--final-submit-methods-to-phdapplicationservicecs)
  - [Snippet 7.D: Dual Submit Buttons ("Submit" vs "Save and return later")](#snippet-7d-dual-submit-buttons-submit-vs-save-and-return-later)
  - [Snippet 7.E: Multi-Step Wizard Tabs / Sections with `<fieldset>` Panels](#snippet-7e-multi-step-wizard-tabs--sections-with-fieldset-panels)
- [Part 8 – Improving `EditStatus.cshtml` (Admissions Decision Form)](#part-8--improving-editstatuscshtml-admissions-decision-form)
  - [Snippet 8.A: Controller & View for Allowed Status Transitions](#snippet-8a-controller--view-for-allowed-status-transitions)
- [Part 9 – Improving `Index.cshtml` (Table Accessibility & Filter)](#part-9--improving-indexcshtml-table-accessibility--filter)
  - [Snippet 9.A: Accessible Table with `<caption>`, `scope="col"`, Filter, and Context Links](#snippet-9a-accessible-table-with-caption-scopecol-filter-and-context-links)

---

## Part 1 – View Model & Controller Binding

### Snippet 1.A: Create `CreatePhdApplicationViewModel.cs`

**File to create:** `PgrStudentManagement.Web/Modules/PhdApplications/Models/CreatePhdApplicationViewModel.cs`

Notice that system-managed fields (`ApplicationReference`, `Status`, `SubmittedDate`, `DecisionDate`, `EnrolledStudentNumber`) are **omitted** so users cannot over-post them and do not have to invent them:

```csharp
using System;

namespace PgrStudentManagement.Web.Modules.PhdApplications.Models;

public class CreatePhdApplicationViewModel
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string EmailAddress { get; set; } = string.Empty;

    public string ProgrammeCode { get; set; } = string.Empty;

    public string ModeOfStudy { get; set; } = string.Empty;

    public DateTime ProposedStartDate { get; set; } =
        new DateTime(DateTime.UtcNow.Year + 1, 10, 1);

    public string ProposedThesisTitle { get; set; } = string.Empty;

    public string? ResearchSummary { get; set; }

    // Nullable so we can detect when the user hasn't picked a radio option yet
    public FundingType? FundingSource { get; set; }

    public string? ProposedSupervisorStaffNumber { get; set; }
}
```

### Snippet 1.B: Update `PhdApplicationsController.Create` (GET & POST)

**File to edit:** `PgrStudentManagement.Web/Modules/PhdApplications/Controllers/PhdApplicationsController.cs`

> **Hint:** `PhdApplicationService` already includes two helper methods for you:
> - `_phdApplicationService.GetEligibleMainSupervisorsAsync(cancellationToken)`
> - `_phdApplicationService.GenerateNextApplicationReferenceAsync(cancellationToken)`

Replace the `[HttpGet] Create` and `[HttpPost] Create` methods with:

```csharp
[HttpGet]
public async Task<IActionResult> Create(
    CancellationToken cancellationToken = default)
{
    ViewBag.Supervisors =
        await _phdApplicationService.GetEligibleMainSupervisorsAsync(
            cancellationToken);

    return View(new CreatePhdApplicationViewModel());
}

[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create(
    CreatePhdApplicationViewModel model,
    CancellationToken cancellationToken = default)
{
    if (!ModelState.IsValid)
    {
        ViewBag.Supervisors =
            await _phdApplicationService.GetEligibleMainSupervisorsAsync(
                cancellationToken);
        return View(model);
    }

    var reference =
        await _phdApplicationService.GenerateNextApplicationReferenceAsync(
            cancellationToken);

    var application = new PhdApplication
    {
        ApplicationReference = reference,
        FirstName = model.FirstName.Trim(),
        LastName = model.LastName.Trim(),
        EmailAddress = model.EmailAddress.Trim(),
        ProgrammeCode = model.ProgrammeCode.Trim(),
        ModeOfStudy = model.ModeOfStudy.Trim(),
        ProposedStartDate = model.ProposedStartDate,
        ProposedThesisTitle = model.ProposedThesisTitle.Trim(),
        ResearchSummary = model.ResearchSummary?.Trim(),
        FundingSource = model.FundingSource!.Value,
        ProposedSupervisorStaffNumber =
            string.IsNullOrWhiteSpace(model.ProposedSupervisorStaffNumber)
                ? null
                : model.ProposedSupervisorStaffNumber.Trim(),
        Status = ApplicationStatus.Submitted,
        SubmittedDate = DateTime.UtcNow.Date
    };

    var outcome = await _phdApplicationService.CreateApplicationAsync(
        application,
        cancellationToken);

    switch (outcome)
    {
        case ApplicationOutcome.Created:
            TempData["SuccessMessage"] =
                $"Application {application.ApplicationReference} submitted successfully.";
            return RedirectToAction(
                nameof(Details),
                new { applicationReference = application.ApplicationReference });

        case ApplicationOutcome.SupervisorNotFound:
            ModelState.AddModelError(
                nameof(model.ProposedSupervisorStaffNumber),
                "The selected academic supervisor was not found.");
            break;

        case ApplicationOutcome.SupervisorNotEligible:
            ModelState.AddModelError(
                nameof(model.ProposedSupervisorStaffNumber),
                "The selected supervisor is not eligible to act as a main supervisor.");
            break;

        default:
            ModelState.AddModelError(
                string.Empty,
                "The PhD application could not be submitted.");
            break;
    }

    ViewBag.Supervisors =
        await _phdApplicationService.GetEligibleMainSupervisorsAsync(
            cancellationToken);
    return View(model);
}
```

Remember to also change line 1 of `Views/PhdApplications/Create.cshtml` to:
```cshtml
@model PgrStudentManagement.Web.Modules.PhdApplications.Models.CreatePhdApplicationViewModel
```
And delete the `ApplicationReference` and `SubmittedDate` `<div class="mb-3">` blocks from `Create.cshtml`!

---

## Part 2 – Appropriate HTML Input Types & Controls

### Snippet 2.A: Personal Details & Email (`type="email"`, `autocomplete`)

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml`

```cshtml
<h2 class="h4 mt-4">1. About you</h2>

<div class="mb-3">
    <label asp-for="FirstName" class="form-label"></label>
    <input asp-for="FirstName"
           class="form-control"
           autocomplete="given-name"
           spellcheck="false" />
    <span asp-validation-for="FirstName" class="text-danger"></span>
</div>

<div class="mb-3">
    <label asp-for="LastName" class="form-label"></label>
    <input asp-for="LastName"
           class="form-control"
           autocomplete="family-name"
           spellcheck="false" />
    <span asp-validation-for="LastName" class="text-danger"></span>
</div>

<div class="mb-3">
    <label asp-for="EmailAddress" class="form-label"></label>
    <div id="EmailAddress-hint" class="form-text">
        We will use this email address to send your application reference and updates.
    </div>
    <input asp-for="EmailAddress"
           type="email"
           class="form-control"
           autocomplete="email"
           spellcheck="false"
           aria-describedby="EmailAddress-hint" />
    <span asp-validation-for="EmailAddress" class="text-danger"></span>
</div>
```

### Snippet 2.B: Programme `<select>` & Mode of Study Radio Buttons (`<fieldset>`)

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml`

```cshtml
<h2 class="h4 mt-4">2. Programme and mode of study</h2>

<div class="mb-3">
    <label asp-for="ProgrammeCode" class="form-label"></label>
    <select asp-for="ProgrammeCode" class="form-select">
        <option value="">Select a programme…</option>
        <option value="PHD-COMP">PhD Computing (PHD-COMP)</option>
        <option value="PHD-DESIGN">PhD Design (PHD-DESIGN)</option>
        <option value="MPHIL-COMP">MPhil Computing (MPHIL-COMP)</option>
    </select>
    <span asp-validation-for="ProgrammeCode" class="text-danger"></span>
</div>

<fieldset class="mb-3">
    <legend class="form-label">Mode of study</legend>

    <div class="form-check">
        <input class="form-check-input"
               type="radio"
               asp-for="ModeOfStudy"
               id="ModeOfStudy-FullTime"
               value="Full-time" />
        <label class="form-check-label" for="ModeOfStudy-FullTime">
            Full-time (typically 3 years)
        </label>
    </div>

    <div class="form-check">
        <input class="form-check-input"
               type="radio"
               asp-for="ModeOfStudy"
               id="ModeOfStudy-PartTime"
               value="Part-time" />
        <label class="form-check-label" for="ModeOfStudy-PartTime">
            Part-time (typically 6 years)
        </label>
    </div>

    <span asp-validation-for="ModeOfStudy" class="text-danger"></span>
</fieldset>

<div class="mb-3">
    <label asp-for="ProposedStartDate" class="form-label"></label>
    <div id="ProposedStartDate-hint" class="form-text">
        For example, 01/10/2027. Most cohorts begin in October or January.
    </div>
    <input asp-for="ProposedStartDate"
           type="date"
           class="form-control"
           aria-describedby="ProposedStartDate-hint" />
    <span asp-validation-for="ProposedStartDate" class="text-danger"></span>
</div>
```

### Snippet 2.C: Funding Source Radio Buttons from Enum

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml`

```cshtml
<h2 class="h4 mt-4">4. Funding and supervision</h2>

<fieldset class="mb-3">
    <legend class="form-label">How will your PhD studies be funded?</legend>

    @foreach (var item in Html.GetEnumSelectList<FundingType>())
    {
        var radioId = $"FundingSource-{item.Value}";
        <div class="form-check">
            <input class="form-check-input"
                   type="radio"
                   name="FundingSource"
                   id="@radioId"
                   value="@item.Value"
                   checked="@(Model.FundingSource?.ToString() == item.Text || ((int?)Model.FundingSource)?.ToString() == item.Value)" />
            <label class="form-check-label" for="@radioId">
                @item.Text
            </label>
        </div>
    }

    <span asp-validation-for="FundingSource" class="text-danger"></span>
</fieldset>
```

### Snippet 2.D: Proposed Supervisor `<select>` Dropdown

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml`

```cshtml
@{
    var supervisors = ViewBag.Supervisors
        as IReadOnlyList<PgrStudentManagement.Web.Modules.AcademicSupervisors.Contracts.SupervisorSummary>
        ?? Array.Empty<PgrStudentManagement.Web.Modules.AcademicSupervisors.Contracts.SupervisorSummary>();
}

<div class="mb-3">
    <label asp-for="ProposedSupervisorStaffNumber" class="form-label">
        Proposed main supervisor (optional)
    </label>
    <div id="ProposedSupervisor-hint" class="form-text">
        Only academic staff eligible to act as a Main Supervisor are listed. Leave blank if you have not yet identified a supervisor.
    </div>
    <select asp-for="ProposedSupervisorStaffNumber"
            class="form-select"
            aria-describedby="ProposedSupervisor-hint">
        <option value="">I have not identified a supervisor yet</option>
        @foreach (var supervisor in supervisors)
        {
            <option value="@supervisor.StaffNumber">
                @supervisor.DisplayName (@supervisor.StaffNumber)
            </option>
        }
    </select>
    <span asp-validation-for="ProposedSupervisorStaffNumber" class="text-danger"></span>
</div>
```

---

## Part 3 – Labels, Hints (`aria-describedby`) & Live Character Counter

### Snippet 3.A: Textarea with Hint Text Linked via `aria-describedby`

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml`

```cshtml
<h2 class="h4 mt-4">3. Research proposal</h2>

<div class="mb-3">
    <label asp-for="ProposedThesisTitle" class="form-label"></label>
    <div id="ProposedThesisTitle-hint" class="form-text">
        Provide a working title for your proposed research project (up to 300 characters).
    </div>
    <input asp-for="ProposedThesisTitle"
           class="form-control"
           aria-describedby="ProposedThesisTitle-hint" />
    <span asp-validation-for="ProposedThesisTitle" class="text-danger"></span>
</div>

<div class="mb-3">
    <label asp-for="ResearchSummary" class="form-label">
        Research summary (optional)
    </label>
    <div id="ResearchSummary-hint" class="form-text">
        Outline your research question, background context, and proposed methodology in up to 2,000 characters.
    </div>
    <textarea asp-for="ResearchSummary"
              rows="6"
              class="form-control"
              data-maxlength="2000"
              aria-describedby="ResearchSummary-hint ResearchSummary-count"></textarea>
    <div id="ResearchSummary-count"
         class="form-text"
         aria-live="polite">
        You have 2,000 characters remaining
    </div>
    <span asp-validation-for="ResearchSummary" class="text-danger"></span>
</div>
```

### Snippet 3.B: Accessible Live Character Counter (`aria-live="polite"`)

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml` (inside `@section Scripts`)

```cshtml
@section Scripts {
    <partial name="_ValidationScriptsPartial" />

    <script>
        (function () {
            const textarea = document.getElementById('ResearchSummary');
            const counter = document.getElementById('ResearchSummary-count');
            if (!textarea || !counter) return;

            const max = parseInt(textarea.getAttribute('data-maxlength') || '2000', 10);

            function updateCount() {
                const remaining = max - textarea.value.length;
                if (remaining >= 0) {
                    counter.textContent = `You have ${remaining.toLocaleString()} characters remaining`;
                    counter.classList.remove('text-danger');
                } else {
                    counter.textContent = `You have ${Math.abs(remaining).toLocaleString()} characters too many`;
                    counter.classList.add('text-danger');
                }
            }

            textarea.addEventListener('input', updateCount);
            updateCount();
        })();
    </script>
}
```

---

## Part 4 – Server-Side Validation Attributes

### Snippet 4.A: `CreatePhdApplicationViewModel.cs` with Validation & Display Attributes

**File to edit:** `PgrStudentManagement.Web/Modules/PhdApplications/Models/CreatePhdApplicationViewModel.cs`

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace PgrStudentManagement.Web.Modules.PhdApplications.Models;

public class CreatePhdApplicationViewModel
{
    [Display(Name = "First name")]
    [Required(ErrorMessage = "Enter your first name")]
    [StringLength(100, ErrorMessage = "First name must be 100 characters or fewer")]
    public string FirstName { get; set; } = string.Empty;

    [Display(Name = "Last name")]
    [Required(ErrorMessage = "Enter your last name")]
    [StringLength(100, ErrorMessage = "Last name must be 100 characters or fewer")]
    public string LastName { get; set; } = string.Empty;

    [Display(Name = "Email address")]
    [Required(ErrorMessage = "Enter your email address")]
    [EmailAddress(ErrorMessage = "Enter an email address in the correct format, like name@example.com")]
    [StringLength(255, ErrorMessage = "Email address must be 255 characters or fewer")]
    public string EmailAddress { get; set; } = string.Empty;

    [Display(Name = "Programme")]
    [Required(ErrorMessage = "Select the programme you are applying for")]
    public string ProgrammeCode { get; set; } = string.Empty;

    [Display(Name = "Mode of study")]
    [Required(ErrorMessage = "Select whether you will study full-time or part-time")]
    public string ModeOfStudy { get; set; } = string.Empty;

    [Display(Name = "Proposed start date")]
    [Required(ErrorMessage = "Enter your proposed start date")]
    [DataType(DataType.Date)]
    public DateTime ProposedStartDate { get; set; } =
        new DateTime(DateTime.UtcNow.Year + 1, 10, 1);

    [Display(Name = "Proposed thesis title")]
    [Required(ErrorMessage = "Enter a working title for your proposed thesis")]
    [StringLength(300, ErrorMessage = "Proposed thesis title must be 300 characters or fewer")]
    public string ProposedThesisTitle { get; set; } = string.Empty;

    [Display(Name = "Research summary (optional)")]
    [StringLength(2000, ErrorMessage = "Research summary must be 2,000 characters or fewer")]
    public string? ResearchSummary { get; set; }

    [Display(Name = "Funding source")]
    [Required(ErrorMessage = "Select how your PhD studies will be funded")]
    public FundingType? FundingSource { get; set; }

    [Display(Name = "Proposed main supervisor (optional)")]
    public string? ProposedSupervisorStaffNumber { get; set; }
}
```

### Snippet 4.B: Adding Display Names to `FundingType.cs`

**File to edit:** `PgrStudentManagement.Web/Modules/PhdApplications/Models/FundingType.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace PgrStudentManagement.Web.Modules.PhdApplications.Models;

public enum FundingType
{
    [Display(Name = "Self-funded")]
    SelfFunded,

    [Display(Name = "University studentship")]
    Studentship,

    [Display(Name = "UK Research Council (UKRI)")]
    ResearchCouncil,

    [Display(Name = "External or industry sponsor")]
    ExternalSponsor
}
```

---

## Part 5 – Accessible Error Summary & Inline Error Messages

### Snippet 5.A: Focusable Error Summary with Anchor Links to Fields

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml` (place right above `<form>`)

```cshtml
@{
    var hasErrors = !ViewData.ModelState.IsValid;
    ViewData["Title"] = hasErrors
        ? "Error: Create PhD Application"
        : "Create PhD Application";
}

@if (hasErrors)
{
    <div id="error-summary"
         class="alert alert-danger"
         role="alert"
         aria-labelledby="error-summary-title"
         tabindex="-1">
        <h2 id="error-summary-title" class="h5">There is a problem</h2>
        <ul class="mb-0">
            @foreach (var entry in ViewData.ModelState)
            {
                foreach (var error in entry.Value.Errors)
                {
                    <li>
                        @if (!string.IsNullOrEmpty(entry.Key))
                        {
                            <a href="#@entry.Key" class="alert-link">@error.ErrorMessage</a>
                        }
                        else
                        {
                            @error.ErrorMessage
                        }
                    </li>
                }
            }
        </ul>
    </div>
    <script>
        document.getElementById('error-summary')?.focus();
    </script>
}
```

### Snippet 5.B: Inline Error Message with `aria-invalid` and `aria-describedby`

When a specific field has a validation error, linking its error `<span>` in `aria-describedby` and setting `aria-invalid="true"` ensures screen readers announce the error immediately when the user focuses the input:

```cshtml
@{
    var emailInvalid = ViewData.ModelState.ContainsKey(nameof(Model.EmailAddress))
        && ViewData.ModelState[nameof(Model.EmailAddress)]!.Errors.Count > 0;
}
<div class="mb-3">
    <label asp-for="EmailAddress" class="form-label"></label>
    <div id="EmailAddress-hint" class="form-text">
        We will use this email address to send your application reference and updates.
    </div>
    <div>
        <span asp-validation-for="EmailAddress"
              id="EmailAddress-error"
              class="text-danger fw-semibold"></span>
    </div>
    <input asp-for="EmailAddress"
           type="email"
           class="form-control @(emailInvalid ? "is-invalid" : "")"
           autocomplete="email"
           spellcheck="false"
           aria-invalid="@(emailInvalid ? "true" : "false")"
           aria-describedby="EmailAddress-hint @(emailInvalid ? "EmailAddress-error" : "")" />
</div>
```

---

## Part 6 – Client-Side Validation (Progressive Enhancement)

### Snippet 6.A: Enabling Unobtrusive Validation in `Create.cshtml`

1. Add `novalidate` to `<form asp-action="Create" method="post" novalidate>` so the browser's unstyled native popups don't conflict with your accessible error messages.
2. Ensure `@section Scripts` at the bottom of `Create.cshtml` includes `_ValidationScriptsPartial`:

```cshtml
@section Scripts {
    <partial name="_ValidationScriptsPartial" />
}
```

---

## Part 7 – Sectioned Form with "Save and Return Later"

To keep Part 7 straightforward and manageable, you can implement **Save and Return Later** in two easy pieces:
1. Allow an application to be saved in a `Draft` state (even if some sections are still blank).
2. Split the form UI into 4 step panels (or step pages) with a **"Save as draft and return later"** button alongside **"Submit application"**.

### Snippet 7.A: Update `ApplicationStatus.cs` and `PhdApplication.cs` for Drafts

In `Modules/PhdApplications/Models/ApplicationStatus.cs`, add `Draft` as the first enum value:

```csharp
public enum ApplicationStatus
{
    Draft,
    Submitted,
    UnderReview,
    InterviewScheduled,
    OfferMade,
    OfferAccepted,
    Rejected,
    Withdrawn,
    Enrolled
}
```

### Snippet 7.B: Update `StudentManagementDbContext.cs` (`ConfigurePhdApplications`)

If you want to allow saving a partial draft before all fields are filled in, relax `.IsRequired()` on the non-key columns in `ConfigurePhdApplications` (or store empty strings `""` for not-yet-completed text fields so no schema migration is even required!).

> **Shortcut Hint (Zero-Migration Option):**
> If you default uncompleted draft strings to `string.Empty` (`""`) when saving a draft, you only need to add `Draft` to `ApplicationStatus`—because `Status` is stored as a `TEXT` string in SQLite, **no database migration is required**!

### Snippet 7.C: Add Draft Save & Final Submit Methods to `PhdApplicationService.cs`

**File to edit:** `PgrStudentManagement.Web/Modules/PhdApplications/Services/PhdApplicationService.cs`

```csharp
public async Task<ApplicationOutcome> SaveDraftApplicationAsync(
    PhdApplication draft,
    CancellationToken cancellationToken = default)
{
    ArgumentNullException.ThrowIfNull(draft);
    draft.Status = ApplicationStatus.Draft;

    var exists = await _phdApplicationDao.ApplicationExistsAsync(
        draft.ApplicationReference,
        cancellationToken);

    if (!exists)
    {
        await _phdApplicationDao.AddApplicationAsync(draft, cancellationToken);
        return ApplicationOutcome.Created;
    }

    await _phdApplicationDao.UpdateApplicationAsync(draft, cancellationToken);
    return ApplicationOutcome.Updated;
}
```

### Snippet 7.D: Dual Submit Buttons ("Submit" vs "Save and return later")

**In `Views/PhdApplications/Create.cshtml`:**
Replace the single Create button with two buttons sharing `name="command"`:

```cshtml
<div class="d-flex gap-2 mt-4">
    <button type="submit"
            name="command"
            value="submit"
            class="btn btn-primary">
        Submit application
    </button>

    <button type="submit"
            name="command"
            value="draft"
            formnovalidate
            class="btn btn-outline-secondary">
        Save as draft and return later
    </button>

    <a asp-action="Index" class="btn btn-link">Cancel</a>
</div>
```

**In `PhdApplicationsController.cs` (`[HttpPost] Create`):**
Add `string command = "submit"` to the action parameters:

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create(
    CreatePhdApplicationViewModel model,
    string command = "submit",
    CancellationToken cancellationToken = default)
{
    bool isDraft = string.Equals(command, "draft", StringComparison.OrdinalIgnoreCase);

    // Only enforce full required-field validation when submitting for real
    if (!isDraft && !ModelState.IsValid)
    {
        ViewBag.Supervisors =
            await _phdApplicationService.GetEligibleMainSupervisorsAsync(cancellationToken);
        return View(model);
    }

    var reference =
        await _phdApplicationService.GenerateNextApplicationReferenceAsync(cancellationToken);

    var application = new PhdApplication
    {
        ApplicationReference = reference,
        FirstName = model.FirstName?.Trim() ?? string.Empty,
        LastName = model.LastName?.Trim() ?? string.Empty,
        EmailAddress = model.EmailAddress?.Trim() ?? string.Empty,
        ProgrammeCode = model.ProgrammeCode?.Trim() ?? string.Empty,
        ModeOfStudy = model.ModeOfStudy?.Trim() ?? string.Empty,
        ProposedStartDate = model.ProposedStartDate,
        ProposedThesisTitle = model.ProposedThesisTitle?.Trim() ?? string.Empty,
        ResearchSummary = model.ResearchSummary?.Trim(),
        FundingSource = model.FundingSource ?? FundingType.SelfFunded,
        ProposedSupervisorStaffNumber =
            string.IsNullOrWhiteSpace(model.ProposedSupervisorStaffNumber)
                ? null
                : model.ProposedSupervisorStaffNumber.Trim(),
        Status = isDraft ? ApplicationStatus.Draft : ApplicationStatus.Submitted,
        SubmittedDate = DateTime.UtcNow.Date
    };

    var outcome = isDraft
        ? await _phdApplicationService.SaveDraftApplicationAsync(application, cancellationToken)
        : await _phdApplicationService.CreateApplicationAsync(application, cancellationToken);

    if (outcome is ApplicationOutcome.Created or ApplicationOutcome.Updated)
    {
        TempData["SuccessMessage"] = isDraft
            ? $"Draft saved! Your reference is {application.ApplicationReference}. You can return and complete it at any time."
            : $"Application {application.ApplicationReference} submitted successfully.";

        return RedirectToAction(
            nameof(Details),
            new { applicationReference = application.ApplicationReference });
    }
    // ... handle errors as in Snippet 1.B
}
```

### Snippet 7.E: Multi-Step Wizard Tabs / Sections with `<fieldset>` Panels

If you want to split the long form on `Create.cshtml` into 4 navigable step panels with Previous / Next buttons (while keeping all fields in the DOM so progressive enhancement works with or without JS):

```cshtml
<nav aria-label="Application sections" class="mb-4">
    <ol class="nav nav-pills gap-2" id="step-nav">
        <li class="nav-item"><button type="button" class="nav-link active" data-step="1" aria-current="step">1. About you</button></li>
        <li class="nav-item"><button type="button" class="nav-link" data-step="2">2. Programme</button></li>
        <li class="nav-item"><button type="button" class="nav-link" data-step="3">3. Proposal</button></li>
        <li class="nav-item"><button type="button" class="nav-link" data-step="4">4. Funding &amp; Submit</button></li>
    </ol>
</nav>

<!-- Wrap each section in <div class="app-step" data-step-panel="1"> ... </div> -->
```

```javascript
// Add inside @section Scripts to show one section at a time when JS is enabled:
(function () {
    const panels = document.querySelectorAll('[data-step-panel]');
    const buttons = document.querySelectorAll('[data-step]');
    if (panels.length === 0) return;

    function showStep(stepNumber) {
        panels.forEach(p => {
            p.hidden = p.getAttribute('data-step-panel') !== String(stepNumber);
        });
        buttons.forEach(b => {
            const active = b.getAttribute('data-step') === String(stepNumber);
            b.classList.toggle('active', active);
            if (active) b.setAttribute('aria-current', 'step');
            else b.removeAttribute('aria-current');
        });
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => showStep(btn.getAttribute('data-step')));
    });

    showStep(1);
})();
```

---

## Part 8 – Improving `EditStatus.cshtml` (Admissions Decision Form)

### Snippet 8.A: Controller & View for Allowed Status Transitions

**1. In `PhdApplicationsController.cs` (`EditStatus` GET & POST):**
Populate `ViewBag.AllowedTransitions` using the helper already provided on `_phdApplicationService`:

```csharp
[HttpGet]
public async Task<IActionResult> EditStatus(
    string applicationReference,
    CancellationToken cancellationToken = default)
{
    if (string.IsNullOrWhiteSpace(applicationReference))
    {
        return View("NotFound");
    }

    var application =
        await _phdApplicationService.GetApplicationByReferenceAsync(
            applicationReference,
            cancellationToken);

    if (application is null)
    {
        return View("NotFound");
    }

    ViewBag.AllowedTransitions =
        _phdApplicationService.GetAllowedTransitions(application.Status);

    return View(application);
}
```
*(Remember to also set `ViewBag.AllowedTransitions = _phdApplicationService.GetAllowedTransitions(application.Status);` before any `return View(application);` in the `[HttpPost] EditStatus` action!)*

**2. In `Views/PhdApplications/EditStatus.cshtml`:**

```cshtml
@model PgrStudentManagement.Web.Modules.PhdApplications.Models.PhdApplication

@{
    ViewData["Title"] = "Update Application Status";
    var allowed = ViewBag.AllowedTransitions as IReadOnlyList<ApplicationStatus>
        ?? Array.Empty<ApplicationStatus>();
}

<h1>Update Application Status</h1>

<p>
    <strong>@Model.ApplicationReference:</strong> @Model.FullName
</p>
<p>
    <strong>Current status:</strong>
    <span class="badge bg-secondary">@Model.Status</span>
</p>

@if (!ViewData.ModelState.IsValid)
{
    <div asp-validation-summary="All"
         class="alert alert-danger"
         role="alert"></div>
}

@if (allowed.Count == 0)
{
    <div class="alert alert-info" role="status">
        This application is in a final state (<strong>@Model.Status</strong>) and its status can no longer be changed.
    </div>
    <a asp-action="Details"
       asp-route-applicationReference="@Model.ApplicationReference"
       class="btn btn-secondary">
        Return to details
    </a>
}
else
{
    <form asp-action="EditStatus" method="post">
        <input type="hidden"
               name="applicationReference"
               value="@Model.ApplicationReference" />

        <fieldset class="mb-3">
            <legend class="form-label">Select new status</legend>

            @foreach (var nextStatus in allowed)
            {
                var id = $"status-{nextStatus}";
                <div class="form-check">
                    <input class="form-check-input"
                           type="radio"
                           name="status"
                           id="@id"
                           value="@nextStatus"
                           checked="@(Model.Status == nextStatus)" />
                    <label class="form-check-label" for="@id">
                        @nextStatus
                    </label>
                </div>
            }
        </fieldset>

        <button type="submit" class="btn btn-primary">
            Save decision
        </button>

        <a asp-action="Details"
           asp-route-applicationReference="@Model.ApplicationReference"
           class="btn btn-secondary">
            Cancel
        </a>
    </form>
}
```

---

## Part 9 – Improving `Index.cshtml` (Table Accessibility & Filter)

### Snippet 9.A: Accessible Table with `<caption>`, `scope="col"`, Filter, and Context Links

**File to edit:** `PgrStudentManagement.Web/Views/PhdApplications/Index.cshtml`

```cshtml
@model IReadOnlyList<PgrStudentManagement.Web.Modules.PhdApplications.Models.PhdApplication>

@{
    ViewData["Title"] = "PhD Applications";
    var selectedStatus = ViewData["SelectedStatus"] as ApplicationStatus?;
}

<div class="d-flex justify-content-between align-items-center mb-3">
    <h1>PhD Applications</h1>
    <a asp-action="Create" class="btn btn-primary">Create Application</a>
</div>

<form method="get" asp-action="Index" class="row g-2 align-items-end mb-4">
    <div class="col-auto">
        <label for="statusFilter" class="form-label">Filter by status</label>
        <select id="statusFilter" name="statusFilter" class="form-select">
            <option value="">All statuses</option>
            @foreach (var status in Enum.GetValues<ApplicationStatus>())
            {
                <option value="@status" selected="@(selectedStatus == status)">
                    @status
                </option>
            }
        </select>
    </div>
    <div class="col-auto">
        <button type="submit" class="btn btn-outline-primary">Apply filter</button>
        @if (selectedStatus.HasValue)
        {
            <a asp-action="Index" class="btn btn-link">Clear</a>
        }
    </div>
</form>

@if (Model.Count == 0)
{
    <p class="alert alert-info" role="status">No PhD applications found.</p>
}
else
{
    <table class="table table-striped align-middle">
        <caption class="visually-hidden">List of PhD applications</caption>
        <thead>
            <tr>
                <th scope="col">Reference</th>
                <th scope="col">Applicant</th>
                <th scope="col">Programme</th>
                <th scope="col">Mode of study</th>
                <th scope="col">Funding</th>
                <th scope="col">Status</th>
                <th scope="col">Submitted</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
        <tbody>
        @foreach (var application in Model)
        {
            <tr>
                <td>@application.ApplicationReference</td>
                <td>@application.FullName</td>
                <td>@application.ProgrammeCode</td>
                <td>@application.ModeOfStudy</td>
                <td>@application.FundingSource</td>
                <td>@application.Status</td>
                <td>@application.SubmittedDate.ToString("yyyy-MM-dd")</td>
                <td>
                    <a asp-action="Details"
                       asp-route-applicationReference="@application.ApplicationReference">
                        Details<span class="visually-hidden"> for @application.ApplicationReference (@application.FullName)</span>
                    </a>
                    |
                    <a asp-action="EditStatus"
                       asp-route-applicationReference="@application.ApplicationReference">
                        Edit status<span class="visually-hidden"> for @application.ApplicationReference (@application.FullName)</span>
                    </a>
                </td>
            </tr>
        }
        </tbody>
    </table>
}
```
