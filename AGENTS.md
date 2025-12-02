# Repository Guidelines

## Project Structure & Module Organization
Repo spans three services: `app/` (Vite + React TypeScript; feature screens in `src/pages`, reusable UI in `components`, data hooks in `apis`, utilities in `libs`, static assets in `public/`, build output in `dist/`), `server/` (Go API with `routes/`, `handlers/`, `models/`, shared helpers in `lib/`, credentials under `server/credentials/`), and `hub/` (Python Firebase-to-SwitchBot worker with `hub.service` and secrets in `hub/credentials/`). Use the root `Makefile` to start the app and API together.

## Build, Test, and Development Commands
- `make run` – from the repo root, launches `yarn dev` and the Go watcher via Air (install `air`).
- `cd app && yarn && yarn dev` – install dependencies and serve the UI; `yarn build` for production bundles, `yarn lint` for ESLint checks.
- `cd server && make run` – start the API; `make lint` runs `golangci-lint`, `go test ./...` executes backend tests.
- `cd hub && python -m pip install -r requirements.txt && python main.py` – set up and run the automation worker; adjust `hub.service` if the entry point changes.

## Coding Style & Naming Conventions
Frontend code follows the ESLint defaults: two-space indentation, double quotes, PascalCase components, camelCase hooks or utilities, and separation of UI (`components/`), API calls (`apis/`), and helpers (`libs/`). Go files must stay `gofmt`-clean with slim handlers delegating to shared packages, while Python scripts should mirror PEP 8, reuse the `logging` setup, and load secrets from the credential folders—not literals.

## Testing Guidelines
Add coverage alongside any changes: backend packages expect `*_test.go` siblings that pass `go test ./...`, frontend work should at minimum clear `yarn lint` and place new Vitest/RTL specs next to the component, and hub updates need dry-run notes or mocks so device triggers can be exercised.

## Commit & Pull Request Guidelines
History shows single-word commits such as `nyan`; replace them with descriptive `<area>: <summary>` messages. Reference related issues, list the commands or tests you ran, and highlight any configuration or credential steps reviewers must perform. UI-facing PRs should include screenshots, while backend work should outline API impacts and rollback considerations.

## Security & Configuration Tips
Service account JSON files inside `server/credentials/` and `hub/credentials/` stay local—never commit them. Provide refreshed `.example` files or setup notes when paths change, load secrets via environment variables or config files, and confirm `gcloud run deploy aigrid ...` uses the latest Go build while `hub.service` points to the current Python entry point.
