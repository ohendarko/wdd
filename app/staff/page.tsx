import { redirect } from "next/navigation"
import { createStaffSession, isStaffAuthenticated, isValidStaffPassword } from "@/lib/staff-auth"
import { readLiveLog } from "@/app/staff/actions"
import { StaffLive } from "@/components/staff-live"

async function login(formData: FormData) {
  "use server"
  const password = String(formData.get("password") || "")
  if (!isValidStaffPassword(password)) redirect("/staff?error=1")
  await createStaffSession()
  redirect("/staff")
}

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await isStaffAuthenticated())) {
    const { error } = await searchParams
    return <main className="flex min-h-screen items-center justify-center bg-secondary px-6 py-12 text-slate-950"><section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Staff area</p><h1 className="mt-3 text-3xl font-black tracking-tight">Sign in to view live progress</h1><form action={login} className="mt-8 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="password">Staff password<input id="password" name="password" type="password" required autoFocus className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring" /></label>{error && <p className="text-sm font-semibold text-red-600" role="alert">Incorrect password.</p>}<button type="submit" className="rounded-xl bg-primary px-4 py-3 font-bold text-white">Continue</button></form></section></main>
  }
  return <StaffLive initial={await readLiveLog()} />
}
