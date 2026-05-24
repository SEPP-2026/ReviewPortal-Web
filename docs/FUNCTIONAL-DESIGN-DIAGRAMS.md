# Functional Design Diagrams — Shelton Tool-Hire Review Portal (Web Client)

> Purpose: MSc submission design artefact for the Next.js web client, covering use case, component, activity, architecture, sequence, and data-flow diagrams from the frontend perspective.
>
> Backend counterpart: [../../ReviewPortal-API/docs/FUNCTIONAL-DESIGN-DIAGRAMS.md](../../ReviewPortal-API/docs/FUNCTIONAL-DESIGN-DIAGRAMS.md).
>
> Diagram format: Mermaid.

---

## 1. Use Case Diagram

Shows the actors and the main public-customer, registered-customer, admin, and moderator use cases as exercised through the web client.

```mermaid
flowchart LR
    PublicCustomer["Public Customer<br/>(guest or signed-in)"]
    Guest["Guest Visitor"]
    RegisteredUser["Registered Customer"]
    Admin["Admin"]
    Moderator["Moderator"]

    Guest -. "specialises" .-> PublicCustomer
    RegisteredUser -. "specialises" .-> PublicCustomer

    subgraph PublicShell["Public Shell"]
        UC1(("Homepage / featured categories"))
        UC2(("Browse category"))
        UC3(("View tool detail"))
        UC4(("Search tools"))
        UC5(("Filter and sort"))
        UC6(("Calculate rental cost"))
        UC7(("Read approved reviews"))
        UC8(("Register"))
        UC9(("Login / logout"))
        UC10(("Submit review"))
        UC11(("Comment on review"))
        UC12(("View own review status"))
        UC13(("Submit booking request"))
        UC14(("Manage account"))
    end

    subgraph AdminShell["Admin Shell"]
        UC15(("Staff sign in"))
        UC16(("Manage bookings"))
        UC17(("Moderation queue"))
        UC18(("Approve review"))
        UC19(("Reject review"))
        UC20(("Approve / reject comment"))
        UC21(("Post company response"))
        UC22(("Create / edit tool"))
        UC23(("Activate / deactivate tool"))
        UC24(("Upload / delete images"))
        UC25(("Manage categories"))
        UC26(("Dashboard statistics"))
    end

    PublicCustomer --> UC1
    PublicCustomer --> UC2
    PublicCustomer --> UC3
    PublicCustomer --> UC4
    PublicCustomer --> UC5
    PublicCustomer --> UC6
    PublicCustomer --> UC7
    PublicCustomer --> UC10
    PublicCustomer --> UC11
    PublicCustomer --> UC12
    PublicCustomer --> UC13
    Guest --> UC8
    Guest --> UC9
    RegisteredUser --> UC9
    RegisteredUser --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Moderator --> UC15
    Moderator --> UC16
    Moderator --> UC17
    Moderator --> UC18
    Moderator --> UC19
    Moderator --> UC20
    Moderator --> UC21
```

---

## 2. Component Diagram

Summarises the App Router routes, feature components, lib modules, and how they consume the backend.

```mermaid
classDiagram
    direction LR

    class AppRouter {
        +/ (homepage)
        +/equipment/[categoryId]
        +/equipment/[categoryId]/[toolId]
        +/search
        +/login, /register, /forgot-password, /reset-password
        +/account/reviews
        +/admin/(tools|categories|moderation|dashboard)
        +/api/auth/(login|logout|me)
        +/api/backend/[...path]
    }

    class LayoutComponents {
        SiteHeader
        SiteFooter
        MobileNav
    }

    class PublicFeatures {
        FeaturedCategories
        ToolGrid
        ToolCard
        ToolGallery
        RentalCalculator
        ReviewList
        ReviewForm
        CommentList
        CompanyResponseBlock
    }

    class AccountFeatures {
        MyReviewsList
        ProfileForm
        ChangePasswordForm
    }

    class AdminFeatures {
        AdminShell
        AdminToolsTable
        AdminToolForm
        AdminImageManager
        AdminCategoriesTable
        AdminCategoryForm
        AdminModerationQueue
        RejectionReasonDialog
        AdminDashboardCards
        AdminDashboardCharts
    }

    class Lib {
        api-client.ts
        backend-api.ts
        server-api.ts
        admin-guard.ts
        utils.ts
    }

    class Hooks {
        use-current-user.ts
        use-debounce.ts
    }

    class Stores {
        example-store.ts
    }

    class Types {
        api.ts
    }

    class BackendAPI {
        ASP.NET Core Web API
    }

    AppRouter --> LayoutComponents
    AppRouter --> PublicFeatures
    AppRouter --> AccountFeatures
    AppRouter --> AdminFeatures
    PublicFeatures --> Lib
    AccountFeatures --> Lib
    AdminFeatures --> Lib
    Lib --> Types
    Hooks --> Lib
    AdminFeatures --> Hooks
    AdminFeatures --> Stores
    Lib --> BackendAPI
```

