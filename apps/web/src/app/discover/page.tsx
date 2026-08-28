import * as React from "react"
import { Shell } from "@/components/layout/shell"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { DiscoveryDashboard } from "@/components/dashboard/discovery-dashboard"
import { ProtectedRoute } from "@/components/layout/protected-route"

export default function DiscoverPage() {
  return (
    <ProtectedRoute>
      <Shell>
        <PageContainer fullWidth={true}>
          <DiscoveryDashboard />
        </PageContainer>
      </Shell>
    </ProtectedRoute>
  )
}
