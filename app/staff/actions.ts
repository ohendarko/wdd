"use server"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { clearHuntLog, getHuntLog, markPrizeGiven, resetTeamPin, type HuntLog } from "@/lib/log"
import { isStaffAuthenticated, staffCookieName } from "@/lib/staff-auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function readLiveLog(): Promise<HuntLog> { if (!(await isStaffAuthenticated())) return { teams: [], events: [], status: { configured: false, variables: [], connection: "Unauthorized", teamCount: 0, eventCount: 0 } }; return getHuntLog() }
export async function clearLiveLog() { if (!(await isStaffAuthenticated())) return { error: "Unauthorized" }; try { await clearHuntLog(); revalidatePath("/staff"); return { ok: true } } catch (error) { console.error("[staff] clear log failed:", error); return { error: "Unable to clear the log." } } }
export async function logoutStaff() {
  (await cookies()).delete(staffCookieName())
  redirect("/staff")
}

export async function resetPin(teamId: string, pin: string) { if (!(await isStaffAuthenticated())) return { error: "Unauthorized" }; if (!/^\d{4}$/.test(pin)) return { error: "PIN must be exactly 4 digits." }; try { await resetTeamPin(teamId, await bcrypt.hash(pin, 10)); return { ok: true } } catch (error) { console.error("[staff] reset PIN failed:", error); return { error: "Unable to reset PIN." } } }
export async function givePrize(teamId: string) { if (!(await isStaffAuthenticated())) return { error: "Unauthorized" }; try { const result = await markPrizeGiven(teamId, new Date().toISOString()); if (!result) return { error: "Team not found." }; revalidatePath("/staff"); return result } catch (error) { console.error("[staff] mark prize failed:", error); return { error: "Unable to mark prize given." } } }
