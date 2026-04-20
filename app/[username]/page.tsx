import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPoetByUsername, getPoemsByPoet } from '@/lib/queries'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoetHomeClient from './PoetHomeClient'

interface Props {
  params: Promise<{ username: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const poet = await getPoetByUsername(username)
  if (!poet?.username) return { title: 'Not found — Poema' }
  const name = poet.display_name || poet.username
  return {
    title: `${name} — Poema`,
    description: `Poems by ${name}`,
  }
}

export default async function PoetLandingPage({ params }: Props) {
  const { username } = await params
  const poet = await getPoetByUsername(username)
  if (!poet?.username) notFound()

  if (username !== poet.username) redirect(`/${poet.username}`)

  const poems = await getPoemsByPoet(poet.id)

  return (
    <main className="min-h-screen flex flex-col items-center relative px-6">
      <GradientBackground />
      <NavBar />
      <PoetHomeClient
        poems={poems}
        username={poet.username}
        displayName={poet.display_name || poet.username}
      />
    </main>
  )
}
