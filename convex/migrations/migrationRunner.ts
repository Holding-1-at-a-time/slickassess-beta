import { internalMutation, internalQuery } from "../_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"

export interface Migration {
  name: string
  version: number
  description?: string
  up: (ctx: any) => Promise<void>
  down?: (ctx: any) => Promise<void>
}

// Registry of all migrations
export const migrations: Migration[] = []

export function registerMigration(migration: Migration) {
  migrations.push(migration)
  migrations.sort((a, b) => a.version - b.version)
}

export const runMigration = internalMutation({
  args: {
    name: v.string(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const migration = migrations.find((m) => m.name === args.name && m.version === args.version)

    if (!migration) {
      throw new ConvexError(`Migration ${args.name} v${args.version} not found`)
    }

    // Check if migration already exists
    const existing = await ctx.db
      .query("migrations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .filter((q) => q.eq(q.field("version"), args.version))
      .first()

    if (existing && existing.status === "completed") {
      throw new ConvexError(`Migration ${args.name} v${args.version} already completed`)
    }

    const migrationId =
      existing?._id ||
      (await ctx.db.insert("migrations", {
        name: args.name,
        version: args.version,
        description: migration.description,
        status: "pending",
      }))

    // Start migration
    await ctx.db.patch(migrationId, {
      status: "running",
      startedAt: Date.now(),
    })

    try {
      // Run the migration
      await migration.up(ctx)

      // Mark as completed
      await ctx.db.patch(migrationId, {
        status: "completed",
        completedAt: Date.now(),
      })

      return { success: true, migrationId }
    } catch (error) {
      // Mark as failed
      await ctx.db.patch(migrationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      })

      throw error
    }
  },
})

export const rollbackMigration = internalMutation({
  args: {
    name: v.string(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const migration = migrations.find((m) => m.name === args.name && m.version === args.version)

    if (!migration || !migration.down) {
      throw new ConvexError(`Migration ${args.name} v${args.version} cannot be rolled back`)
    }

    const existing = await ctx.db
      .query("migrations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .filter((q) => q.eq(q.field("version"), args.version))
      .first()

    if (!existing || existing.status !== "completed") {
      throw new ConvexError(`Migration ${args.name} v${args.version} is not in completed state`)
    }

    try {
      // Run the rollback
      await migration.down(ctx)

      // Mark as rolled back
      await ctx.db.patch(existing._id, {
        status: "rolled_back",
        completedAt: Date.now(),
      })

      return { success: true }
    } catch (error) {
      throw new ConvexError(`Rollback failed: ${error}`)
    }
  },
})

export const getPendingMigrations = internalQuery({
  handler: async (ctx) => {
    const completedMigrations = await ctx.db
      .query("migrations")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect()

    const completedVersions = new Set(completedMigrations.map((m) => `${m.name}:${m.version}`))

    return migrations.filter((m) => !completedVersions.has(`${m.name}:${m.version}`))
  },
})
