# Task API 📋

A production-oriented REST API for task management, built with **Node.js, TypeScript, and Express 5**.

The project follows a layered architecture with clear separation of concerns, centralized error handling, input validation, dependency injection, security middleware, and a swappable repository layer.

---

## 📋 Requirements

* **Node.js** v20 or later
* **npm** v9 or later

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd task-api
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Update the values in `.env` according to your environment.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## ⚙️ Environment Variables

| Variable      | Required        | Default       | Description                                        |
| ------------- | --------------- | ------------- | -------------------------------------------------- |
| `PORT`        | No              | `3000`        | Port used by the HTTP server                       |
| `CORS_ORIGIN` | Production only | —             | Comma-separated list of allowed origins            |
| `NODE_ENV`    | No              | `development` | Runtime environment: `development` or `production` |

### Example

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

> ⚠️ **Security:** Never commit your `.env` file to GitHub. Commit only `.env.example`.

---

## 🛠️ Available Commands

| Command                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Start the development server with automatic restart   |
| `npm run build`         | Compile the project for production                    |
| `npm run typecheck`     | Run TypeScript type checking without generating files |
| `npm test`              | Run the test suite once                               |
| `npm run test:watch`    | Run tests in watch mode                               |
| `npm run test:coverage` | Generate a test coverage report                       |

---

# 🔌 API Endpoints

## Health Checks

Health endpoints are available without authentication.

### Liveness

```http
GET /health/live
```

Response:

```json
{
  "status": "ok"
}
```

### Readiness

```http
GET /health/ready
```

Response:

```json
{
  "status": "ready"
}
```

---

# 📋 Tasks API

All task endpoints require an `Authorization` header.

| Method   | Endpoint            | Description                                        |
| -------- | ------------------- | -------------------------------------------------- |
| `POST`   | `/api/v1/tasks`     | Create a new task                                  |
| `GET`    | `/api/v1/tasks`     | List tasks with filtering, sorting, and pagination |
| `GET`    | `/api/v1/tasks/:id` | Retrieve a single task                             |
| `PATCH`  | `/api/v1/tasks/:id` | Update an existing task                            |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task                                      |

---

## ➕ Create a Task

### Request

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Buy milk",
    "dueDate": "2026-12-31T23:59:00.000Z"
  }'
```

### Response — `201 Created`

```json
{
  "data": {
    "id": "t_abc123",
    "title": "Buy milk",
    "done": false,
    "dueDate": "2026-12-31T23:59:00.000Z",
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:00:00.000Z"
  }
}
```

The API also returns a `Location` header pointing to the newly created resource:

```http
Location: /api/v1/tasks/t_abc123
```

---

## 📑 List Tasks

Tasks can be filtered, sorted, and paginated using query parameters.

### Example

```bash
curl "http://localhost:3000/api/v1/tasks?limit=10&sort=-createdAt&done=false" \
  -H "Authorization: Bearer <token>"
```

### Supported Query Parameters

| Parameter | Description                                    |
| --------- | ---------------------------------------------- |
| `limit`   | Number of tasks to return, between 1 and 100   |
| `cursor`  | Cursor used for pagination                     |
| `done`    | Filter by completion status: `true` or `false` |
| `sort`    | Sort by `createdAt`, `-createdAt`, or `title`  |

---

# 🏗️ Project Structure

```text
src/
├── app.ts
│   └── Express application configuration
│       (middleware, routes, error handling)
│
├── server.ts
│   └── Application entry point and graceful shutdown
│
├── types/
│   └── express.d.ts
│       └── Custom Express Request type definitions
│
├── middleware/
│   ├── auth.ts
│   │   └── Authentication middleware
│   │
│   ├── errorHandler.ts
│   │   └── Centralized error handling
│   │
│   ├── requestId.ts
│   │   └── Request ID generation and propagation
│   │
│   └── validate.ts
│       └── Request validation using Zod
│
├── shared/
│   └── errors/
│       └── AppError.ts
│           └── Application-specific error classes
│
└── modules/
    └── tasks/
        ├── tasks.types.ts
        │   └── Task domain types
        │
        ├── tasks.schema.ts
        │   └── Zod validation and response schemas
        │
        ├── tasks.repository.ts
        │   └── Repository interface / abstraction
        │
        ├── inMemoryTasks.repository.ts
        │   └── In-memory repository implementation
        │
        ├── tasks.service.ts
        │   └── Business logic
        │
        ├── tasks.controller.ts
        │   └── HTTP ↔ Service translation
        │
        └── tasks.routes.ts
            └── Route definitions and dependency wiring

tests/
├── tasks.service.test.ts
│   └── Unit tests for the service layer
│
└── tasks.api.test.ts
    └── API / integration tests