---

## 3. Activity Diagrams

### 3.1 Customer Review Submission Activity (Frontend Perspective)

```mermaid
flowchart TD
    Start([Start])
    OpenDetail["Open /equipment/[categoryId]/[toolId]"]
    ClickWrite["Click 'Write a review'"]
    AuthCheck{"useCurrentUser → signed in?"}
    OpenForm["Open ReviewForm dialog"]
    PromptLoginOrGuest["Show name/email fields for guest"]
    Fill["Fill text and five stars"]
    Validate{"zod schema valid?"}
    ShowInline["Show inline field errors"]
    Submit["POST /api/backend/tools/{id}/reviews"]
    Response{"HTTP status"}
    ShowToast["Toast: 'Review submitted, awaiting moderation'"]
    ParseErrors["Map ProblemDetails.errors to field errors"]
    MarkSubmitted["Disable form, close dialog"]
    End([End])

    Start --> OpenDetail --> ClickWrite --> AuthCheck
    AuthCheck -- "Yes" --> OpenForm --> Fill
    AuthCheck -- "No" --> PromptLoginOrGuest --> Fill
    Fill --> Validate
    Validate -- "No" --> ShowInline --> Fill
    Validate -- "Yes" --> Submit --> Response
    Response -- "201" --> MarkSubmitted --> ShowToast --> End
    Response -- "400" --> ParseErrors --> Fill
    Response -- "5xx" --> ShowToast --> End
```

### 3.2 Admin Moderation Activity (Frontend Perspective)

```mermaid
flowchart TD
    Start([Start])
    OpenAdmin["Open /admin/moderation"]
    Guard{"admin-guard.ts result"}
    Redirect["Redirect to /login or /"]
    LoadQueue["GET /api/backend/admin/moderation/pending"]
    ChooseItem["Select pending item"]
    Decide{"Approve or Reject?"}
    Approve["PUT /api/backend/admin/moderation/(reviews|comments)/{id} approve=true"]
    OpenRejectDialog["Open RejectionReasonDialog"]
    EnterReason["Enter reason (1..500 chars)"]
    Reject["PUT ... approve=false reason=..."]
    Optimistic["Apply optimistic state in Zustand"]
    Result{"HTTP status"}
    ShowSuccess["Toast 'Decision saved', refresh list"]
    Rollback["Revert Zustand state, toast error"]
    End([End])

    Start --> OpenAdmin --> Guard
    Guard -- "fail" --> Redirect --> End
    Guard -- "pass" --> LoadQueue --> ChooseItem --> Decide
    Decide -- "Approve" --> Approve --> Optimistic --> Result
    Decide -- "Reject" --> OpenRejectDialog --> EnterReason --> Reject --> Optimistic --> Result
    Result -- "2xx" --> ShowSuccess --> End
    Result -- "non-2xx" --> Rollback --> End
```

---

## 4. High-Level Frontend Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Client (browser)"]
        Browser["Customer / Admin browser"]
        ReactClient["React Client Components"]
    end

    subgraph NextHost["Next.js host (Node)"]
        AppRouter["App Router"]
        RSC["React Server Components"]
        RouteHandlers["Route handlers under /api/*"]
        Middleware["middleware.ts (optional)"]
    end

    subgraph BackendCluster["Backend"]
        API["ASP.NET Core Web API"]
        SQL[(SQL Server / Azure SQL)]
        Blob[(Azure Blob Storage)]
    end

    subgraph DevOps["DevOps"]
        CI["GitHub Actions"]
        Lint["ESLint / Prettier"]
        Jest["Jest unit tests"]
        Lighthouse["Lighthouse CI"]
    end

    Browser --> AppRouter
    AppRouter --> RSC
    AppRouter --> RouteHandlers
    RSC --> ReactClient
    ReactClient -->|"fetch /api/backend/*"| RouteHandlers
    RouteHandlers -->|"HTTPS + JWT cookie"| API
    API --> SQL
    API --> Blob
    CI --> Lint
    CI --> Jest
    CI --> Lighthouse
    CI --> NextHost
