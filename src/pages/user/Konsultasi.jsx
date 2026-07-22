import { useState, useRef, useEffect } from 'react'
import UserLayout from '../../components/UserLayout'
import { useAuthStore } from '../../store/authStore'

const SYSTEM_PROMPT = `Kamu adalah asisten konsultasi pertanian TechLeaf yang ahli dalam bidang:
- Bioinsektisida organik berbasis nikotin tembakau
- Pengelolaan hama tanaman hortikultura (sayuran dan buah-buahan)
- Pertanian organik dan teknik berkelanjutan
- Pengelolaan limbah tembakau menjadi produk bernilai
- Produk TechLeaf: Basic (500ml, Rp18.000/liter), Pro (1 liter, Rp25.000/liter), Bulk (jerigen 5L, Rp15.000/liter)

Cara menjawab:
- Gunakan bahasa Indonesia yang ramah, jelas, dan mudah dipahami petani
- Berikan saran praktis dan spesifik
- Jika ditanya tentang produk TechLeaf, jelaskan dengan detail
- Jika pertanyaan di luar topik pertanian dan TechLeaf, arahkan kembali ke topik yang relevan
- Jawab dengan singkat dan padat, maksimal 3-4 paragraf`

function Konsultasi() {
  const { profile } = useAuthStore()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Halo, ${profile?.nama?.split(' ')[0] || 'Petani'}! Saya asisten konsultasi TechLeaf. Saya siap membantu kamu seputar penggunaan bioinsektisida organik, pengendalian hama, pertanian organik, dan produk TechLeaf. Ada yang ingin ditanyakan?`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const body = {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Groq error:', data)
        throw new Error(data?.error?.message || 'Gagal menghubungi AI')
      }

      const reply = data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses pertanyaan kamu saat ini.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('Error:', err.message)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Maaf, terjadi kesalahan: ${err.message}`
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Halo, ${profile?.nama?.split(' ')[0] || 'Petani'}! Saya asisten konsultasi TechLeaf. Saya siap membantu kamu seputar penggunaan bioinsektisida organik, pengendalian hama, pertanian organik, dan produk TechLeaf. Ada yang ingin ditanyakan?`,
    }])
  }

  const suggestions = [
    'Bagaimana cara menggunakan TechLeaf Basic?',
    'Hama apa saja yang bisa dikendalikan?',
    'Berapa dosis yang tepat untuk tanaman cabai?',
    'Apa perbedaan TechLeaf Basic dan Pro?',
  ]

  return (
    <UserLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Konsultasi AI</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tanya seputar pertanian organik dan produk TechLeaf</p>
          </div>
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bersihkan Chat
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 bg-white border border-gray-100 rounded-xl overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-green-600 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-white font-bold text-xs">TL</span>
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-tr-sm'
                    : 'bg-gray-50 text-gray-800 rounded-tl-sm'
                }`}
              >
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-green-600 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-white font-bold text-xs">TL</span>
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* SUGGESTIONS */}
        {messages.length === 1 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); inputRef.current?.focus() }}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-full hover:border-green-300 hover:text-green-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT AREA */}
        <div className="mt-3 flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan kamu di sini... (Enter untuk kirim)"
            rows={1}
            disabled={loading}
            className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none disabled:opacity-60"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            Kirim
          </button>
        </div>

      </div>
    </UserLayout>
  )
}

export default Konsultasi