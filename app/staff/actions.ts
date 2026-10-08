"use server"
import { revalidatePath } from "next/cache"
import { clearHuntLog, getHuntLog, markPrizeGiven } from "@/lib/log"
import { isStaffAuthenticated, staffCookieName } from "@/lib/staff-auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function readLiveLog() { if (!(await isStaffAuthenticated())) return { teams: [], events: [] }; return getHuntLog() }
export async function clearLiveLog() { if (!(await isStaffAuthenticated())) return { error: "Unauthorized" }; try { await clearHuntLog(); revalidatePath("/staff"); return { ok: true } } catch (error) { console.error("[staff] clear log failed:", error); return { error: "Unable to clear the log." } } }
export async function logoutStaff() {
  (await cookies()).delete(staffCookieName())
  redirect("/staff")
}

export async function givePrize(teamId: string) { if (!(await isStaffAuthenticated())) return { error: "Unauthorized" }; try { const result = await markPrizeGiven(teamId, new Date().toISOString()); if (!result) return { error: "Team not found." }; revalidatePath("/staff"); return result } catch (error) { console.error("[staff] mark prize failed:", error); return { error: "Unable to mark prize given." } } }
