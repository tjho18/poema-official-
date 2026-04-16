import { createServerSupabaseClient } from '@/lib/supabase-server'
import HomeClient from './HomeClient'
import type { Poem } from '@/types/poem'

export const dynamic = 'force-dynamic' // revalidate every minute

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .order('created_at', { ascending: false })

  const poems: Poem[] = error ? [] : (data ?? [])

  return <HomeClient poems={poems} allTags={[]} />
}
