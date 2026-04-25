/**
 * A JSON Pointer string following the syntax defined in RFC 6901 (https://datatracker.ietf.org/doc/html/rfc6901).
 * It must start with a '/' and can contain any characters after that.
 * 
 * Examples of valid JSON Pointers:
 * - "/foo"
 * - "/foo/bar"
 * - "/0"
 * - "/a\~1b" (represents "a/b")
 * - "/c\~0d" (represents "c\~d")
 * 
 * Note: The JSON Pointer syntax allows for escaping of '\~' and '/' characters using '\~0' and '\~1' respectively.
 */
export type JsonPointer = `/${string}`

/**
 * Represents a single operation in a JSON Patch document as defined in RFC 6902 (https://datatracker.ietf.org/doc/html/rfc6902).
 * 
 * Each operation must have an "op" property that specifies the type of operation, and a "path" property that indicates the target location in the JSON document.
 * 
 * The "op" property can be one of the following:
 * - "add": Adds a value to the target location. The operation must include a "value" property with the value to be added.
 * - "remove": Removes the value at the target location. No additional properties are required.
 * - "replace": Replaces the value at the target location with a new value. The operation must include a "value" property with the new value.
 * - "move": Moves a value from one location to another. The operation must include a "from" property that specifies the source location as a JSON Pointer.
 * - "copy": Copies a value from one location to another. The operation must include a "from" property that specifies the source location as a JSON Pointer.
 * - "test": Tests that a value at the target location matches a specified value. The operation must include a "value" property with the value to be tested against.
 * 
 * Example of a JSON Patch document:
 * [
 *   { "op": "add", "path": "/foo", "value": "bar" },
 *   { "op": "remove", "path": "/baz" },
 *   { "op": "replace", "path": "/qux", "value": 42 },
 *   { "op": "move", "from": "/oldPath", "path": "/newPath" },
 *   { "op": "copy", "from": "/sourcePath", "path": "/destinationPath" },
 *   { "op": "test", "path": "/testPath", "value": true }
 * ]
 */
export interface Operation<
    T extends "add" | "remove" | "replace" | "move" | "copy" | "test"
> {
  op: T
  path: JsonPointer
}

/**
 * AddOperation represents an "add" operation in a JSON Patch document. It includes a "value" property that
 * specifies the value to be added at the target location.
 */
export interface AddOperation extends Operation<"add"> {
  value: unknown
}

/**
 * RemoveOperation represents a "remove" operation in a JSON Patch document. It does not require any additional
 * properties beyond those defined in the base Operation interface.
 */
export interface RemoveOperation extends Operation<"remove"> {}

/**
 * ReplaceOperation represents a "replace" operation in a JSON Patch document. It includes a "value" property that
 * specifies the new value to replace the existing value at the target location.
 */
export interface ReplaceOperation extends Operation<"replace"> {
  value: unknown
}

/**
 * MoveOperation represents a "move" operation in a JSON Patch document. It includes a "from" property that specifies
 * the source location as a JSON Pointer, indicating where the value should be moved from.
 */
export interface MoveOperation extends Operation<"move"> {
  from: JsonPointer
}

/**
 * CopyOperation represents a "copy" operation in a JSON Patch document. It includes a "from" property that specifies
 * the source location as a JSON Pointer, indicating where the value should be copied from.
 */
export interface CopyOperation extends Operation<"copy"> {
  from: JsonPointer
}

/**
 * TestOperation represents a "test" operation in a JSON Patch document. It includes a "value" property that specifies
 * the value to be tested against the value at the target location. The operation will succeed if the value at the
 * target location matches the specified value, and will fail otherwise.
 */
export interface TestOperation extends Operation<"test"> {
  value: unknown
}

/**
 * Patch is a union type that represents any of the valid operations in a JSON Patch document. It can be an AddOperation,
 * RemoveOperation, ReplaceOperation, MoveOperation, CopyOperation, or TestOperation.
 */
export type Patch =
    | AddOperation
    | RemoveOperation
    | ReplaceOperation
    | MoveOperation
    | CopyOperation
    | TestOperation

/**
 * PatchDocument represents a JSON Patch document, which is an array of Patch operations. Each operation in the
 * array must conform to the structure defined by the Patch type.
 */
export type PatchDocument = Array<Patch>

/**
 * ActivityDelta represents an activity event emitted to the agent. It includes an "activity_type" property that identifies
 * the type of activity being emitted, and a "patch" property that contains a PatchDocument describing the changes
 * associated with this activity event. The information in the delta is not persisted by the agent,
 * but is instead intended to be consumed by clients in real-time as activity events are emitted.
 */
export interface ActivityDelta {
  activity_type: string
  patch: PatchDocument
}

/**
 * EmitFunction is the type of the emit callback passed to a tool's execute method inside
 * the ToolInput object. Calling it sends an activity event to the agent in real-time.
 */
export type EmitFunction = (delta: ActivityDelta) => void

/**
 * ToolInput represents the input passed to a tool's execute method. It contains the typed arguments
 * for the tool, an optional snapshot of the agent's current state at the time of invocation, and
 * an optional emit callback for sending activity events.
 *
 * TState defaults to unknown, so tools that do not need state can omit the second type argument
 * and safely ignore input.state.
 */
export interface ToolInput<TArgs, TState = unknown> {
  args: TArgs
  state?: TState | null
  emit?: EmitFunction
}

/**
 * ToolOutput represents the output of a tool execution. It includes an "output" property that contains the
 * result of the tool execution, and an optional "state_update" property that contains a PatchDocument
 * representing any updates to the state that should be applied as a result of the tool execution.
 */
export interface ToolOutput<O> {
  output: O,
  state_update?: PatchDocument
}

/**
 * Tool describes the shape of a valid exported tool object. Tool developers may use this
 * type to get full end-to-end type coverage on their tool exports, though it is not required.
 */
export interface Tool<TArgs, TResult, TState = unknown> {
  name: string
  description: string
  parameters: Record<string, unknown>
  execute(input: ToolInput<TArgs, TState>): Promise<ToolOutput<TResult>>
}
