import { redirect } from "next/navigation"
import { createStaffSession, isStaffAuthenticated, isValidStaffPassword } from "@/lib/staff-auth"

async function login(formData: FormData) {
  "use server"
  const password = String(formData.get("password") || "")
  const next = String(formData.get("next") || "/staff/qr")
  if (!isValidStaffPassword(password)) redirect(`/staff?error=1&next=${encodeURIComponent(next)}`)
  await createStaffSession()
  redirect(next.startsWith("/staff") ? next : "/staff/qr")
}

export default async function StaffLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams
  if (await isStaffAuthenticated()) redirect(next?.startsWith("/staff") ? next : "/staff/qr")
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-6 py-12 text-slate-950">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Staff area</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Sign in to verify finishes</h1>
        <form action={login} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="next" value={next || "/staff/qr"} />
          <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="password">Staff password
            <input id="password" name="password" type="password" required autoFocus className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring" />
          </label>
          {error && <p className="text-sm font-semibold text-red-600" role="alert">Incorrect password.</p>}
          <button type="submit" className="rounded-xl bg-primary px-4 py-3 font-bold text-white transition hover:bg-secondary">Continue</button>
        </form>
      </section>
    </main>
  )
}
