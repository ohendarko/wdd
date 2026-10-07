import "server-only"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "staff_session"
const SESSION_TTL_SECONDS = 60 * 60 * 12

function getSecret() {
  return new TextEncoder().encode(process.env.HUNT_SECRET || "development-only-hunt-secret-change-me")
}

export async function isStaffAuthenticated() {
  const value = (await cookies()).get(COOKIE_NAME)?.value
  if (!value) return false
  try {
    await jwtVerify(value, getSecret(), { algorithms: ["HS256"] })
    return true
  } catch {
    return false
  }
}

export async function createStaffSession() {
  const token = await new SignJWT({ role: "staff" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret())
  ;(await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/staff",
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function isValidStaffPassword(password: string) {
  return Boolean(process.env.STAFF_PASSWORD) && password === process.env.STAFF_PASSWORD
}

export function staffCookieName() {
  return COOKIE_NAME
}

export const staffSessionTtl = SESSION_TTL_SECONDS
