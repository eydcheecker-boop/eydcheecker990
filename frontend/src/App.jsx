import React, { useState, useEffect } from 'react'
import Editor from './components/Editor'

export default function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">EYD / PUEBI Checker</h1>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition rounded text-gray-900 dark:text-white"
              onClick={() => setDark(!dark)}
            >
              {dark ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        <main className="rounded-lg p-6 shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Editor />
        </main>
      </div>
    </div>
  )
}
