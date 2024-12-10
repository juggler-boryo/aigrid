.PHONY: run lint

GOLINT=golangci-lint

COLOR_RESET=\033[0m
COLOR_CYAN=\033[36m
COLOR_GREEN=\033[32m

run: ## Run the application with hot reload using air
	@echo "${COLOR_GREEN}Starting development server with air...${COLOR_RESET}"
	air

lint: ## Run linter
	@echo "${COLOR_GREEN}Running linter...${COLOR_RESET}"
	$(GOLINT) run