```

---

# 🏛️ Architecture

The application follows a layered architecture with clear separation of responsibilities.

```text
                    HTTP Request
                         │
                         ▼
              ┌─────────────────────┐
              │      Middleware     │
              │                     │
              │ requestId           │
              │ helmet              │
              │ cors                │
              │ rateLimit           │
              │ json parser         │
              │ auth                │
              │ validation          │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │       Router        │
              │  tasks.routes.ts    │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │     Controller      │
              │ tasks.controller.ts │
              │                     │
              │ HTTP ↔ Service      │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │      Service        │
              │  tasks.service.ts   │
              │                     │
              │   Business Logic    │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │     Repository      │
              │ TasksRepository     │
              │                     │
              │ Data Access         │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ In-Memory Repository │
              │                     │
              │ Current DB Adapter  │
              └─────────────────────┘
```

### Why this architecture?

Each layer has a single responsibility.

For example, the **Service** does not know whether the data is stored in memory, PostgreSQL, MongoDB, or another database.

The Service depends on the `TasksRepository` interface:

```ts
class TasksService {
  constructor(
    private readonly repository: TasksRepository
  ) {}
}
```

This allows the repository implementation to be replaced without changing the business logic.

For example:

```ts
const repository = new InMemoryTasksRepository();
```

can later become:

```ts
const repository = new PostgresTasksRepository();
```

without requiring changes to the Service or Controller.

---

# 🔐 Security

The API includes several security mechanisms.

## Helmet

**Helmet** adds commonly recommended HTTP security headers to help protect the application against various browser-based attacks.

```ts
app.use(helmet());
```

---

## CORS

Cross-Origin Resource Sharing is restricted to explicitly configured origins.

```env
CORS_ORIGIN=https://myapp.com,https://admin.myapp.com
```

This prevents arbitrary websites from making browser-based requests to the API.

---

## Rate Limiting

The API limits excessive requests to reduce abuse and resource exhaustion.

Current configuration:

```text
100 requests
per IP
every 15 minutes
```

This is implemented using `express-rate-limit`.

---

## Input Validation

All external input is validated using **Zod** before reaching the business logic.

This includes:

* Request bodies
* URL parameters
* Query parameters

Example:

```ts
const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  done: z.boolean().default(false),
  dueDate: z.string().datetime().optional(),
});
```

Invalid input is rejected with a structured validation error.

---

## Authentication

Protected endpoints require an `Authorization` header:

```http
Authorization: Bearer <token>
```

The current authentication implementation is intentionally lightweight and can be replaced with a production-ready authentication mechanism such as **JWT** without changing the rest of the application architecture.

---

## Data Masking

Internal fields are never exposed directly through API responses.

For example, the internal `Task` entity may contain:

```ts
{
  id: string;
  ownerId: string;
  title: string;
  done: boolean;
  ...
}
```

However, `ownerId` is intentionally excluded from the public API response.

The response is transformed through a dedicated response schema:

```ts
toTaskResponse(task)
```

This creates a clear boundary between internal domain data and the public API contract.

---

# 🧪 Testing

The project separates tests into two main categories.

### Unit Tests

`tasks.service.test.ts`

Tests the business logic independently from HTTP and Express.

Examples include:

* Creating tasks
* Retrieving tasks
* Updating tasks
* Deleting tasks
* Ownership checks
* Error scenarios

### Integration / API Tests

`tasks.api.test.ts`

Tests the API through the HTTP layer.

Examples include:

* Authentication
* Request validation
* HTTP status codes
* Response structure
* Routing
* Error handling
* Task CRUD operations

This separation makes it easier to identify whether a problem exists in the business logic or in the HTTP/API layer.

---

# 🧱 Design Principles

The project is built around several important software engineering principles:

### Separation of Concerns

Each layer has one primary responsibility.

### Dependency Injection

Dependencies are provided from outside instead of being hardcoded inside business logic.

### Programming to Interfaces

Business logic depends on abstractions rather than concrete database implementations.

### Centralized Error Handling

Errors are handled in one place instead of duplicating error-handling logic across controllers.

### Runtime Validation

TypeScript protects the application during development, while Zod validates untrusted runtime input.

### Explicit API Contracts

Input and output schemas define exactly what the API accepts and returns.

### Replaceable Data Access

The repository abstraction allows the in-memory implementation to be replaced with a real database implementation later.

---

# 📌 Current Repository Implementation

The project currently uses an **in-memory repository**:

```text
InMemoryTasksRepository
```

This means task data is stored in application memory and will be lost when the server restarts.

The repository abstraction is intentionally designed so that a persistent database such as PostgreSQL can be introduced later without rewriting the Service or Controller layers.

---

# 🔄 Request Lifecycle

A typical authenticated request follows this flow:

```text
Client
  │
  │ HTTP Request
  ▼
requestId
  │
  ▼
Helmet
  │
  ▼
CORS
  │
  ▼
Rate Limiter
  │
  ▼
JSON Parser
  │
  ▼
Authentication
  │
  ▼
Zod Validation
  │
  ▼
Router
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Repository
  │
  ▼
Data Store
```

The response then travels back through the application and is returned to the client as a structured JSON response.

---

# 📄 License

This project is currently for educational and development purposes.
