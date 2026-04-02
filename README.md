# 🚀 EngineerFlow

> **Production-Ready Engineering Job Request Management System**  
> Built with C# / .NET 8 · Angular 18 · SQLite · Entity Framework Core · Material Design

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Features

### 🎯 Core Functionality
- **📝 Create Requests** — Submit engineering job requests with rich metadata (title, description, priority, category, assignee, due date)
- **📋 Advanced Request Management** — Searchable, filterable, sortable list with priority and status badges
- **🔄 Status Workflow** — Seamless status transitions (Open → In Progress → On Hold → Completed / Cancelled)
- **✅ Completion Tracking** — Dedicated completion forms with resolution notes, duration tracking, and timestamps
- **📊 Real-time Dashboard** — Live summary statistics with trend indicators and quick actions
- **⚠️ Smart Alerts** — Visual indicators for overdue requests and critical priorities
- **🎨 Modern UI/UX** — Material Design with dark theme, responsive layout, and smooth animations
- **📁 Compliance Audit Trail** — Verifiable action history for every request (tracking creation, status changes, and assignments)

### 🚀 Production Features
- **🔒 Security** — Input validation, XSS protection, CORS configuration
- **📈 Performance** — Optimized queries, lazy loading, efficient caching
- **🔍 Monitoring** — Health checks, structured logging, error tracking
- **📱 Responsive** — Mobile-first design, touch-friendly interactions
- **🌐 Deployment Ready** — Docker support, IIS/Nginx configurations, CI/CD ready
- **📚 API Documentation** — Interactive Swagger/Scalar documentation
- **🎭 Rich Sample Data** — Realistic engineering scenarios for immediate evaluation

---

## 🏗️ Architecture

### Tech Stack
| **Backend** | ASP.NET Core 10 (Preview) | Mature, performant, strongly typed with built-in DI |
| **Frontend** | Angular 18 (Standalone) | Modern component architecture, excellent tooling |
| **Database** | SQLite via EF Core | Zero-install, portable, fully relational |
| **ORM** | Entity Framework Core 10 | Code-First migrations, LINQ, change tracking |
| **UI Framework** | Angular Material + Custom SCSS | Accessible components with full design control |
| **API Docs** | Swagger/OpenAPI + Scalar | Interactive testing and beautiful documentation |
| **Deployment** | Docker & Render.com | Fully containerized with one-click cloud deployment |

### Design Principles
- **🎯 Domain-Driven Design** — Clear separation of concerns with service layer
- **🔄 CQRS Pattern** — Separate DTOs for commands and queries
- **📦 Dependency Injection** — Loose coupling and testability
- **🛡️ Defensive Programming** — Comprehensive validation and error handling
- **📊 Performance First** — Optimized queries and efficient data loading

---

## 📁 Project Structure

```
EngineerFlow/
├── 🔧 backend/
│   ├── EngineerFlow.API/
│   │   ├── Controllers/         # HTTP endpoints - thin, focused
│   │   ├── DTOs/                # Request/response contracts
│   │   ├── Models/              # EF Core entities
│   │   ├── Services/            # Business logic layer
│   │   ├── Data/                # DbContext + migrations
│   │   └── Program.cs           # Application composition root
│   └── EngineerFlow.Tests/      # Comprehensive unit tests
├── 🎨 frontend/
│   └── engineerflow-ui/
│       └── src/app/
│           ├── core/            # Models, services, interceptors
│           ├── features/        # Feature modules (Dashboard, Requests)
│           ├── shared/          # Reusable components, pipes
│           └── styles/          # Global styles, themes
├── 🚀 deployment/
│   ├── docker/                  # Docker configurations
│   ├── nginx/                   # Nginx configurations
│   └── scripts/                 # Deployment scripts
├── 📚 docs/                     # Additional documentation
├── 🎬 start.ps1                # One-click Windows startup
├── 🐳 docker-compose.yml       # Container orchestration
├── 📋 DEPLOYMENT.md            # Production deployment guide
└── 🏗️ ARCHITECTURE.md          # Detailed architecture decisions
```

---

## ⚡ Quick Start

