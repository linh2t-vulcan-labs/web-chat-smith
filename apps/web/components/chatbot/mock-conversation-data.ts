import type { ToolUIPart } from "ai";
import { nanoid } from "nanoid";

interface MessageAttachment {
  id: string;
  filename: string;
  mediaType: string;
  url: string;
}

interface MessageChainOfThoughtStep {
  label: string;
  description?: string;
  status: "complete" | "active" | "pending";
}

interface MessageTask {
  title: string;
  items: string[];
}

interface MessagePlan {
  title: string;
  description: string;
  steps: string[];
}

interface MessageQueueItem {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "completed";
}

interface MessageQueue {
  label: string;
  items: MessageQueueItem[];
}

interface MessageConfirmation {
  id: string;
  title: string;
  description: string;
}

export interface MessageArtifact {
  title: string;
  description: string;
  filename: string;
  language: string;
  content: string;
}

interface MessageCitation {
  text: string;
  sources: { title: string; url: string; description?: string }[];
}

export interface MessageType {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  attachments?: MessageAttachment[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  chainOfThought?: MessageChainOfThoughtStep[];
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart["state"];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
  task?: MessageTask;
  plan?: MessagePlan;
  queue?: MessageQueue;
  citation?: MessageCitation;
  confirmation?: MessageConfirmation;
  checkpoint?: string;
  artifact?: MessageArtifact;
}

export const initialMessages: MessageType[] = [
  {
    from: "user",
    key: nanoid(),
    versions: [
      {
        content: "Can you explain how to use React hooks effectively?",
        id: nanoid(),
      },
    ],
  },
  {
    from: "assistant",
    key: nanoid(),
    sources: [
      {
        href: "https://react.dev/reference/react",
        title: "React Documentation",
      },
      {
        href: "https://react.dev/reference/react-dom",
        title: "React DOM Documentation",
      },
    ],
    tools: [
      {
        description: "Searching React documentation",
        error: undefined,
        name: "mcp",
        parameters: {
          query: "React hooks best practices",
          source: "react.dev",
        },
        result: `{
  "query": "React hooks best practices",
  "results": [
    {
      "title": "Rules of Hooks",
      "url": "https://react.dev/warnings/invalid-hook-call-warning",
      "snippet": "Hooks must be called at the top level of your React function components or custom hooks. Don't call hooks inside loops, conditions, or nested functions."
    },
    {
      "title": "useState Hook",
      "url": "https://react.dev/reference/react/useState",
      "snippet": "useState is a React Hook that lets you add state to your function components. It returns an array with two values: the current state and a function to update it."
    },
    {
      "title": "useEffect Hook",
      "url": "https://react.dev/reference/react/useEffect",
      "snippet": "useEffect lets you synchronize a component with external systems. It runs after render and can be used to perform side effects like data fetching."
    }
  ]
}`,
        status: "input-available",
      },
    ],
    versions: [
      {
        content: `# React Hooks Best Practices

React hooks are a powerful feature that let you use state and other React features without writing classes. Here are some tips for using them effectively:

## Rules of Hooks

1. **Only call hooks at the top level** of your component or custom hooks
2. **Don't call hooks inside loops, conditions, or nested functions**

## Common Hooks

- **useState**: For local component state
- **useEffect**: For side effects like data fetching
- **useContext**: For consuming context
- **useReducer**: For complex state logic
- **useCallback**: For memoizing functions
- **useMemo**: For memoizing values

## Example of useState and useEffect

\`\`\`jsx
function ProfilePage({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // This runs after render and when userId changes
    fetchUser(userId).then(userData => {
      setUser(userData);
    });
  }, [userId]);

  return user ? <Profile user={user} /> : <Loading />;
}
\`\`\`

Would you like me to explain any specific hook in more detail?`,
        id: nanoid(),
      },
    ],
  },
  {
    from: "user",
    key: nanoid(),
    versions: [
      {
        content:
          "Yes, could you explain useCallback and useMemo in more detail? When should I use one over the other?",
        id: nanoid(),
      },
      {
        content:
          "I'm particularly interested in understanding the performance implications of useCallback and useMemo. Could you break down when each is most appropriate?",
        id: nanoid(),
      },
      {
        content:
          "Thanks for the overview! Could you dive deeper into the specific use cases where useCallback and useMemo make the biggest difference in React applications?",
        id: nanoid(),
      },
    ],
  },
  {
    from: "assistant",
    key: nanoid(),
    reasoning: {
      content: `The user is asking for a detailed explanation of useCallback and useMemo. I should provide a clear and concise explanation of each hook's purpose and how they differ.

The useCallback hook is used to memoize functions to prevent unnecessary re-renders of child components that receive functions as props.

The useMemo hook is used to memoize values to avoid expensive recalculations on every render.

Both hooks help with performance optimization, but they serve different purposes.`,
      duration: 10,
    },
    versions: [
      {
        content: `## useCallback vs useMemo

Both hooks help with performance optimization, but they serve different purposes:

### useCallback

\`useCallback\` memoizes **functions** to prevent unnecessary re-renders of child components that receive functions as props.

\`\`\`jsx
// Without useCallback - a new function is created on every render
const handleClick = () => {
  console.log(count);
};

// With useCallback - the function is only recreated when dependencies change
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
\`\`\`

### useMemo

\`useMemo\` memoizes **values** to avoid expensive recalculations on every render.

\`\`\`jsx
// Without useMemo - expensive calculation runs on every render
const sortedList = expensiveSort(items);

// With useMemo - calculation only runs when items change
const sortedList = useMemo(() => expensiveSort(items), [items]);
\`\`\`

### When to use which?

- Use **useCallback** when:
  - Passing callbacks to optimized child components that rely on reference equality
  - Working with event handlers that you pass to child components

- Use **useMemo** when:
  - You have computationally expensive calculations
  - You want to avoid recreating objects that are used as dependencies for other hooks

### Performance Note

Don't overuse these hooks! They come with their own overhead. Only use them when you have identified a genuine performance issue.`,
        id: nanoid(),
      },
    ],
  },
  {
    from: "user",
    key: nanoid(),
    versions: [
      {
        content:
          "Nice! Can you show me a quick showcase of all the markdown formatting you support — tables, callouts, task lists, links, math, and diagrams?",
        id: nanoid(),
      },
    ],
  },
  {
    from: "assistant",
    key: nanoid(),
    versions: [
      {
        content: `# Markdown Showcase

Here's a quick tour of everything I can render.

## Text formatting

Regular text can be **bold**, *italic*, ~~strikethrough~~, or \`inline code\`. You can also mix them, like ***bold italic*** or **\`bold code\`**.

## Lists

Nested and mixed lists:

1. Set up the project
   - Install dependencies
   - Configure environment variables
2. Build the feature
   - [x] Write the component
   - [x] Add tests
   - [ ] Update the docs
3. Ship it

## Tables

| Hook | Purpose | Re-runs when |
| --- | --- | --- |
| \`useState\` | Local component state | State setter called |
| \`useEffect\` | Side effects | Dependencies change |
| \`useMemo\` | Memoize a value | Dependencies change |

## Callouts

> [!NOTE]
> Callouts use the same \`> [!TYPE]\` syntax GitHub supports.

> [!TIP]
> You can combine callouts with any other block content, including lists and code.

> [!WARNING]
> Some features (like nested callouts) aren't supported yet.

## Blockquotes

> "Premature optimization is the root of all evil."
> — Donald Knuth

## Links and images

Check the [React documentation](https://react.dev) for more details. Here's a sample diagram rendered inline:

![A simple placeholder diagram](/mock-diagram-placeholder.svg)

## Math

Inline math like $E = mc^2$ works inline with text. Block math renders centered:

$$
\\int_0^\\infty e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}
$$

## Diagrams

\`\`\`mermaid
graph TD
    A[User asks a question] --> B{Needs a tool?}
    B -->|Yes| C[Call MCP tool]
    B -->|No| D[Answer directly]
    C --> E[Stream response]
    D --> E
\`\`\`

## Code

\`\`\`python
def fibonacci(n: int) -> int:
    """Return the nth Fibonacci number."""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

Let me know if you'd like to see anything else!`,
        id: nanoid(),
      },
    ],
  },
  {
    from: "user",
    key: nanoid(),
    versions: [
      {
        content:
          "Can you show me some code block examples in less common languages too, to make sure syntax highlighting works well for those?",
        id: nanoid(),
      },
    ],
  },
  {
    from: "assistant",
    key: nanoid(),
    versions: [
      {
        content: `# Less Common Languages

Here's a spread of syntax highlighting across languages you don't see every day.

## Rust

\`\`\`rust
fn fibonacci(n: u32) -> u64 {
    let (mut a, mut b) = (0u64, 1u64);
    for _ in 0..n {
        let next = a + b;
        a = b;
        b = next;
    }
    a
}
\`\`\`

## Zig

\`\`\`zig
const std = @import("std");

pub fn fibonacci(n: u32) u64 {
    var a: u64 = 0;
    var b: u64 = 1;
    var i: u32 = 0;
    while (i < n) : (i += 1) {
        const next = a + b;
        a = b;
        b = next;
    }
    return a;
}
\`\`\`

## Elixir

\`\`\`elixir
defmodule Fibonacci do
  def of(n), do: do_fib(n, 0, 1)

  defp do_fib(0, a, _b), do: a
  defp do_fib(n, a, b), do: do_fib(n - 1, b, a + b)
end
\`\`\`

## Haskell

\`\`\`haskell
fibonacci :: Int -> Integer
fibonacci n = go n 0 1
  where
    go 0 a _ = a
    go k a b = go (k - 1) b (a + b)
\`\`\`

## SQL

\`\`\`sql
SELECT id, name, created_at
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 10;
\`\`\`

## Dockerfile

\`\`\`dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "start"]
\`\`\`

## Diff

\`\`\`diff
- const value = compute(a, b);
+ const value = useMemo(() => compute(a, b), [a, b]);
\`\`\`

## An unrecognized language tag

If the language tag isn't one we support, the code still renders — just without syntax colors:

\`\`\`some-made-up-lang
this block uses a language id that doesn't exist,
so it should gracefully fall back to plain text.
\`\`\`

Let me know if you'd like another language added!`,
        id: nanoid(),
      },
    ],
  },
  {
    attachments: [
      {
        filename: "production-error.svg",
        id: nanoid(),
        mediaType: "image/svg+xml",
        url: "/mock-diagram-placeholder.svg",
      },
    ],
    from: "user",
    key: nanoid(),
    versions: [
      {
        content:
          "We're seeing this error in production (screenshot attached). Can you find where it's thrown in our codebase and propose a fix plan before touching anything?",
        id: nanoid(),
      },
    ],
  },
  {
    chainOfThought: [
      {
        label: "Parsed the report",
        status: "complete",
      },
      {
        description: "Found 3 matches across the rate-limiting middleware",
        label: "Searched the codebase for the thrown error",
        status: "complete",
      },
      {
        description: "The Redis client isn't awaited before first use",
        label: "Identified the root cause",
        status: "complete",
      },
    ],
    checkpoint: "Checkpoint saved before applying any changes",
    citation: {
      sources: [
        {
          description:
            "The rate limiter must be initialized before the first request it guards.",
          title: "Rate Limiting Middleware — Internal Docs",
          url: "https://docs.internal.chatsmith.io/middleware/rate-limiting",
        },
      ],
      text: "the Redis-backed rate limiter must finish connecting before it can accept its first request",
    },
    confirmation: {
      description:
        "This rewrites the middleware initialization order in 3 files. No other changes will be made.",
      id: nanoid(),
      title: "Apply the fix to 3 files?",
    },
    from: "assistant",
    key: nanoid(),
    plan: {
      description: "3 steps",
      steps: [
        "Await the Redis client connection before the middleware chain starts",
        "Add a startup health check that fails fast if Redis is unreachable",
        "Add a regression test that boots the app without a warm Redis connection",
      ],
      title: "Fix plan: rate limiter startup race",
    },
    queue: {
      items: [
        {
          id: nanoid(),
          status: "completed",
          title: "Reproduce the crash locally",
        },
        {
          description: "Blocked on your approval below",
          id: nanoid(),
          status: "pending",
          title: "Apply the middleware fix",
        },
        {
          id: nanoid(),
          status: "pending",
          title: "Open a PR with the regression test",
        },
      ],
      label: "remaining tasks",
    },
    task: {
      items: [
        "middleware/rate-limit.ts:42",
        "middleware/rate-limit.test.ts:18",
        "lib/redis-client.ts:9",
      ],
      title: "Searched codebase for RateLimitError",
    },
    tools: [
      {
        description: "Searching the codebase",
        error: undefined,
        name: "grep_codebase",
        parameters: {
          path: "apps/api",
          query: "RateLimitError",
        },
        result: `{
  "matches": [
    { "file": "middleware/rate-limit.ts", "line": 42 },
    { "file": "middleware/rate-limit.test.ts", "line": 18 },
    { "file": "lib/redis-client.ts", "line": 9 }
  ]
}`,
        status: "output-available",
      },
    ],
    artifact: {
      content: `import { createRedisClient } from "./redis-client";

const redis = createRedisClient();

// Await the connection before exporting the middleware so the first
// request can never race an unfinished Redis handshake.
await redis.connect();

export const rateLimitMiddleware = createMiddleware(redis);`,
      description:
        "Awaits the Redis connection before the middleware chain starts",
      filename: "middleware/rate-limit.ts",
      language: "typescript",
      title: "rate-limit.ts (proposed fix)",
    },
    versions: [
      {
        content:
          "I found it — the rate limiter's Redis client isn't awaited before the middleware starts accepting requests, so the very first request after a cold start can crash. Here's what I found and a plan before I change anything.",
        id: nanoid(),
      },
    ],
  },
];

export const mockResponses = [
  "That's a great question! Let me help you understand this concept better. The key thing to remember is that proper implementation requires careful consideration of the underlying principles and best practices in the field.",
  "I'd be happy to explain this topic in detail. From my understanding, there are several important factors to consider when approaching this problem. Let me break it down step by step for you.",
  "This is an interesting topic that comes up frequently. The solution typically involves understanding the core concepts and applying them in the right context. Here's what I recommend...",
  "Great choice of topic! This is something that many developers encounter. The approach I'd suggest is to start with the fundamentals and then build up to more complex scenarios.",
  "That's definitely worth exploring. From what I can see, the best way to handle this is to consider both the theoretical aspects and practical implementation details.",
];

export const delay = (ms: number): Promise<void> =>
  // eslint-disable-next-line promise/avoid-new -- setTimeout requires a new Promise
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
