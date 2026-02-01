# Web Style Guide Implementation

## Changes

### 1. Prettier Import Sorting
- Installed `@trivago/prettier-plugin-sort-imports`.
- Configured `.prettierrc` to enforce import order:
    1. React
    2. Vite
    3. Alias imports (`@/...`)
    4. Relative imports (`./`, `../`)

### 2. ESLint Rules
- Installed `eslint-plugin-import`.
- Enabled `no-relative-parent-imports` rule in `eslint.config.js` to ensure imports from parent directories use the `@/` alias.
- Fixed existing linting errors.

### 3. Code Formatting
- Ran `bun run prettier --write .` to reformat the entire web project.
- Fixed ESLint errors in `login.tsx`.

## Verification
To verify the style guide rules:
1. Run `cd web && bun run prettier --check .` to check formatting.
2. Run `cd web && bun run eslint .` to check linting rules.
