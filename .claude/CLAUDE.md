# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`
- **Find unused files/exports/dependencies**: `npx knip --workspace <path>` (config-free on this bun workspace) — run scoped to whatever package(s) you just touched whenever a change removes the last caller of something (a mechanism, a helper, a prop, a whole file), and delete what it flags that traces back to your change. See `.claude/skills/implement/SKILL.md` / `refactor/SKILL.md` / `code-review/SKILL.md`.

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## Monorepo Cross-Package Impact Check

This is a `bun` workspace monorepo (`apps/*`, `packages/*`). Before implementing or redesigning anything — a new package, a new env var, an auth/session flow, a shared service — **check whether a sibling package already owns part of it**:

- **Env vars**: `packages/env/src/schema.ts` (public) and `packages/env/src/index.ts` (server) are the single shared schema for every app. Grep there before adding a new `process.env.*` read or inventing a new var name — the one you need may already be declared.
- **Auth/session/HTTP**: `packages/api-client` owns the app's auth session (token exchange, cookies, refresh) and its backend endpoint contracts (`packages/api-client/src/services/*`). Grep there before writing a new fetch call or a new token-handling flow — the endpoint or session primitive you need may already exist.
- **Cross-cutting utilities**: `packages/core` (`@cs/core`) is the shared home for dependency-free TS helpers used by 2+ packages (starts with `@cs/core/jwt`). Check there — and consider adding to it, not to whichever package you're currently in — before reaching for an npm package or writing a new implementation of something generic (JWT decode, parsing, etc.). Only promote a helper here once a second real package needs it; don't pre-populate it speculatively.
- **General rule**: `grep`/`Grep` across `packages/*` (not just the package you're touching) for the env var name, service name, or concept before declaring a new one. Wire into what exists via a real workspace `dependencies` edge rather than duplicating it locally — a second implementation of the same contract is a correctness risk (header/body drift, subtly different edge-case behavior), not just a style issue.

This applies whether you're a single edit or an `architect`/`implementer` agent dispatch — cross-package overlap is easy to miss when working inside one package's directory, and duplication here has caused real bugs before.

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bun x ultracite fix` before committing to ensure compliance.
