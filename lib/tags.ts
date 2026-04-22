import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Uses Claude Haiku to generate exactly 3 short, evocative tags for a poem.
 * Returns an array of 3 lowercase strings. Falls back to [] on error so
 * publishing never fails due to a tagging issue.
 */
export async function generateTags(title: string, content: string): Promise<string[]> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 64,
      messages: [
        {
          role: 'user',
          content: `You are a poetry tagging assistant. Given a poem, respond with exactly 3 tags that capture its mood, theme, or subject. Tags should be single lowercase words or short two-word phrases (no punctuation). Respond with only the 3 tags separated by commas — nothing else.

Title: ${title}
Poem:
${content}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const tags = text
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/[^a-z0-9 -]/g, ''))
      .filter(Boolean)
      .slice(0, 3)

    return tags
  } catch (err) {
    console.error('[generateTags] failed:', err)
    return []
  }
}
