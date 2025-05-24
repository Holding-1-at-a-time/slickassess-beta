import type { ConvexContext } from "../_generated/server"

/**
 * Middleware to check if a user is authenticated and has access to a tenant
 * @param ctx The Convex context
 * @param tenantId The tenant ID to check access for
 * @returns The user identity and role if authenticated
 * @throws Error if not authenticated or doesn't have access
 */
export async function requireTenantAccess(ctx: ConvexContext, tenantId: string) {
  // Check if user is authenticated
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Unauthorized: User not authenticated")
  }

  // Check if user has access to the tenant
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_user_tenant", (q) => q.eq("userId", identity.subject).eq("tenantId", tenantId))
    .unique()

  if (!userRole) {
    throw new Error("Unauthorized: User does not have access to this tenant")
  }

  return { identity, role: userRole.role }
}