### Prerequisites
| Tool | Version | Download |
|---|---|---|
| **.NET SDK** | 8.0+ | [Download](https://dotnet.microsoft.com/download) |
| **Node.js** | 18.x+ | [Download](https://nodejs.org) |
| **Angular CLI** | 18.x+ | `npm install -g @angular/cli` |

### 🚀 One-Click Setup (Recommended)

```powershell
git clone https://github.com/yourusername/engineerflow.git
cd EngineerFlow
.\start.ps1
```

### 🔑 Default Login Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin |
| `engineer` | `engineer123` | Engineer |

> You can also register a new account at `/register`

**The script automatically:**
1. ✅ Validates prerequisites (.NET 8, Node.js)
2. 📦 Restores NuGet packages
3. 🗄️ Runs EF Core migrations (creates `engineerflow.db`)
4. 🌱 Seeds realistic sample data
5. 🔧 Starts API server on `http://localhost:5000`
6. 📦 Installs npm dependencies
7. 🎨 Launches Angular dev server on `http://localhost:4200`
8. 🌐 Opens browser automatically

### 🔧 Manual Setup

**Backend:**
```bash
cd backend/EngineerFlow.API
dotnet restore
dotnet ef database update
dotnet run --urls=http://localhost:5000
```

**Frontend (new terminal):**
```bash
cd frontend/engineerflow-ui
npm install
ng serve --open
```

### 🌐 Access Points
| Service | URL | Description |
|---|---|---|
| **Live Demo** | [https://engineer-flow.onrender.com](https://engineer-flow.onrender.com) | **Stable Production Environment** |
| **Application (Local)** | http://localhost:8080 | Main application interface (Docker) |
| **API Docs** | http://localhost:8080/scalar/v1 | Interactive API documentation |
| **Health Check** | http://localhost:8080/health | Application health status |

---

## 🔌 API Reference

### Core Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobrequests` | List all requests (with filtering) |
| `POST` | `/api/jobrequests` | Create new request |
| `GET` | `/api/jobrequests/{id}` | Get single request |
| `PUT` | `/api/jobrequests/{id}` | Update request |
| `PATCH` | `/api/jobrequests/{id}/status` | Update status only |
| `POST` | `/api/jobrequests/{id}/complete` | Record completion |
| `DELETE` | `/api/jobrequests/{id}` | Delete request |
| `GET` | `/api/jobrequests/summary` | Dashboard statistics |

### Query Parameters (GET /api/jobrequests)
- `status` — Filter by status (Open, InProgress, OnHold, Completed, Cancelled)
- `priority` — Filter by priority (Low, Medium, High, Critical)
- `search` — Full-text search (title, description, requester)
- `sortBy` — Sort field (createdAt, updatedAt, priority, dueDate)
- `descending` — Sort direction (true/false)

### Example Requests

**Create Request:**
```json
POST /api/jobrequests
{
  "title": "Implement OAuth 2.0 Integration",
  "description": "Add support for Google and Microsoft OAuth providers",
  "requesterName": "Product Manager",
  "assignedTo": "Sarah Chen",
  "priority": 2,
  "category": "Feature Request",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

**Record Completion:**
```json
POST /api/jobrequests/123/complete
{
  "completedBy": "Sarah Chen",
  "durationMinutes": 240,
  "resolutionSummary": "OAuth integration completed successfully",
  "notes": "Implemented Google and Microsoft providers with proper error handling"
}
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend/EngineerFlow.Tests
dotnet test --verbosity normal --collect:"XPlat Code Coverage"
```

### Run Frontend Tests
```bash
cd frontend/engineerflow-ui
npm run test
npm run e2e
```

### API Testing
Use the interactive API documentation at `/scalar/v1` to test all endpoints with real data.

---

## 🚀 Production Deployment

### Quick Deploy with Docker
```bash
docker-compose up -d
```

### Manual Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guides covering:
- 🪟 **Windows Server + IIS**
- 🐧 **Linux + Nginx**
- 🐳 **Docker + Docker Compose**
- ☁️ **Cloud Platforms (Azure, AWS)**
- 🔒 **SSL/TLS Configuration**
- 📊 **Monitoring & Logging**

---

## 🤖 AI & Automation Usage

This application was developed using **Advanced Agentic AI (Antigravity)** to ensure high-speed delivery without compromising on production quality.

### 🚀 How AI Enhanced Development

**1. Architectural Scaffolding:**
- **EF Core Baseline:** AI generated the initial entity models (`JobRequest`, `CompletionEvent`) and established the Code-First migration patterns.
- **Angular Feature Modules:** The dashboard and request management features were scaffolded as Standalone components, following Angular 18 best practices.

**2. Data Automation:**
- **Realistic Seeding:** AI was used to generate 30+ realistic engineering scenarios, including diverse categories (Bug, Feature, Infrastructure) and varying priorities.
- **Temporal Logic:** AI ensured that seeded dates followed a logical distribution (past completions, future due dates, and overdue alerts).

**3. Optimization & Refinement:**
- **LINQ Queries:** AI suggested `Include()` strategies and optimized `AsQueryable()` filtering to prevent performance bottlenecks.
- **UI/UX Polish:** AI helped scaffold the CSS design system (glassmorphism, dark mode) and suggested the SignalR real-time synchronization logic.
- **Code Hardening:** AI identified and fixed edge cases in status transitions and provided the initial unit test suite for the service layer.

### 🛡️ Human-Led Decisions
- **Portability First:** The choice of **SQLite** was a deliberate human decision to ensure the app is "portable" and runs on Windows with zero external dependencies.
- **Security Posture:** Manual review and hardening of the JWT authentication flow and CORS policies.
- **Architecture Choice:** Decision to use a Service-Layer pattern over a full Repository pattern to keep the app "small and portable" while maintaining clean separation of concerns.

---

## 🗃️ Database Schema

```sql
-- Auto-generated via EF Core migrations
JobRequests
├── Id (PK, int, Identity)
├── Title (nvarchar(200), Required)
├── Description (nvarchar(2000), Required)
├── RequesterName (nvarchar(100), Required)
├── AssignedTo (nvarchar(100), Nullable)
├── Priority (int, 0-3: Low, Medium, High, Critical)
├── Status (int, 0-4: Open, InProgress, OnHold, Completed, Cancelled)
├── Category (nvarchar(50), Nullable)
├── CreatedAt (datetime2, Default: GETUTCDATE())
├── UpdatedAt (datetime2, Auto-updated)
├── DueDate (datetime2, Nullable)
└── CompletionEvent (1:1 relationship)

CompletionEvents
├── Id (PK, int, Identity)
├── JobRequestId (FK → JobRequests.Id)
├── CompletedBy (nvarchar(100), Required)
├── CompletedAt (datetime2, Default: GETUTCDATE())
├── Notes (nvarchar(2000), Nullable)
├── DurationMinutes (int, Nullable)
└── ResolutionSummary (nvarchar(500), Nullable)
```

**Database Features:**
- 🔄 **Auto-migrations** — Database created/updated on startup
- 🌱 **Rich seed data** — 30+ realistic engineering requests
- 📊 **Optimized queries** — Proper indexing and eager loading
- 🔒 **Data validation** — Model-level and database constraints
- 💾 **Portable** — Single SQLite file, easy backup/restore

---

## 🏆 Production Features

### 🔒 Security
- ✅ Input validation and sanitization
- ✅ XSS protection headers
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)
- ✅ Error handling without information disclosure

### 📈 Performance
- ✅ Optimized database queries with eager loading
- ✅ Angular OnPush change detection
- ✅ Lazy loading for feature modules
- ✅ Response compression
- ✅ Efficient pagination and filtering

### 🔍 Monitoring
- ✅ Health check endpoints (`/health`, `/health/ready`, `/health/live`)
- ✅ Structured logging with Serilog
- ✅ Application metrics and performance counters
- ✅ Error tracking and alerting

### 🎨 User Experience
- ✅ Responsive design (mobile-first)
- ✅ Dark theme with system preference detection
- ✅ Loading states and progress indicators
- ✅ Toast notifications and user feedback
- ✅ Keyboard navigation and accessibility

### 🚀 DevOps Ready
- ✅ Docker containerization
- ✅ CI/CD pipeline configurations
- ✅ Environment-specific configurations
- ✅ Database migration automation
- ✅ Health monitoring and alerting

---

## 📊 Sample Data

The application ships with **30+ realistic engineering requests** including:

- 🔴 **Critical Issues** — Production outages, security vulnerabilities
- 🟡 **High Priority** — Performance optimizations, feature implementations
- 🔵 **Medium Priority** — Code maintenance, documentation updates
- ⚪ **Low Priority** — Dependency updates, refactoring tasks

**Categories Include:**
- 🐛 Bug Fix
- ✨ Feature Request
- 🏗️ Infrastructure
- 📚 Documentation
- 🔒 Security
- ⚡ Performance
- 🔧 Maintenance
- 🔬 Research

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Microsoft** — .NET 8 and Entity Framework Core
- **Google** — Angular framework and Material Design
- **Community** — Open source libraries and tools
- **AI Tools** — Development acceleration and code generation

---

## 📞 Support

- 📖 **Documentation** — Check [ARCHITECTURE.md](ARCHITECTURE.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 **Issues** — Report bugs via GitHub Issues
- 💡 **Feature Requests** — Suggest improvements via GitHub Discussions
- 📧 **Contact** — [support@engineerflow.com](mailto:support@engineerflow.com)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

**Built with ❤️ for the engineering community**

[🚀 Get Started](#-quick-start) • [📚 Documentation](ARCHITECTURE.md) • [🚀 Deploy](DEPLOYMENT.md) • [🤝 Contribute](#-contributing)

</div>