# API Guide

Base URL: `/api`

> **Authentication:** Most endpoints require a JWT Bearer token in the `Authorization` header (`Authorization: Bearer <access_token>`). The `/api/auth/authenticate` and `/api/auth/register` endpoints are public.

---

## Authentication

### Login

`POST /api/auth/authenticate`

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Authentication successful |
| 401 | Invalid credentials |

**Response Body (200)**
```json
{
  "access_token": "string"
}
```

> A `refreshToken` cookie is also set on the response.

---

### Register

`POST /api/auth/register`

**Request Body**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 201 | User registered successfully |
| 400 | Invalid input format |
| 409 | User already exists |

---

### Refresh Token

`POST /api/auth/refresh`

Generates new access and refresh tokens using the refresh token cookie. No request body required.

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Token refreshed successfully |
| 401 | Invalid or expired refresh token |

**Response Body (200)**
```json
{
  "access_token": "string"
}
```

> A new `refreshToken` cookie is set on the response (token rotation).

---

### Validate Token

`GET /api/auth/validateToken`

Checks if the current access token is valid. Requires Bearer token.

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Token is valid |
| 401 | Invalid or expired token |

---

### Logout

`POST /api/auth/logout`

Revokes all valid tokens for the currently authenticated user. Requires Bearer token.

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Logout successful |
| 401 | Unauthorized |

---

## Projects

### Create Project

`POST /api/projects`

**Request Body**
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2026-12-31T00:00:00.000Z"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 201 | Project created successfully |
| 400 | Invalid request |

**Response Body (201)**
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "dueDate": "2026-12-31T00:00:00.000Z",
  "isArchived": false,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-01T10:00:00",
  "tasks": []
}
```

---

### Get Project by ID

`GET /api/projects/{projectId}`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the project |

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Project retrieved successfully |
| 404 | Project not found |

**Response Body (200)** — same shape as Create Project response.

---

### Get All Projects

`GET /api/projects`

Returns all projects accessible to the current context.

**Responses**

| Status | Description |
|--------|-------------|
| 200 | List of projects |

**Response Body (200)**
```json
[
  {
    "id": 1,
    "title": "string",
    "description": "string",
    "dueDate": "2026-12-31T00:00:00.000Z",
    "isArchived": false,
    "createdAt": "2026-01-01T10:00:00",
    "updatedAt": "2026-01-01T10:00:00",
    "tasks": []
  }
]
```

---

### Update Project

`PUT /api/projects/{projectId}`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the project |

**Request Body**
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2026-12-31T00:00:00.000Z"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Project updated successfully |
| 404 | Project not found |

---

### Archive Project

`PATCH /api/projects/{projectId}/archive`

Marks the project as archived. No request body required.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the project |

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Project archived successfully |
| 404 | Project not found |

---

### Add User to Project

`POST /api/projects/{projectId}/users`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the project |

**Request Body**
```json
{
  "userEmail": "user@example.com"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | User added successfully |
| 404 | Project or user not found |

---

## Tasks

All task endpoints are nested under a project: `/api/projects/{projectId}/tasks`

**Task Status Values**

| Value | Description |
|-------|-------------|
| `TODO` | Not yet started |
| `IN_PROGRESS` | Currently being worked on |
| `DONE` | Completed |

---

### Create Task

`POST /api/projects/{projectId}/tasks`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the parent project |

**Request Body**
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2026-12-31T00:00:00.000Z",
  "status": "TODO"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 201 | Task created successfully |
| 400 | Invalid request |
| 404 | Project not found |

**Response Body (201)**
```json
{
  "id": 1,
  "projectId": 1,
  "title": "string",
  "description": "string",
  "status": "TODO",
  "dueDate": "2026-12-31T00:00:00.000Z",
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-01T10:00:00"
}
```

---

### Get Task by ID

`GET /api/projects/{projectId}/tasks/{taskId}`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the parent project |
| taskId | integer | ID of the task |

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Task retrieved successfully |
| 404 | Task not found |

**Response Body (200)** — same shape as Create Task response.

---

### Get All Project Tasks

`GET /api/projects/{projectId}/tasks`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the project |

**Responses**

| Status | Description |
|--------|-------------|
| 200 | List of tasks |
| 404 | Project not found |

**Response Body (200)**
```json
[
  {
    "id": 1,
    "projectId": 1,
    "title": "string",
    "description": "string",
    "status": "TODO",
    "dueDate": "2026-12-31T00:00:00.000Z",
    "createdAt": "2026-01-01T10:00:00",
    "updatedAt": "2026-01-01T10:00:00"
  }
]
```

---

### Get Project Tasks (Paginated)

`GET /api/projects/{projectId}/tasks/paginated`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the project |

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Page number (0-based) |
| size | integer | 10 | Number of tasks per page |

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Paginated tasks retrieved successfully |
| 404 | Project not found |

**Response Body (200)**
```json
{
  "content": [ /* array of task objects */ ],
  "totalElements": 25,
  "totalPages": 3,
  "size": 10,
  "number": 0
}
```

---

### Update Task

`PUT /api/projects/{projectId}/tasks/{taskId}`

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the parent project |
| taskId | integer | ID of the task |

**Request Body**
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2026-12-31T00:00:00.000Z",
  "status": "IN_PROGRESS"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Task updated successfully |
| 404 | Task not found |

---

### Update Task Status

`PATCH /api/projects/{projectId}/tasks/{taskId}/status`

Updates only the status field of a task.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the parent project |
| taskId | integer | ID of the task |

**Request Body**
```json
{
  "status": "DONE"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Task status updated successfully |
| 404 | Task not found |

---

### Delete Task

`DELETE /api/projects/{projectId}/tasks/{taskId}`

Permanently deletes a task. No request body required.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | integer | ID of the parent project |
| taskId | integer | ID of the task |

**Responses**

| Status | Description |
|--------|-------------|
| 204 | Task deleted successfully |
| 404 | Task not found |
