import * as React from "react"
import { Shell } from "@/components/layout/shell"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { DiscoveryDashboard } from "@/components/dashboard/discovery-dashboard"

export default function DashboardPage() {
  return (
    <Shell>
      <PageContainer>
        <PageHeader
          title="Find My Contribution"
          description="Discover open-source issues matched to your developer profile."
        />
        
        <DiscoveryDashboard />
        
      </PageContainer>
    </Shell>
  )
}
