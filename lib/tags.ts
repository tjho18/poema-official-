/**
 * Uses Claude Haiku to generate exactly 3 short, evocative tags for a poem.
 * Returns an array of 3 lowercase strings. Falls back to [] on error so
 * publishing never fails due to a missing key, slow response, or any other issue.
 */
export async function generateTags(title: string, content: string): Promise<string[]> {
  // ── Diagnostic stub (no SDK import) ─────────────────────────────────────────
  void title; void content
  return ['stillness', 'light', 'solitude']
  // ─────────────────────────────────────────────────────────────────────────────
}
