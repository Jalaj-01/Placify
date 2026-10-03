/**
 * Text and HTML sanitization/cleaning utilities.
 */

/**
 * Converts rich HTML text (e.g. from contentEditable, Quill, TipTap, web clipboard)
 * into clean, formatted plain text with zero raw HTML tags, preserving line breaks,
 * paragraphs, and bullet points.
 *
 * @param {string} content
 * @returns {string}
 */
export function htmlToCleanText(content) {
  if (!content) return ''
  if (typeof content !== 'string') return String(content)

  // Quick check: if there are no HTML tags, return cleanly trimmed text
  if (!/<[a-z][\s\S]*>/i.test(content)) {
    return content.trim()
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')

    // 1. Replace <br> with explicit newlines
    doc.querySelectorAll('br').forEach((br) => {
      br.replaceWith('\n')
    })

    // 2. Pad block elements with newlines to preserve structure
    const blockElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, tr, blockquote')
    blockElements.forEach((el) => {
      el.prepend('\n')
      el.append('\n')
    })

    // 3. Convert list items to bullet points
    doc.querySelectorAll('li').forEach((li) => {
      li.prepend('\n• ')
    })

    // 4. Extract raw text content without any HTML markup
    let text = doc.body.textContent || doc.body.innerText || ''

    // 5. Clean up excessive empty lines (maximum 2 consecutive newlines)
    text = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line, idx, arr) => line !== '' || (idx > 0 && arr[idx - 1] !== ''))
      .join('\n')
      .trim()

    return text || content.replace(/<[^>]+>/g, '').trim()
  } catch {
    return content.replace(/<[^>]+>/g, '').trim()
  }
}
