# EngineerFlow — Architecture & Design Decisions

## System Overview

EngineerFlow is a two-tier web application:

```
┌─────────────────────────────────────────────────────────────┐
│                        Windows Host                          │
│                                                              │
│  ┌──────────────┐   HTTP/JSON    ┌──────────────────────┐   │
│  │   Angular 18  │  ───────────► │  ASP.NET Core 8 API   │  │
│  │  (Port 4200)  │  ◄───────────  │    (Port 5000)        │  │
│  └──────────────┘                └──────────┬───────────┘   │
│                                             │ EF Core        │
│                                             ▼                │
│                                   ┌──────────────────┐       │
│                                   │   SQLite DB File  │       │
│                                   │  engineerflow.db  │       │
│                                   └──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Layering Strategy

```
HTTP Request
    │
    ▼
Controller  ← Thin HTTP layer: routing, validation, response codes
    │
    ▼
Service     ← Business logic: state transitions, data shaping
    │
    ▼
DbContext   ← EF Core: LINQ queries, change tracking
    │
    ▼
SQLite File
```

**Why not use a Repository pattern?**
For an app of this size and single-DB, a full repository layer adds abstraction without value. EF Core's `DbContext` already acts as the unit of work. The Service layer directly uses `AppDbContext` — this is a deliberate simplification, not an oversight.

### DTO Design

All API responses use dedicated DTO records, not domain models directly. This provides:
- Freedom to change the schema without breaking the API contract
- Computed properties (e.g., `IsOverdue`, `PriorityLabel`) added cleanly
- No risk of accidental serialisation of navigation properties

`CreateJobRequestDto` and `UpdateJobRequestDto` are separate intentionally — `UpdateJobRequest` uses nullable fields so callers can do partial updates without needing all fields.

### Status Transitions

Status is stored as an integer enum. The API exposes two update paths:
- `PATCH /status` — lightweight, for UI status dropdowns
- `PUT /{id}` — full update when editing the whole request

This avoids requiring a full payload for simple status changes.

### Completion Events

A `CompletionEvent` is a 1:1 optional entity on `JobRequest`. When `RecordCompletion` is called:
1. The job request status is set to `Completed`
2. A `CompletionEvent` row is inserted (or updated if re-completing)
3. Both changes are saved in a single transaction

This gives a clean audit record: *who* completed it, *when*, and the resolution context.

---

## Frontend Architecture

### Standalone Components (Angular 18)

NgModules are not used. Every component is standalone and imports only what it needs. This reduces bundle size and makes lazy-loading routes trivial.

### Feature Structure

```
features/
├── dashboard/    ← Stats, overdue banner, recent activity
├── requests/     ← List view, detail view, create/edit dialogs
└── completion/   ← Record completion dialog
```

Each feature owns its route, component, and local service calls.

### State Management

No NgRx / Redux. The app uses:
- Angular's `HttpClient` observables directly in components via `async` pipe
- Simple `BehaviorSubject` in the list component to track active filters
- Dialogs pass data via `MatDialog` and emit results to parent

This avoids over-engineering for a scope where local component state suffices.

### Reactive Forms

All forms use Angular's `ReactiveFormsModule`:
- Validators run synchronously (no server-round-trip validation)
- Dirty-checking prevents unnecessary API calls on unchanged fields
- Custom validator for due-date (must be in the future)

---

## Database Choice: SQLite

### Why SQLite?

| Factor | SQLite | SQL Server LocalDB | PostgreSQL |
|---|---|---|---|
| Install required | ❌ None | ⚠️ Visual Studio | ❌ Separate install |
| File-based | ✅ Yes | ❌ No | ❌ No |
| Portable (USB etc.) | ✅ Yes | ❌ No | ❌ No |
| EF Core support | ✅ Full | ✅ Full | ✅ Full |
| Suitable for scale | ⚠️ Single writer | ✅ Yes | ✅ Yes |

The brief says "simulate or simplify infrastructure where needed." SQLite fulfils the relational requirement while maximising portability for a Windows assessment. The EF Core abstraction means swapping to SQL Server is a single connection string change.

### Tradeoff

SQLite does not support concurrent writes well. For a production multi-user system, the connection string would be changed to SQL Server or PostgreSQL. The schema and application code require zero changes thanks to EF Core's provider abstraction.

---

## Key Tradeoffs Summary

| Decision | Choice Made | Alternative | Rationale |
|---|---|---|---|
| Database | SQLite | SQL Server LocalDB | Zero install, truly portable |
| ORM | EF Core Code-First | Dapper | Migrations + type safety outweigh raw SQL flexibility at this scale |
| State management | Component state + observables | NgRx | NgRx adds boilerplate; overkill for this scope |
| Repository layer | Omitted | Full IRepository<T> | EF Core IS the repository; extra abstraction has no ROI here |
| CSS approach | SCSS custom properties | Angular Material theming only | Full design control; Material used only for components |
| Auth | None (out of scope) | JWT / Identity | Not required by brief; documented as future work |
| Testing | Unit (xUnit, services) | Full E2E (Playwright) | E2E setup time exceeds assessment scope |

---

## Future Production Considerations

- **Authentication:** Add ASP.NET Core Identity + JWT for multi-user
- **Database:** Swap SQLite → SQL Server / PostgreSQL (one config line)
- **Containerisation:** Add `Dockerfile` + `docker-compose.yml`
- **Notifications:** SignalR for real-time status updates across users
- **Audit log:** Add a `RequestHistory` table for full status change trail
- **File attachments:** Blob storage integration for attaching specs/docs