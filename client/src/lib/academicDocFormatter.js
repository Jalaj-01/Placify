/**
 * academicDocFormatter.js
 * 
 * Transforms raw editor HTML / notes content into a publication-grade, professionally
 * typeset research document suitable for institutional & academic PDFs (e.g. NRLM-style reports).
 * 
 * 100% preserves source content and technical meaning without invention or deletion.
 */

// Helper: Clean malformed heading text (e.g. "1.What exactly we have built ?" -> "1. What Exactly Have We Built?")
export function cleanHeadingText(text) {
  if (!text) return text
  let cleaned = text.trim()

  // Fix missing space after numbering: "1.What" -> "1. What", "1.1What" -> "1.1 What"
  cleaned = cleaned.replace(/^(\d+(?:\.\d+)*)\.([^\s\d])/g, '$1. $2')

  // Remove unnecessary space before punctuation: "built ?" -> "built?", "mean :" -> "mean:"
  cleaned = cleaned.replace(/\s+([?!.,:;])/g, '$1')

  // Title case for heading if it looks like a sentence without proper casing
  const numMatch = cleaned.match(/^(\d+(?:\.\d+)*\.\s*)(.*)$/)
  if (numMatch) {
    const prefix = numMatch[1]
    const rest = numMatch[2]
    const titleCased = rest.replace(/\b([a-z])/g, (char, _, offset) => {
      const word = rest.slice(offset).split(/[\s?.,:;]/)[0].toLowerCase()
      if (
        offset > 0 &&
        ['a', 'an', 'the', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'and', 'but', 'or', 'nor', 'as', 'of'].includes(word)
      ) {
        return char
      }
      return char.toUpperCase()
    })
    cleaned = prefix + titleCased
  }

  return cleaned
}

// Helper: Check if string is an arrow or separator
function isArrow(text) {
  const t = text.trim()
  return (
    t === '↓' ||
    t === '↓' ||
    t === 'v' ||
    t === 'V' ||
    t === '|' ||
    t === '->' ||
    t === '→' ||
    t === '=>' ||
    t === '▼' ||
    t === '&darr;'
  )
}

// Helper: Check if text is a bullet item
function isBulletItem(text) {
  const t = text.trim()
  return /^[\u2022\u25E6\u2023\u2219\*\-\–\—]\s+/.test(t) || /^•\s*/.test(t)
}

function cleanBulletText(text) {
  return text.trim().replace(/^[\u2022\u25E6\u2023\u2219\*\-\–\—]\s*/, '').trim()
}

// Helper: Strip ASCII box drawing characters
function cleanBoxLine(text) {
  let cleaned = text.trim()
  // Remove box drawing characters: ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ─ │ ═ ║ ╔ ╗ ╚ ╝
  cleaned = cleaned.replace(/[┌┐└┘├┤┬┴┼─│═║╔╗╚╝╠╣╦╩╬[\]]/g, '').trim()
  return cleaned
}

function isBoxDrawingBorder(text) {
  const t = text.trim()
  return /^[┌┐└┘├┤┬┴┼─═║╔╗╚╝\s\-_=]+$/.test(t) && t.length > 2
}

/**
 * Main typesetter function
 */
