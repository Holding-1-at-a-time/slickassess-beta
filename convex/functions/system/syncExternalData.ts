import { internalAction } from "../../_generated/server"
import { v } from "convex/values"

export default internalAction({
  args: {
    tenantId: v.optional(v.string()),
    source: v.union(v.literal("pricing"), v.literal("vehicles"), v.literal("customers")),
  },
  handler: async (ctx, args) => {
    try {
      const results = {
        source: args.source,
        tenants: 0,
        recordsProcessed: 0,
        recordsUpdated: 0,
        recordsCreated: 0,
        errors: 0,
      }

      // Get tenants to process
      let tenants = []
      if (args.tenantId) {
        const tenant = await ctx.runQuery("tenants/getTenantById", {
          tenantId: args.tenantId,
        })
        if (tenant) {
          tenants = [tenant]
        }
      } else {
        tenants = await ctx.runQuery("tenants/listActiveTenants", {})
      }

      results.tenants = tenants.length

      // Process each tenant
      for (const tenant of tenants) {
        try {
          switch (args.source) {
            case "pricing":
              // Sync pricing data from external source
              // This is a placeholder for actual integration code
              const pricingData = await fetchExternalPricingData(tenant._id)

              for (const item of pricingData) {
                results.recordsProcessed++

                // Check if pricing rule exists
                const existingRule = await ctx.runQuery("pricingRules/getRuleByServiceName", {
                  tenantId: tenant._id,
                  serviceName: item.serviceName,
                })

                if (existingRule) {
                  // Update existing rule
                  await ctx.runMutation("pricingRules/updateRule", {
                    ruleId: existingRule._id,
                    tenantId: tenant._id,
                    updates: {
                      basePrice: item.basePrice,
                      duration: item.duration,
                      description: item.description,
                      updatedAt: Date.now(),
                    },
                  })
                  results.recordsUpdated++
                } else {
                  // Create new rule
                  await ctx.runMutation("pricingRules/createRule", {
                    tenantId: tenant._id,
                    serviceName: item.serviceName,
                    basePrice: item.basePrice,
                    duration: item.duration,
                    description: item.description,
                    active: true,
                  })
                  results.recordsCreated++
                }
              }
              break

            case "vehicles":
              // Sync vehicle data from external source
              // This is a placeholder for actual integration code
              const vehicleData = await fetchExternalVehicleData(tenant._id)

              for (const vehicle of vehicleData) {
                results.recordsProcessed++

                // Check if vehicle exists
                const existingVehicle = await ctx.runQuery("vehicles/getVehicleByVin", {
                  tenantId: tenant._id,
                  vin: vehicle.vin,
                })

                if (existingVehicle) {
                  // Update existing vehicle
                  await ctx.runMutation("vehicles/updateVehicle", {
                    vehicleId: existingVehicle._id,
                    tenantId: tenant._id,
                    updates: {
                      make: vehicle.make,
                      model: vehicle.model,
                      year: vehicle.year,
                      licensePlate: vehicle.licensePlate,
                      status: vehicle.status,
                      updatedAt: Date.now(),
                    },
                  })
                  results.recordsUpdated++
                } else {
                  // Create new vehicle
                  await ctx.runMutation("vehicles/createVehicle", {
                    tenantId: tenant._id,
                    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    licensePlate: vehicle.licensePlate,
                    vin: vehicle.vin,
                    status: "active",
                  })
                  results.recordsCreated++
                }
              }
              break

            case "customers":
              // Sync customer data from external source
              // This is a placeholder for actual integration code
              const customerData = await fetchExternalCustomerData(tenant._id)

              for (const customer of customerData) {
                results.recordsProcessed++

                // Check if user exists
                const existingUser = await ctx.runQuery("users/getUserByEmail", {
                  tenantId: tenant._id,
                  email: customer.email,
                })

                if (existingUser) {
                  // Update existing user
                  await ctx.runMutation("users/updateUser", {
                    userId: existingUser._id,
                    tenantId: tenant._id,
                    updates: {
                      name: customer.name,
                      phone: customer.phone,
                      updatedAt: Date.now(),
                    },
                  })
                  results.recordsUpdated++
                } else {
                  // Create new user
                  await ctx.runMutation("users/createUser", {
                    tenantId: tenant._id,
                    name: customer.name,
                    email: customer.email,
                    role: "customer",
                    authId: `external:${customer.id}`,
                  })
                  results.recordsCreated++
                }
              }
              break
          }
        } catch (error) {
          console.error(`Error processing tenant ${tenant._id}:`, error)
          results.errors++
        }
      }

      return results
    } catch (error) {
      console.error("Error syncing external data:", error)
      throw new Error(`External data sync failed: ${error}`)
    }
  },
})

// Placeholder functions for external data fetching
// In a real implementation, these would connect to external APIs or data sources
async function fetchExternalPricingData(tenantId) {
  // Simulate API call
  return [
    { serviceName: "Oil Change", basePrice: 49.99, duration: 30, description: "Standard oil change service" },
    { serviceName: "Tire Rotation", basePrice: 29.99, duration: 20, description: "Rotate tires for even wear" },
    {
      serviceName: "Brake Inspection",
      basePrice: 39.99,
      duration: 45,
      description: "Comprehensive brake system inspection",
    },
  ]
}

async function fetchExternalVehicleData(tenantId) {
  // Simulate API call
  return [
    { make: "Toyota", model: "Camry", year: 2020, licensePlate: "ABC123", vin: "1HGCM82633A123456", status: "active" },
    { make: "Honda", model: "Accord", year: 2019, licensePlate: "XYZ789", vin: "5YJSA1E47JF123456", status: "active" },
  ]
}

async function fetchExternalCustomerData(tenantId) {
  // Simulate API call
  return [
    { id: "cust_123", name: "John Doe", email: "john@example.com", phone: "555-123-4567" },
    { id: "cust_456", name: "Jane Smith", email: "jane@example.com", phone: "555-987-6543" },
  ]
}
