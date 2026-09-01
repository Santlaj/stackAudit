import * as React from "react";
import { Shell } from "@/components/layout/shell";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <Shell>
        <PageContainer>
          <PageHeader 
            title="Activity History" 
            description="Your recent contributions and interactions." 
          />
          
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/40 rounded-sm">
            <Activity className="h-6 w-6 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">No contribution activity tracked yet.</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Your open-source activity and achievements will appear here.
            </p>
          </div>
        </PageContainer>
      </Shell>
    </ProtectedRoute>
  );
}
