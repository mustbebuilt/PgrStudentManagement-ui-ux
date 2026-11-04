# Postgraduate Research (PGR) Student Management System

A modular ASP.NET Core web application demonstrating a **modular monolith** architecture for managing Postgraduate Research (PGR) students, academic supervisory teams, PhD admissions, and student research activities.

---

## Architecture Overview

The application is structured as a **modular monolith** divided into four distinct domain modules, each containing its own controllers, models, data access layer (DAOs/repositories), seeders, and services. Modules communicate across boundaries using lightweight **contracts (interfaces)** rather than referencing each other's data layer directly:

```
PgrStudentManagement.Web/Modules/
├── Students/               # Student records, enrolments, progression
│   └── Contracts/          # IStudentLookup (consumed by Supervisors & Applications)
├── AcademicSupervisors/    # Staff, role eligibility, supervisory teams
│   └── Contracts/          # ISupervisorLookup (consumed by Applications)
├── PhdApplications/        # Prospective PhD proposals, review, admissions lifecycle
└── ResearchActivities/     # Conferences, publications, research documents
```

### 1. Students Module ([`Modules/Students`](./PgrStudentManagement.Web/Modules/Students))
- Handles student records, programme enrolments, mode of study, and progression milestones (thesis titles, expected dates, submissions).
- **Persistence**: Relational SQLite database (`student-management.db`) via Entity Framework Core (`Students` and `Enrolments` tables).
- **Public Contract**: Exposes `IStudentLookup` (returning `StudentSummary`), allowing other modules to verify student existence and full names without coupling to the `Students` persistence schema.

### 2. Academic Supervisors Module ([`Modules/AcademicSupervisors`](./PgrStudentManagement.Web/Modules/AcademicSupervisors))
- Manages supervisor records, role eligibility (Director of Studies, First Supervisor, Second Supervisor, Adviser), and supervisory team assignments.
- Enforces institutional rules (e.g. Director of Studies must be institution-employed, maximum supervisor thresholds, single DoS/First Supervisor per student).
- **Persistence**: Relational SQLite database via EF Core (`AcademicSupervisors`, `AcademicSupervisorEligibleRoles`, `SupervisoryAssignments`).
- **Public Contract**: Exposes `ISupervisorLookup` (returning `SupervisorSummary`), allowing other modules to look up supervisor names and check Main Supervisor eligibility.

### 3. PhD Applications Module ([`Modules/PhdApplications`](./PgrStudentManagement.Web/Modules/PhdApplications))
- **Purpose**: Manages the admissions intake and proposal evaluation pipeline for prospective PhD candidates before they become enrolled students.
- **Domain Model (`PhdApplication`)**:
  - **Identity**: Natural primary key `ApplicationReference` (e.g. `APP-2026-001`).
  - **Applicant Details**: First name, last name, email address.
  - **Proposed Study**: Programme code (e.g. `PHD-COMP`, `PHD-DESIGN`), mode of study (`Full-time` / `Part-time`), proposed cohort start date.
  - **Research Proposal**: Working thesis title and research abstract/summary.
  - **Funding**: Enumerated `FundingType` (`SelfFunded`, `Studentship`, `ResearchCouncil`, `ExternalSponsor`).
  - **Proposed Supervision**: Optional `ProposedSupervisorStaffNumber` foreign key referencing `AcademicSupervisors.StaffNumber`.
  - **Admissions Lifecycle**: `ApplicationStatus` (`Submitted`, `UnderReview`, `InterviewScheduled`, `OfferMade`, `OfferAccepted`, `Rejected`, `Withdrawn`, `Enrolled`).
  - **Decisions & Enrollment**: Submission date, decision timestamp, and optional `EnrolledStudentNumber` foreign key referencing `Students.StudentNumber` once an offer is accepted and the applicant matriculates.
- **Cross-Module Integration**:
  - Uses `ISupervisorLookup` to verify that any proposed supervisor exists and is eligible to act as a Main Supervisor (`DirectorOfStudies` or `FirstSupervisor`).
  - Uses `IStudentLookup` to validate matriculated student records when an application transitions to `Enrolled`.
- **Persistence**: Relational SQLite database via EF Core (`PhdApplications` table).
- **UI / UX & Accessibility Starting Point**: The module's starter views ([`Create.cshtml`](./PgrStudentManagement.Web/Views/PhdApplications/Create.cshtml) and [`EditStatus.cshtml`](./PgrStudentManagement.Web/Views/PhdApplications/EditStatus.cshtml)) are intentionally stripped of form validation and defaulted to plain text inputs, providing a real-world scenario for students to practice modern UI/UX, input types, and accessible form design (see [Lab Resources](#lab-resources-ui--ux-and-accessibility)).

### 4. Research Activities Module ([`Modules/ResearchActivities`](./PgrStudentManagement.Web/Modules/ResearchActivities))
- Tracks student research activities, conference presentations, published papers, and research milestones.
- **Persistence**: Document store in **MongoDB** (`StudentManagement.ResearchActivities` collection), demonstrating polyglot persistence alongside SQLite.

---

## Database Architecture & Polyglot Persistence

The application employs a polyglot persistence strategy suited to differing data models: **SQLite** for relational domain models with foreign keys, and **MongoDB** for flexible research activity documents.

