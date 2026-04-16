import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemDisplay from '@/components/PoemDisplay'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: poem } = await supabase
    .from('poems')
    .select('title, content')
    .eq('id', id)
    .single()

  if (!poem) return { title: 'Poem not found — Poema' }

  const firstLine = poem.content.split('\n').find((l: string) => l.trim()) ?? ''

  return {
    title: `${poem.title} — Poema`,
    description: firstLine,
    openGraph: {
      title: poem.title,
      description: firstLine,
      type: 'article',
    },
  }
}

export default async function PoemPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: poem, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !poem) notFound()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="w-full max-w-lg mx-auto">
        {/* No animation on direct navigation — just show the poem cleanly */}
        <PoemDisplay
          title={poem.title}
          content={poem.content}
          tags={poem.tags}
          animate={false}
          showTags={true}
        />

        <div className="flex justify-center gap-8 mt-16">
          <Link
            href="/explore"
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            ← all poems
          </Link>
          <Link
            href="/"
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            surprise me →
          </Link>
        </div>
      </div>
    </div>
  )
}
