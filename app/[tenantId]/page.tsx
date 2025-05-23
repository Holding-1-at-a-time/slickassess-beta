import { redirect } from "next/navigation"

export default function TenantPage({ params }: { params: { tenantId: string } }) {
  // Redirect to the dashboard
  redirect(`/${params.tenantId}/dashboard`)
}