```

---

## 5. Sequence Diagrams

### 5.1 Customer Submits a Review

```mermaid
sequenceDiagram
    actor Customer as Public Customer
    participant Browser as React Client
    participant Server as Next.js Route Handler
    participant API as ASP.NET Core API
    participant Reviews as ToolReviewsController
    participant ReviewService
    participant DB as SQL Server

    Customer->>Browser: Fill review form, click Submit
    Browser->>Browser: zod schema validate
    Browser->>Server: POST /api/backend/tools/{id}/reviews
    alt Signed-in customer
        Server->>Server: Read rp.auth cookie
        Server->>API: POST /api/tools/{id}/reviews + Bearer JWT
        API->>Reviews: Route request with userId
    else Guest visitor
        Server->>API: POST /api/tools/{id}/reviews with name/email
        API->>Reviews: Route request with userId = null
    end
    Reviews->>ReviewService: CreateReviewAsync(toolId, request, userId?)
    ReviewService->>ReviewService: Validate identity, text and five ratings
    ReviewService->>DB: Insert Review(Status = Pending, UserId optional)
    DB-->>ReviewService: Save successful
    ReviewService-->>Reviews: ReviewDto
    Reviews-->>API: 201 Created
    API-->>Server: 201 ReviewDto
    Server-->>Browser: 201 ReviewDto
    Browser-->>Customer: Toast "Awaiting moderation"
```

### 5.2 Admin Logs In and Opens the Moderation Queue

```mermaid
sequenceDiagram
    actor Staff as Admin or Moderator
    participant Browser as React Client
    participant LoginRoute as /api/auth/login
    participant Cookie as Set-Cookie rp.auth
    participant MeRoute as /api/auth/me
    participant Guard as lib/admin-guard.ts
    participant Server as Server Component
    participant Proxy as /api/backend
    participant API as ASP.NET Core API

    Staff->>Browser: Submit login form
    Browser->>LoginRoute: POST email + password
    LoginRoute->>API: POST /api/auth/login
    API-->>LoginRoute: 200 token, user
    LoginRoute-->>Cookie: Set httpOnly rp.auth
    LoginRoute-->>Browser: 200 user dto
    Browser->>Browser: Redirect to /admin
    Server->>Guard: render-time check
    Guard->>MeRoute: GET /api/auth/me
    MeRoute-->>Guard: 200 user with role
    Guard-->>Server: allow
    Server->>Proxy: GET /api/backend/admin/moderation/pending
    Proxy->>API: GET /api/admin/moderation/pending + Bearer JWT
    API-->>Proxy: 200 moderation queue
    Proxy-->>Server: 200 queue
    Server-->>Browser: Rendered queue
    Browser-->>Staff: Show pending items
```

### 5.3 Public Catalogue Rendering

```mermaid
sequenceDiagram
    actor Visitor
    participant Browser
    participant Page as RSC: app/equipment/[categoryId]/page.tsx
    participant Loader as lib/server-api.ts
    participant Backend as lib/backend-api.ts
    participant API

    Visitor->>Browser: Navigate to /equipment/3?sortBy=price
    Browser->>Page: SSR render
    Page->>Loader: getCategoryWithTools(3, params)
    Loader->>Backend: GET /api/categories/3?sortBy=price...
    Backend->>API: HTTPS GET (no auth required)
    API-->>Backend: 200 paged tools + category meta
    Backend-->>Loader: typed result
    Loader-->>Page: ToolListItem[]
    Page-->>Browser: HTML + hydrated client islands
