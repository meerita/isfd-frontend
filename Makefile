BUN ?= bun
TREE_DEPTH ?= 10
TREE_IGNORE := .git|node_modules|.next|out|dist|build|coverage|tmp|.idea|.vscode|.DS_Store
PASTE_OUTPUT := PASTE.md

.DEFAULT_GOAL := help

.PHONY: \
	help \
	dev \
	build \
	start \
	lint \
	skills-list \
	skills-install \
	tree \
	tree-copy \
	copy-paste \
	create-empty

help:
	@echo "Available targets:"
	@echo ""
	@echo "Frontend:"
	@echo "  make dev                    - Start the Next.js development server"
	@echo "  make build                  - Build the frontend"
	@echo "  make start                  - Start the production server"
	@echo "  make lint                   - Run ESLint"
	@echo "  make skills-list            - List installed skills"
	@echo "  make skills-install         - Install local project skills"
	@echo ""
	@echo "LLM:"
	@echo "  make tree-copy [DEPTH=10]     - Copy project tree to clipboard"
	@echo "  make tree [DEPTH=10]          - Alias of tree-copy"
	@echo "  make copy-paste FILES=\"...\"   - Generate root PASTE.md from selected files"
	@echo "  make create-empty FILES=\"...\" - Create multiple empty files"
	@echo ""

dev:
	$(BUN) dev

build:
	$(BUN) run build

start:
	$(BUN) run start

lint:
	$(BUN) run lint

skills-list:
	$(BUN) run skills:list

skills-install:
	$(BUN) run skills:install

tree-copy:
	@command -v tree >/dev/null 2>&1 || (echo "Missing 'tree' command"; exit 1)
	@command -v pbcopy >/dev/null 2>&1 || (echo "Missing 'pbcopy' command"; exit 1)
	@tree -a -L $(if $(DEPTH),$(DEPTH),$(TREE_DEPTH)) \
		-I '$(TREE_IGNORE)' \
		| pbcopy
	@echo "Copied tree to clipboard (depth $(if $(DEPTH),$(DEPTH),$(TREE_DEPTH)))"

tree: tree-copy

copy-paste:
	@if [ -z "$(FILES)" ]; then \
		echo "Missing FILES"; \
		echo 'Usage: make copy-paste FILES="package.json src/app/page.tsx README.md"'; \
		exit 1; \
	fi
	@rm -f "$(PASTE_OUTPUT)"
	@for file in $(FILES); do \
		if [ ! -f "$$file" ]; then \
			echo "File not found: $$file"; \
			exit 1; \
		fi; \
		{ \
			printf '## `%s`\n\n' "$$file"; \
			printf '```\n'; \
			cat "$$file"; \
			printf '\n```\n\n'; \
		} >> "$(PASTE_OUTPUT)"; \
	done
	@echo "Generated $(PASTE_OUTPUT)"

create-empty:
	@if [ -z "$(FILES)" ]; then \
		echo "Missing FILES"; \
		echo 'Usage: make create-empty FILES="src/_components/NewComponent.tsx src/_styles/new-component.css"'; \
		exit 1; \
	fi
	@for file in $(FILES); do \
		mkdir -p "$$(dirname "$$file")"; \
		touch "$$file"; \
	done
	@echo "Created files: $(FILES)"
