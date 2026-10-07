import { PosterClient } from "@/components/hunt-app"

export default async function PosterPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <PosterClient posterToken={token} />
}
