import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminPoemForm from '@/components/AdminPoemForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPoemPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: poem, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !poem) notFound()

  async function updatePoem(formData: FormData) {
    'use server'
    const sb = await createServerSupabaseClient()

    const tags = (formData.get('tags') as string)
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    await sb.from('poems').update({
      title:   formData.get('title') as string,
      content: formData.get('content') as string,
      tags,
    }).eq('id', id)

    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath(`/poems/${id}`)
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
          <h1 className="font-display italic text-2xl text-ink-text tracking-wide">Edit poem</h1>
        </div>

        <AdminPoemForm
          initialData={poem}
          action={updatePoem}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}
