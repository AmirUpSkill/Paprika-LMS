import { query } from './_generated/server'

export const getTestMessage = query({
  args: {},
  handler: async (ctx) => {
    return { message: 'Hello from Convex!', timestamp: Date.now() }
  }
})