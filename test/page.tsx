'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function TestPage() {
  const testData = useQuery(api.test.getTestMessage)
  
  return (
    <div>
      <h1>Convex Test</h1>
      <pre>{JSON.stringify(testData, null, 2)}</pre>
    </div>
  )
}