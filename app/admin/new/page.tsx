import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminPoemForm from '@/components/AdminPoemForm'

export default async function NewPoemPage() {
  async function createPoem(formData: FormData) {
    'use server'
    const supabase = await createServerSupabaseClient()

    const tags = (formData.get('tags') as string)
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    await supabase.from('poems').insert({
      title:   formData.get('title') as string,
      content: formData.get('content') as string,
      tags,
    })

    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/admin')
    redirect('/admin')
  }

  return (
    <div className="min-h-screen px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-5 mb-12 border-b border-ink-text/10 pb-6">
          <Link href="/admin" className="font-body italic text-sm text-ink-muted hover:text-ink-text transition-colors">
            ← back
          </Link>
          <h1 className="font-display italic text-2xl text-ink-text tracking-wide">New poem</h1>
        </div>

        <AdminPoemForm action={createPoem} submitLabel="Publish poem" />
      </div>
    </div>
  )
}