export function formatAcademicDocument(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return ''

  // Pre-process: standardize <br> and <pre> ASCII boxes
  let preprocessed = rawHtml
    .replace(/<br\s*\/?>/gi, '</p><p>')
    .replace(/&nbsp;/g, ' ')

  // If in browser, use DOMParser
  if (typeof window === 'undefined' || !window.DOMParser) {
    return rawHtml
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${preprocessed}</div>`, 'text/html')
  const root = doc.body.firstElementChild || doc.body

  // Flatten any deeply nested single containers or text nodes
  const rawNodes = Array.from(root.childNodes)
  const normalizedElements = []

  rawNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim()
      if (text) {
        const p = doc.createElement('p')
        p.textContent = text
        normalizedElements.push(p)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName.toLowerCase() === 'pre') {
        // Preformatted text might contain ASCII boxes or multi-line workflows
        const lines = node.textContent.split('\n')
        lines.forEach((line) => {
          const trimmed = line.trim()
          if (trimmed) {
            const p = doc.createElement('p')
            p.textContent = trimmed
            normalizedElements.push(p)
          }
        })
      } else {
        normalizedElements.push(node)
      }
    }
  })

  const children = normalizedElements
  if (children.length === 0) {
    return rawHtml
  }

  const outputElements = []
  let i = 0

  while (i < children.length) {
    const el = children[i]
    let text = el.textContent ? el.textContent.trim() : ''
    const innerHtml = el.innerHTML ? el.innerHTML.trim() : ''
    const tagName = el.tagName.toLowerCase()

    // Skip empty lines or pure ASCII borders (e.g. ┌──────────┐ or └──────────┘)
    if (!text || isBoxDrawingBorder(text)) {
      i++
      continue
    }

    // ── 1. DETECT WORKFLOW / PIPELINE SEQUENCES ─────────────────────────
    // Examples:
    // [Research Papers] -> [↓] -> [Understand Papers] -> [↓] ...
    // or ASCII box lines: │ Research Papers │ -> ↓ -> │ Understand Papers │
    let currentStepName = cleanBoxLine(text)
    let isWorkflowCandidate = false

    if (i + 1 < children.length) {
      const nextText = children[i + 1].textContent.trim()
      if (isArrow(nextText) || isBoxDrawingBorder(nextText)) {
        isWorkflowCandidate = true
      }
    }

    if (isWorkflowCandidate && currentStepName && !isArrow(currentStepName)) {
      const workflowSteps = [currentStepName]
      let stepIdx = i + 1

      while (stepIdx < children.length) {
        let stepText = children[stepIdx].textContent.trim()

        // Skip ASCII border lines
        if (isBoxDrawingBorder(stepText)) {
          stepIdx++
          continue
        }

        // If it's an arrow, look for next step
        if (isArrow(stepText)) {
          stepIdx++
          // Skip any intermediate ASCII border
          while (stepIdx < children.length && isBoxDrawingBorder(children[stepIdx].textContent.trim())) {
            stepIdx++
          }
          if (stepIdx < children.length) {
            const nextCandidate = cleanBoxLine(children[stepIdx].textContent)
            if (nextCandidate && !isArrow(nextCandidate)) {
              workflowSteps.push(nextCandidate)
              stepIdx++
            } else {
              break
            }
          } else {
            break
          }
        } else {
          break
        }
      }

      if (workflowSteps.length >= 3) {
        // Build clean institutional vector diagram
        const isMultiStage = workflowSteps.length >= 8

        let diagramHtml = `
          <div class="pdf-workflow-container my-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60 break-inside-avoid">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3.5 flex items-center justify-between">
              <span>Research Intelligence Workflow</span>
              <span class="text-[9px] font-mono text-slate-400 font-medium">${workflowSteps.length} Sequential Stages</span>
            </div>
        `

        if (isMultiStage) {
          // Chunk into 4 logical stages or 2-column layout to utilize page width
          const chunkSize = Math.ceil(workflowSteps.length / 4)
          const stages = [
            { label: 'STAGE 1 — UNDERSTANDING', items: workflowSteps.slice(0, chunkSize) },
            { label: 'STAGE 2 — DISCOVERY', items: workflowSteps.slice(chunkSize, chunkSize * 2) },
            { label: 'STAGE 3 — GAP ANALYSIS', items: workflowSteps.slice(chunkSize * 2, chunkSize * 3) },
            { label: 'STAGE 4 — VERIFICATION', items: workflowSteps.slice(chunkSize * 3) },
          ]

          diagramHtml += `<div class="grid grid-cols-2 gap-3">`

          stages.forEach((stg, stgIdx) => {
            if (stg.items.length === 0) return
            diagramHtml += `
              <div class="p-2.5 rounded-lg border border-slate-200/90 bg-white shadow-2xs">
                <div class="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
                  ${stg.label}
                </div>
                <div class="space-y-1">
            `
            stg.items.forEach((item, itemIdx) => {
              const isOverallFinal = stgIdx === stages.length - 1 && itemIdx === stg.items.length - 1
              diagramHtml += `
                <div class="px-2.5 py-1 rounded text-[11px] font-semibold text-center border ${
                  isOverallFinal
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }">
                  ${item}
                </div>
              `
              if (itemIdx < stg.items.length - 1) {
                diagramHtml += `
                  <div class="flex justify-center text-slate-400 py-0.2">
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                      <path d="M4 0v7m0 0l-2-2m2 2l2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                `
              }
            })
            diagramHtml += `
                </div>
              </div>
            `
          })

          diagramHtml += `</div>`
        } else {
          // Standard linear pipeline with clean vector arrows
          diagramHtml += `<div class="flex flex-col items-center gap-1">`
          workflowSteps.forEach((step, sIdx) => {
            const isFinal = sIdx === workflowSteps.length - 1
            diagramHtml += `
              <div class="px-4 py-1.5 rounded-lg border text-xs font-semibold tracking-tight text-center max-w-md w-full transition-colors ${
                isFinal
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
              }">
                ${step}
              </div>
            `
            if (!isFinal) {
              diagramHtml += `
                <div class="text-slate-400 py-0.5 flex justify-center">
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" class="text-slate-400">
                    <path d="M5 0v10m0 0l-3-3m3 3l3-3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              `
            }
          })
          diagramHtml += `</div>`
        }

        diagramHtml += `</div>`

        const wrapper = doc.createElement('div')
        wrapper.innerHTML = diagramHtml
        outputElements.push(wrapper.firstElementChild)
        i = stepIdx
        continue
      }
    }

    // ── 2. DETECT CORE PRINCIPLE / CONTRAST ("NOT") BLOCKS ──────────────
    // e.g.:
    // CORE PRINCIPLE
    // Evidence → Analysis → Candidate Gap → Verification → Explanation
    // NOT
    // LLM → Guess a Gap
    if (
      text.toUpperCase().includes('CORE PRINCIPLE') ||
      text.toUpperCase().includes('CORE APPROACH') ||
      (text.includes('→') && text.toUpperCase().includes('NOT'))
    ) {
      let combined = text
      let nextI = i + 1
      while (nextI < children.length && nextI < i + 5) {
        const nextText = children[nextI].textContent.trim()
        if (
          nextText.toUpperCase() === 'NOT' ||
          nextText.includes('→') ||
          nextText.includes('->') ||
          nextText.toUpperCase().includes('LLM') ||
          nextText.toUpperCase().includes('GUESS')
        ) {
          combined += ' ' + nextText
          nextI++
        } else {
          break
        }
      }

      const parts = combined.split(/\bNOT\b/i)
      if (parts.length >= 2) {
        const approvedPart = parts[0]
          .replace(/CORE PRINCIPLE/i, '')
          .replace(/CORE APPROACH/i, '')
          .trim()
        const rejectedPart = parts[1].trim()

        const approvedPills = approvedPart.split(/→|->/).map((p) => p.trim()).filter(Boolean)
        const rejectedPills = rejectedPart.split(/→|->/).map((p) => p.trim()).filter(Boolean)

        let contrastHtml = `
          <div class="pdf-contrast-box my-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 break-inside-avoid">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Core Principle &amp; Methodology
            </div>
            
            <div class="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs mb-2.5">
              <div class="text-[9px] font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-slate-800"></span>
                <span>Systematic Grounded Approach</span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
        `

        approvedPills.forEach((p, pIdx) => {
          contrastHtml += `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80">${p}</span>`
          if (pIdx < approvedPills.length - 1) {
            contrastHtml += `<span class="text-slate-400 text-xs font-bold">→</span>`
          }
        })

        contrastHtml += `
              </div>
            </div>

            <div class="p-3 rounded-lg bg-slate-100/50 border border-slate-200/70">
              <div class="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                <span>Contrast: Unverifiable Generation (NOT)</span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
        `

        rejectedPills.forEach((p, pIdx) => {
          contrastHtml += `<span class="px-2 py-0.5 rounded bg-white text-slate-500 text-xs font-medium border border-slate-200/60 line-through opacity-75">${p}</span>`
          if (pIdx < rejectedPills.length - 1) {
            contrastHtml += `<span class="text-slate-300 text-xs">→</span>`
          }
        })

        contrastHtml += `
              </div>
            </div>
          </div>
        `

        const wrapper = doc.createElement('div')
        wrapper.innerHTML = contrastHtml
        outputElements.push(wrapper.firstElementChild)
        i = nextI
        continue
      }
    }

    // ── 3. DETECT HORIZONTAL TECHNICAL PIPELINES ─────────────────────────
    // e.g. "Sentence → Sentence Transformer → 384-dimensional vector → FAISS Index → Similarity Search → Relevant Evidence"
    if (text.includes('→') || (text.includes('->') && text.split(/→|->/).length >= 3)) {
      const steps = text.split(/→|->/).map((s) => s.trim()).filter(Boolean)
      if (steps.length >= 3) {
        let pipeHtml = `
          <div class="my-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 break-inside-avoid">
            <div class="flex items-center gap-1.5 flex-wrap">
        `
        steps.forEach((s, sIdx) => {
          pipeHtml += `<span class="px-2 py-1 rounded bg-white text-slate-800 text-xs font-semibold border border-slate-200 shadow-2xs">${s}</span>`
          if (sIdx < steps.length - 1) {
            pipeHtml += `<span class="text-slate-400 text-xs font-bold">→</span>`
          }
        })
        pipeHtml += `
            </div>
          </div>
        `
        const wrapper = doc.createElement('div')
        wrapper.innerHTML = pipeHtml
        outputElements.push(wrapper.firstElementChild)
        i++
        continue
      }
    }

    // ── 4. DETECT CONSECUTIVE BULLET ITEMS AND BUNDLE INTO <UL> ──────────
    if (isBulletItem(text)) {
      const listItems = [cleanBulletText(text)]
      let bulletIdx = i + 1

      while (bulletIdx < children.length) {
        const nextBulletText = children[bulletIdx].textContent.trim()
        if (isBulletItem(nextBulletText)) {
          listItems.push(cleanBulletText(nextBulletText))
          bulletIdx++
        } else {
          break
        }
      }

      const ul = doc.createElement('ul')
      ul.className = 'pdf-academic-list my-2.5 space-y-1.5 pl-4 text-xs text-slate-800 leading-relaxed'
      listItems.forEach((item) => {
        const li = doc.createElement('li')
        li.className = 'list-disc pl-1 text-slate-800'
        li.textContent = item
        ul.appendChild(li)
      })

      outputElements.push(ul)
      i = bulletIdx
      continue
    }

    // ── 5. DETECT HEADINGS AND NORMALIZE TYPOS ───────────────────────────
    // e.g. "1.What exactly we have built ?" or <h1> / <h2>
    const isHeadingTag = /^h[1-6]$/.test(tagName)
    const isNumberedHeading = /^\d+(?:\.\d+)*\./.test(text) && text.length < 100

    if (isHeadingTag || isNumberedHeading) {
      const cleaned = cleanHeadingText(text)
      const isTopLevel = tagName === 'h1' || /^\d+\.\s/.test(cleaned)
      const headingEl = doc.createElement(isTopLevel ? 'h2' : 'h3')
      headingEl.textContent = cleaned

      if (isTopLevel) {
        headingEl.className = 'text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-5 mb-2 pb-1 border-b border-slate-200 break-after-avoid'
      } else {
        headingEl.className = 'text-xs sm:text-sm font-bold text-slate-800 tracking-tight mt-3.5 mb-1.5 break-after-avoid'
      }

      outputElements.push(headingEl)
      i++
      continue
    }

    // ── 6. DETECT MARKDOWN TABLES OR TWO-COLUMN DATA ────────────────────
    // Markdown table rows: | Component | Purpose |
    if (text.startsWith('|') && text.endsWith('|')) {
      const tableRows = [text]
      let tIdx = i + 1
      while (tIdx < children.length) {
        const nextRow = children[tIdx].textContent.trim()
        if (nextRow.startsWith('|') && nextRow.endsWith('|')) {
          tableRows.push(nextRow)
          tIdx++
        } else {
          break
        }
      }

      if (tableRows.length >= 2) {
        const parsedRows = tableRows
          .filter((row) => !/^\|[\s\-:|]+\|$/.test(row)) // remove separator |---|---|
          .map((row) =>
            row
              .slice(1, -1)
              .split('|')
              .map((cell) => cell.trim())
          )

        if (parsedRows.length > 0) {
          const headerCells = parsedRows[0]
          const bodyRows = parsedRows.slice(1)

          let tableHtml = `
            <table class="w-full my-3.5 border-collapse text-xs text-slate-800 break-inside-avoid border border-slate-200">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
          `
          headerCells.forEach((h) => {
            tableHtml += `<th class="py-2 px-3 text-left font-bold text-slate-900 text-xs tracking-tight">${h}</th>`
          })
          tableHtml += `
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
          `
          bodyRows.forEach((row) => {
            tableHtml += `<tr class="hover:bg-slate-50/50">`
            row.forEach((c) => {
              tableHtml += `<td class="py-2 px-3 text-slate-800 text-xs leading-normal">${c}</td>`
            })
            tableHtml += `</tr>`
          })
          tableHtml += `
              </tbody>
            </table>
          `

          const wrapper = doc.createElement('div')
          wrapper.innerHTML = tableHtml
          outputElements.push(wrapper.firstElementChild)
          i = tIdx
          continue
        }
      }
    }

    // ── 7. DETECT STANDALONE RESEARCH QUOTATIONS ─────────────────────────
    if (
      (text.startsWith('"') && text.endsWith('"') && text.length > 15) ||
      (text.startsWith('“') && text.endsWith('”') && text.length > 15) ||
      tagName === 'blockquote'
    ) {
      const bq = doc.createElement('blockquote')
      bq.className = 'my-2.5 pl-3.5 py-1.5 border-l-2 border-slate-400 bg-slate-50/70 rounded-r text-xs italic text-slate-700 leading-relaxed break-inside-avoid'
      bq.innerHTML = innerHtml || text
      outputElements.push(bq)
      i++
      continue
    }

    // ── 8. NORMAL HTML TABLES ───────────────────────────────────────────
    if (tagName === 'table') {
      el.className = 'w-full my-3 border-collapse text-xs text-slate-800 break-inside-avoid border border-slate-200'
      outputElements.push(el)
      i++
      continue
    }

    // ── 9. NORMAL PARAGRAPHS ────────────────────────────────────────────
    if (text.length > 0) {
      const p = doc.createElement('p')
      p.className = 'text-xs text-slate-800 leading-relaxed my-2'
      p.innerHTML = innerHtml || text
      outputElements.push(p)
    }

    i++
  }

  // Create container and return serialized HTML
  const container = doc.createElement('div')
  outputElements.forEach((el) => container.appendChild(el))
  return container.innerHTML || rawHtml
}