### 1. SQLite Relational Database (`student-management.db`)
- **Location**: Local file `PgrStudentManagement.Web/student-management.db` (configured in `appsettings.json`).
- **Tables**:
  - `Students`: Core student demographic and research milestone records.
  - `Enrolments`: Programme history and enrolment statuses (`Active`, `Suspended`, `Completed`).
  - `AcademicSupervisors`: Staff records and employment types (`InstitutionEmployed`, `External`).
  - `AcademicSupervisorEligibleRoles`: Many-to-many relationship mapping supervisors to permissible supervisory roles.
  - `SupervisoryAssignments`: Student-supervisor team pairings with start/end dates and role types.
  - `PhdApplications`: Candidate applications, proposals, proposed supervisors, and status history.
- **Zero Configuration**: SQLite requires no installation or running services.
- **Automatic Migration & Seeding**: When the application boots, `Program.cs` automatically invokes `context.Database.MigrateAsync()`, ensuring all schema tables are created and seeded if they do not yet exist.
- **Manual Migrations** (optional):
  ```bash
  dotnet ef migrations add <MigrationName> --project PgrStudentManagement.Web
  dotnet ef database update --project PgrStudentManagement.Web
  ```

### 2. MongoDB Document Database (`StudentManagement`)
- **Connection**: `mongodb://localhost:27017` (configured in `appsettings.json`).
- **Collection**: `StudentManagement.ResearchActivities`.
- **Setup Options**:
  - **Docker (Recommended)**:
    ```bash
    docker run -d --name mongodb -p 27017:27017 mongo:latest
    ```
  - **macOS (Homebrew)**:
    ```bash
    brew services start mongodb-community
    ```
- **Automatic Initialization**: On startup, `ResearchActivityDataSeeder.SeedAsync` checks if the collection is empty and populates sample documents.

---

## How to Run the Application

### 1. Build the Solution
From the repository root:
```bash
dotnet build
```

### 2. Run the Web Project
Ensure your local MongoDB instance is running, then launch the web application:
```bash
dotnet run --project PgrStudentManagement.Web
```
Or with hot reload:
```bash
dotnet watch --project PgrStudentManagement.Web
```

By default, the application listens on:
- HTTP: `http://localhost:5277`
- HTTPS: `https://localhost:7178`

### 3. Application Startup Sequence
When [PgrStudentManagement.Web/Program.cs](PgrStudentManagement.Web/Program.cs) executes:
1. **Service Registration**: Registers MVC controllers, EF Core SQLite `DbContext`, MongoDB client, DAOs, repositories, and cross-module services (`IStudentLookup`, `ISupervisorLookup`).
2. **Database Migration**: Automatically applies pending EF Core migrations (`await context.Database.MigrateAsync()`).
3. **Ordered Data Seeding**:
   - `StudentDataSeeder` (Students)
   - `EnrolmentDataSeeder` (Enrolments referencing `StudentNumber`)
   - `AcademicSupervisorDataSeeder` (Supervisors and supervisory assignments)
   - `PhdApplicationDataSeeder` (PhD applications referencing supervisors and students)
   - `ResearchActivityDataSeeder` (MongoDB activity documents)
4. **Endpoint Routing**: Maps controllers and static asset endpoints.

### 4. Running the Tests
To run unit and integration tests across all modules:
```bash
dotnet test
```

---

## Lab Resources: UI / UX and Accessibility

This project includes a dedicated hands-on lab focused on improving form usability, accessibility (WCAG 2.2), and multi-step workflows in ASP.NET Core MVC:

- **Lab Instructions**: [`LabResources/lab-instructions.md`](./LabResources/lab-instructions.md)
  - **Part 0**: Usability and accessibility audit of the starter forms.
  - **Part 1**: Decoupling forms from entities using View Models.
  - **Part 2**: Selecting appropriate HTML5 input types (dates, emails, radios, selects).
  - **Part 3**: Accessible labels, hint text, grouping (`<fieldset>`/`<legend>`), and character counts.
  - **Part 4 & 5**: Accessible server-side error validation (error summary, inline messages, focus management).
  - **Part 6**: Progressive enhancement with unobtrusive client-side validation.
  - **Part 7**: Breaking long forms into a multi-step task list with a **Save and Return Later** draft feature.
  - **Part 8**: Progressive disclosure and error prevention on status decision forms.
  - **Part 10**: Comprehensive WCAG 2.2 testing checklist (keyboard navigation, screen readers, contrast, zoom).
- **Code Snippets & Architecture Guide**: [`LabResources/code-snippets.md`](./LabResources/code-snippets.md)
  - Concrete C# implementations for `PhdApplicationsController`, `PhdApplication` drafts, `PhdApplicationService` transition checks, and `StudentManagementDbContext` fluent configuration.

---

## Technical Notes

### Asynchronous Pattern in Controllers
When returning view models from asynchronous services in MVC controllers, always `await` the asynchronous task:
```csharp
// Correct:
public async Task<IActionResult> Index(CancellationToken cancellationToken = default)
{
    var supervisors = await _academicSupervisorService.GetAcademicSupervisorsAsync(cancellationToken);
    return View(supervisors);
}
```
Omitting `await` passes an unresolved `Task<...>` rather than the underlying model into Razor's `ViewDataDictionary`, which causes a runtime `System.InvalidOperationException`.
