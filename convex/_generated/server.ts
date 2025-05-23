// Define the types for Convex functions
export type MutationCtx = {
  db: {
    insert: (table: string, data: any) => Promise<string>
    get: (id: any) => Promise<any>
    patch: (id: any, data: any) => Promise<void>
    delete: (id: any) => Promise<void>
    query: (table: string) => any
  }
  runQuery: (queryName: string, args: any) => Promise<any>
  runMutation: (mutationName: string, args: any) => Promise<any>
  runAction: (actionName: string, args: any) => Promise<any>
}

export type QueryCtx = {
  db: {
    query: (table: string) => any
    get: (id: any) => Promise<any>
  }
}

export type ActionCtx = {
  runQuery: (queryName: string, args: any) => Promise<any>
  runMutation: (mutationName: string, args: any) => Promise<any>
  runAction: (actionName: string, args: any) => Promise<any>
}

// Export the function wrappers
export function mutation<Args, Return>(config: {
  args?: any
  handler: (ctx: MutationCtx, args: Args) => Promise<Return>
}) {
  return config
}

export function query<Args, Return>(config: {
  args?: any
  handler: (ctx: QueryCtx, args: Args) => Promise<Return>
}) {
  return config
}

export function action<Args, Return>(config: {
  args?: any
  handler: (ctx: ActionCtx, args: Args) => Promise<Return>
}) {
  return config
}

export function internalAction<Args, Return>(config: {
  args?: any
  handler: (ctx: ActionCtx, args: Args) => Promise<Return>
}) {
  return config
}
