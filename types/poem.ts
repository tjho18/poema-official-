export type PoemStatus = 'draft' | 'scheduled' | 'published'

export interface Poem {
  id: string
  title: string
  content: string
  tags: string[]
  author_id: string | null
  slug: string | null
  status: PoemStatus
  published_at: string | null
  scheduled_for: string | null
  collection_id: string | null
  collection_position: number | null
  created_at: string
  updated_at: string
}

// Row shape returned by the public_poems view (poem + author join).
export interface PublicPoem extends Poem {
  author_username: string
  author_display_name: string | null
  author_avatar_url: string | null
}