```

---

## 6. Data Flow Diagrams

### 6.1 Context-Level DFD

```mermaid
flowchart LR
    Customer["Customer / Registered User"]
    Staff["Admin / Moderator"]
    WebClient["Next.js Web Client"]
    API(("ASP.NET Core API"))
    Cookie[("httpOnly auth cookie")]

    Customer -->|"Page requests, form submissions"| WebClient
    Staff -->|"Admin actions, moderation decisions"| WebClient
    WebClient -->|"HTTPS JSON via /api/backend, JWT cookie"| API
    API -->|"DTO responses, ProblemDetails on error"| WebClient
    WebClient -->|"Rendered HTML, toast notifications"| Customer
    WebClient -->|"Admin UI, queue updates"| Staff
    WebClient -.->|"Set/clear on login/logout"| Cookie
    Cookie -.->|"Sent on every server-side proxy call"| WebClient
```

### 6.2 Level 1 DFD

```mermaid
flowchart TB
    Customer["Customer"]
    Admin["Admin"]
    Moderator["Moderator"]

    P1(("1. Public Browsing"))
    P2(("2. Calculator"))
    P3(("3. Account / Auth"))
    P4(("4. Review / Comment Submission"))
    P5(("5. Moderation UI"))
    P6(("6. Admin Catalogue UI"))
    P7(("7. Admin Image UI"))
    P8(("8. Admin Dashboard UI"))

    S1[("S1 RSC fetch cache")]
    S2[("S2 URL searchParams")]
    S3[("S3 Zustand stores")]
    S4[("S4 httpOnly cookie")]

    Customer -->|"Browse / search / filter"| P1
    P1 --> S1
    P1 --> S2
    P1 -->|"Render"| Customer

    Customer -->|"Dates"| P2
    P2 -->|"POST rental-calculation"| S1
    P2 -->|"Breakdown"| Customer

    Customer -->|"Register / login / change password"| P3
    P3 --> S4
    P3 -->|"User state"| Customer

    Customer -->|"Review / comment forms"| P4
    P4 -->|"POST via proxy"| S1
    P4 -->|"Toast / inline errors"| Customer

    Moderator -->|"Approve / reject"| P5
    Admin -->|"Approve / reject"| P5
    P5 --> S3
    P5 -->|"PUT via proxy"| S1
    P5 -->|"Updated queue"| Moderator
    P5 -->|"Updated queue"| Admin

    Admin -->|"Create / edit tools and categories"| P6
    P6 -->|"PUT/POST via proxy"| S1
    P6 -->|"Result toast"| Admin

    Admin -->|"Upload / delete image"| P7
    P7 -->|"Multipart via proxy"| S1
    P7 -->|"Result"| Admin

    Admin -->|"Open dashboard"| P8
    P8 -->|"GET dashboard/stats"| S1
    P8 -->|"Cards + charts"| Admin
```

---

## 7. Routing Map

```mermaid
flowchart TD
    Root["/"]
    Equip["/equipment"]
    Cat["/equipment/[categoryId]"]
    Tool["/equipment/[categoryId]/[toolId]"]
    Services["/services"]
    Pricing["/pricing"]
    Contact["/contact"]
    Login["/login"]
    Register["/register"]
    Forgot["/forgot-password"]
    Reset["/reset-password"]
    Account["/account"]
    MyReviews["/account/reviews"]
    Admin["/admin"]
    AdminTools["/admin/tools"]
    AdminCats["/admin/categories"]
    AdminMod["/admin/moderation"]
    AdminDash["/admin/dashboard"]

    Root --> Equip --> Cat --> Tool
    Root --> Services
    Root --> Pricing
    Root --> Contact
    Root --> Login
    Root --> Register
    Login --> Forgot --> Reset
    Root --> Account --> MyReviews
    Root --> Admin --> AdminTools
    Admin --> AdminCats
    Admin --> AdminMod
    Admin --> AdminDash
```

---

## 8. Design Traceability Summary

| Diagram | Supports |
|---------|----------|
| Use Case Diagram | Functional scope for Epic 1–3 from the frontend perspective |
| Component Diagram | App Router + feature components + lib modules + DTO types |
| Activity Diagrams | Review submission UX, moderation UX |
| High-Level Architecture | Browser, Next.js host, API, blob storage, CI |
| Sequence Diagrams | Review submission flow, admin login + moderation queue, public catalogue rendering |
| DFD Context and Level 1 | Actors, system boundary, frontend processes, transient data stores |
| Routing Map | URL surface of the App Router |
