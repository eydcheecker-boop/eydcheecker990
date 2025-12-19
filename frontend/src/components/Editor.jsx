import React, { useState, useReducer, useRef, useEffect } from 'react'

// Helper reducer for undo/redo of correction decisions
function historyReducer(state, action) {
  const { past, present, future } = state
  switch (action.type) {
    case 'apply':
      return { past: [...past, present], present: action.payload, future: [] }
    case 'undo':
      if (past.length === 0) return state
      const prev = past[past.length - 1]
      return { past: past.slice(0, -1), present: prev, future: [present, ...future] }
    case 'redo':
      if (future.length === 0) return state
      const next = future[0]
      return { past: [...past, present], present: next, future: future.slice(1) }
    default:
      return state
  }
}

export default function Editor() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // decisions state: list of {original, suggested, rule, accepted}
  const [history, dispatch] = useReducer(historyReducer, { past: [], present: [], future: [] })
  const fileNameRef = useRef('corrected.txt')

  // Keep result.corrections synced with history.present so preview updates when user accepts
  useEffect(() => {
    if (!result) return
    setResult((r) => ({ ...r, corrections: history.present }))
  }, [history.present])


  async function handleCheck() {
    setLoading(true)
    try {
      const res = await fetch('/api/check_eyd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      console.log('API response:', data)
      // attach accepted flag false by default
      const items = data.corrections.map((c, idx) => ({ ...c, id: idx, accepted: false }))
      setResult({ text: data.text, corrections: items })
      dispatch({ type: 'apply', payload: items })
    } catch (err) {
      console.error('Fetch error:', err)
      alert('Error checking EYD: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleAccept(id, accept) {
    const current = history.present && history.present.length ? history.present : (result ? result.corrections : [])
    const next = current.map((c) => (c.id === id ? { ...c, accepted: accept } : c))
    dispatch({ type: 'apply', payload: next })
    // result will be synced by useEffect watching history.present
  }

  function handleUndo() { dispatch({ type: 'undo' }) }
  function handleRedo() { dispatch({ type: 'redo' }) }

  function applyCorrections() {
    if (!result) return ''
    let out = result.text
    // Apply accepted corrections sequentially (naive string replace)
    result.corrections.forEach((c) => {
      if (c.accepted) {
        // replace only first occurrence to avoid global accidental replacements
        out = out.replace(c.original, c.suggested)
      }
    })
    return out
  }

  // Render preview markup showing suggested corrections (not necessarily accepted)
  function escapeHtml(unsafe) {
    return unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  function renderPreviewMarkup() {
    if (!result) return ''
    let out = escapeHtml(result.text)
    // Apply all suggestions (naive sequential replace)
    result.corrections.forEach((c) => {
      const origEsc = escapeHtml(c.original)
      const sugEsc = escapeHtml(c.suggested)
      // replace first occurrence
      out = out.replace(origEsc, `<span class=\"suggestion\">${sugEsc}</span>`)
    })
    // preserve line breaks
    return out.replaceAll('\n', '<br/>')
  }

  function copyText() {
    const out = applyCorrections()
    navigator.clipboard.writeText(out)
  }

  function downloadText() {
    const out = applyCorrections()
    const blob = new Blob([out], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = fileNameRef.current
    a.click()
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Masukkan teks bahasa Indonesia</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full rounded-md p-3 border border-gray-300 bg-white text-gray-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 transition dark:bg-gray-800 dark:text-white dark:border-gray-700"
        placeholder="Tulis atau tempel teks di sini..."
      />

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleCheck}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 text-white rounded hover:opacity-90 dark:bg-slate-200 dark:text-black transition flex items-center gap-2"
        >
          {loading ? <Spinner /> : 'Periksa EYD'}
        </button>
        <button onClick={() => { setText('') }} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">Bersihkan</button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hasil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Teks Asli</h3>
              <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">{result.text}</p>
            </div>

            <div className="p-4 border rounded bg-green-50 dark:bg-gray-700 border-green-200 dark:border-gray-600">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Teks Koreksi (preview)</h3>
              <p className="text-sm whitespace-pre-wrap text-green-700 dark:text-green-300 font-medium" dangerouslySetInnerHTML={{ __html: renderPreviewMarkup() }} />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Saran Perbaikan</h3>
            <ul className="space-y-2">
              {history.present.map((c) => (
                <li key={c.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 flex items-start justify-between">
                  <div className="max-w-[70%]">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{c.original}</span>
                      <span className="mx-2 text-gray-500 dark:text-gray-400">→</span>
                      <span className="suggestion text-blue-600 dark:text-blue-400 font-medium">{c.suggested}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{c.rule}</div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700" onClick={() => toggleAccept(c.id, true)}>Terima</button>
                      <button className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white" onClick={() => toggleAccept(c.id, false)}>Abaikan</button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={handleUndo} className="px-2 py-1 bg-white border rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-white">Undo</button>
                      <button onClick={handleRedo} className="px-2 py-1 bg-white border rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-white">Redo</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2">
              <input ref={fileNameRef} defaultValue="corrected.txt" className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <button onClick={copyText} className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700">Copy</button>
              <button onClick={downloadText} className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300">Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
