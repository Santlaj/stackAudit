# Container Diagram

## Purpose

Defines the major deployable applications and infrastructure components.

```mermaid
graph TD

Browser[Browser]

Frontend[Next.js Frontend]

Backend[Express Backend]

DB[(PostgreSQL)]

Redis[(Redis)]

Queue[BullMQ]

GitHub[GitHub API]

LLM[AI Provider]

Browser --> Frontend
Frontend --> Backend

Backend --> DB
Backend --> Redis
Backend --> Queue

Queue --> GitHub
Queue --> LLM
```

## Containers

| Container   | Responsibility             |
| ----------- | -------------------------- |
| Frontend    | User Interface             |
| Backend     | Business Logic             |
| PostgreSQL  | Persistent Storage         |
| Redis       | Cache & Sessions           |
| BullMQ      | Background Jobs            |
| GitHub      | External Repository Source |
| AI Provider | Repository Intelligence    |
