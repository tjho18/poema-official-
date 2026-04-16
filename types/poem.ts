export interface Poem {
  id: string
  title: string
  content: string
  tags: string[]
  author_id: string | null
  created_at: string
}
