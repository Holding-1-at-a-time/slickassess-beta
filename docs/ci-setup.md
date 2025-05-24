# CI/CD Setup Documentation

This document describes the CI/CD setup for the SlickAssess project.

## GitHub Actions Workflows

The project uses several GitHub Actions workflows to ensure code quality and automate deployment:

### 1. CI Workflow

The main CI workflow runs on every pull request and push to main branches. It includes:

- Linting with ESLint
- TypeScript type checking
- Unit tests with coverage
- Environment validation
- Next.js build verification
- Security scanning

### 2. Scheduled Tests

A scheduled workflow runs daily to execute the full test suite with real credentials.

### 3. Dependency Review

This workflow checks for vulnerable dependencies when package files change.

### 4. Convex Deployment

Automatically deploys Convex functions on merge to main.

## Local Development

Before committing code, the pre-commit hooks will run:

- Linting
- Type checking
- Unit tests

## Test Coverage

We aim to maintain at least 70% code coverage across the codebase.
