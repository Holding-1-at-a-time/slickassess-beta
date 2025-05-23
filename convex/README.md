# SlickAssess Convex Backend

This directory contains the Convex backend for the SlickAssess application.

## Setup

1. Install the Convex CLI globally:
   \`\`\`bash
   npm install -g convex
   \`\`\`

2. Log in to Convex:
   \`\`\`bash
   npx convex login
   \`\`\`

3. Initialize the Convex project (if not already done):
   \`\`\`bash
   npx convex init
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npx convex dev
   \`\`\`

## Project Structure

- `schema.ts`: Defines the database schema
- `functions/`: Contains all Convex functions (queries, mutations, actions)
- `_generated/`: Auto-generated files (do not edit manually)

## Development Workflow

1. Start the Convex development server:
   \`\`\`bash
   npm run convex:dev
   \`\`\`

2. Make changes to your schema or functions

3. The changes will be automatically synced with your development Convex deployment

4. To deploy to production:
   \`\`\`bash
   npm run convex:deploy
   \`\`\`

## Generated Files

The Convex CLI automatically generates the following files:

- `_generated/api.ts`: Contains the API object with all your functions
- `_generated/server.ts`: Contains server-side utilities
- `_generated/dataModel.ts`: Contains types based on your schema

These files should not be edited manually as they are regenerated whenever your schema or functions change.
\`\`\`

Let's create a proper structure for our Convex functions:
