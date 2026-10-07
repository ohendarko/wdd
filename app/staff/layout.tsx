import { redirect } from "next/navigation"
import { isStaffAuthenticated } from "@/lib/staff-auth"

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  return children
}

export async function requireStaff(nextPath: string) {
  if (!(await isStaffAuthenticated())) redirect(`/staff?next=${encodeURIComponent(nextPath)}`)
}
