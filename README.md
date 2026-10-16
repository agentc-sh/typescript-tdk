# agentc TypeScript TDK

> **Note:** This package has been deprecated as of v0.4.0. The runtime no longer depends on external TDK packages, and the TypeScript TDK is no longer needed to write TypeScript/JavaScript tools. See the [agentc documentation](https://docs.agentc.sh/guides/write-a-tool) for the updated guide to writing TypeScript/JavaScript tools.

---

Types for writing [agentc](https://agentc.sh) tools in TypeScript or JavaScript. agentc compiles
tools written against this package into the agent binary at build time; there is no runtime
installation or server process involved.

## Installation

This package is not published to npm. Add it directly from git:

```bash
pnpm add github:agentc-sh/typescript-tdk
```

Pin a specific tag or commit for reproducible builds:

```bash
pnpm add github:agentc-sh/typescript-tdk#v0.1.0
pnpm add github:agentc-sh/typescript-tdk#<commit-sha>
```

If your tool package was scaffolded with `agentc tool init <name> --language javascript`, the
dependency is already configured for you.

## Quick start

A tool is an object with a `name`, a `description`, a JSON Schema for its inputs, and an `execute`
function. Import the `Tool` type for full type coverage on your tool's exports:

```typescript
import type { Tool, ToolInput, ToolOutput } from "@agentc-sh/tdk";

type AddArgs = { a: number; b: number };

export const adder: Tool<AddArgs, number> = {
  name: "adder",
  description: "Adds two numbers together.",
  parameters: {
    type: "object",
    properties: {
      a: { type: "number", description: "The first number." },
      b: { type: "number", description: "The second number." }
    },
    required: ["a", "b"]
  },
  async execute(input: ToolInput<AddArgs>): Promise<ToolOutput<number>> {
    return { output: input.args.a + input.args.b };
  }
};
```

A single package can export as many tools as it needs.

## Writing back to state

A tool can return a `state_update` alongside its output: an array of
[RFC 6902 JSON Patch](https://jsonpatch.com/) operations that are applied to the agent's state and
streamed to the client as state delta events.

```typescript
async execute(input: ToolInput<AddArgs>): Promise<ToolOutput<number>> {
  return {
    output: input.args.a + input.args.b,
    state_update: [
      { op: "add", path: "/context/last_sum", value: input.args.a + input.args.b }
    ]
  };
}
```

A tool can also call the `emit` function passed on `ToolInput` to send stateless `ActivityDelta`
events to the client in real time, useful for generative UI.

## Declaring the tool in a manifest

Once written, point a `tool` block at the package directory in your agent's manifest:

```hcl title="agent.acl"
tool "adder" {
  kind   = "javascript"
  source = "./math"
}
```

See the [agentc documentation](https://docs.agentc.sh) for the full guide to writing and
declaring tools.

## Development

This repo uses [pnpm](https://pnpm.io) and [Task](https://taskfile.dev).

```bash
pnpm install
task typescript:build
task typescript:lint
task typescript:fmt
task typescript:test
```

## License

MIT
