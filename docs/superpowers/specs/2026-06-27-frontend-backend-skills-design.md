# Frontend & Backend Skills Design

**Date:** 2026-06-27
**Status:** Approved

## Goal

Create two general-purpose, industry-standard Claude Code skills stored in `.claude/skills/` so any developer working on this repo gets consistent, opinionated guidance when building frontend or backend features.

## Location

```
.claude/skills/
  frontend-standards/
  backend-standards/
```

## Frontend Skill — `frontend-standards`

**Stack:** Next.js + TypeScript + Tailwind CSS

### Files

| File | Contents |
|---|---|
| `SKILL.md` | Entry point: folder structure, component conventions, TypeScript rules, Tailwind, data fetching, SEO, performance, testing overview |
| `security.md` | HTTP headers, NextAuth/Auth.js, XSS, CSP, environment variables |
| `deployment.md` | Vercel config, env management, GitHub Actions CI, production checklist |

### Trigger

Auto-trigger when working on any Next.js component, page, layout, hook, or UI change.

## Backend Skill — `backend-standards`

**Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL

### Files

| File | Contents |
|---|---|
| `SKILL.md` | Entry point: folder structure, Express setup, TypeScript config, Prisma conventions, repository/service pattern, logging, testing overview |
| `api-design.md` | REST conventions, response envelope, Zod validation, pagination, HTTP status codes, OpenAPI |
| `security.md` | JWT auth, RBAC, rate limiting, input sanitization, CORS, Helmet, secrets management |
| `deployment.md` | Dockerfile, docker-compose, Prisma migrate in CI/CD, GitHub Actions, health check, production checklist |

### Trigger

Auto-trigger when working on routes, controllers, services, repositories, migrations, or auth.

## Scope

Both skills cover: file structure · naming conventions · key patterns · security · error handling · API design · environment config · testing patterns · performance · logging · CI/CD · deployment checklist.
