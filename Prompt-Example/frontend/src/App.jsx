import { useEffect, useRef, useState } from 'react'

const MAX_LENGTH = 500
const WELCOME =
  'Hi! I can help with shipping, returns, and order status. For order questions, please include your order number, like QC-1001.'
const QUICK_REPLIES = [
  { label: 'Track my order', message: 'Where is my order?' },
  { label: 'Shipping', message: 'What is your shipping policy?' },
  { label: 'Returns', message: 'What is your return policy?' },
]

const ICONS = {
  robot: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4M9 13v2M15 13v2M1.5 13v3M22.5 13v3" />
      <circle cx="12" cy="3" r="1" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </>
  ),
  minus: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12h8" />
    </>
  ),
  plus: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12h8M12 8v8" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  thumbUp: (
    <path d="M7 11v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Zm0 0 4-8a3 3 0 0 1 3 3v3h5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 18.6 21H7" />
  ),
  thumbDown: (
    <path d="M17 13V3h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3Zm0 0-4 8a3 3 0 0 1-3-3v-3H5a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 5.4 3H17" />
  ),
  check: <path d="m4 12 5 5L20 6" />,
  doubleCheck: <path d="m2 12 5 5L18 6M12 16l1 1L24 6" />,
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" />,
}

function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function HoodSection({ title, subtitle, children }) {
  return (
    <section className="hood-section">
      <h3>
        {title} <span>{subtitle}</span>
      </h3>
      <pre>{children}</pre>
    </section>
  )
}

function UnderTheHood({ hood }) {
  if (!hood) {
    return <p className="hood-empty">Send a message to see what goes to the LLM.</p>
  }

  return (
    <>
      {hood.sent_to_llm ? (
        <p className="hood-status sent">Sent to the LLM ({hood.model})</p>
      ) : (
        <p className="hood-status not-sent">
          Not sent to the LLM. {hood.note} This is what the app prepared:
        </p>
      )}
      <HoodSection title="Rules" subtitle="system message">
        {hood.rules}
      </HoodSection>
      <HoodSection title="Facts" subtitle="user message">
        {hood.facts}
      </HoodSection>
      <HoodSection title="Question" subtitle="user message">
        {hood.question}
      </HoodSection>
    </>
  )
}

function MessageActions({ text }) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="actions">
      <button type="button" aria-label={copied ? 'Copied' : 'Copy reply'} onClick={copy}>
        <Icon name={copied ? 'check' : 'copy'} />
      </button>
      {[
        ['up', 'thumbUp', 'Good reply'],
        ['down', 'thumbDown', 'Bad reply'],
      ].map(([value, icon, label]) => (
        <button
          key={value}
          type="button"
          className={feedback === value ? 'selected' : undefined}
          aria-label={label}
          aria-pressed={feedback === value}
          onClick={() => setFeedback(feedback === value ? null : value)}
        >
          <Icon name={icon} />
        </button>
      ))}
    </div>
  )
}

function Message({ message }) {
  const { role, text, time, answered, welcome } = message
  const isUser = role === 'user'

  return (
    <div className={`message ${isUser ? 'user' : 'bot'}`}>
      {!isUser && (
        <span className="avatar">
          <Icon name="robot" />
        </span>
      )}
      <div className="message-body">
        <div className={`bubble ${role}`}>
          {text}
          {role === 'bot' && !welcome && <MessageActions text={text} />}
        </div>
        <p className="meta">
          {time}
          {isUser && (
            <span className={answered ? 'ticks answered' : 'ticks'}>
              <Icon name={answered ? 'doubleCheck' : 'check'} />
            </span>
          )}
        </p>
      </div>
      {isUser && (
        <span className="avatar user">
          <Icon name="person" />
        </span>
      )}
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: WELCOME, time: currentTime(), welcome: true },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hood, setHood] = useState(null)
  const [showHood, setShowHood] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, sending, minimized])

  async function send(rawText) {
    const text = rawText.trim()
    if (!text || sending) return

    setMessages((current) => [...current, { role: 'user', text, time: currentTime() }])
    setInput('')
    setSending(true)

    let answer
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      let data = null
      try {
        data = await response.json()
      } catch {
        // The server (or a proxy in front of it) sent something that isn't JSON.
      }
      if (!data) {
        answer = { role: 'error', text: `The server sent an unexpected response (HTTP ${response.status}). Please try again.` }
      } else {
        if (data.under_the_hood) setHood(data.under_the_hood)
        answer = response.ok
          ? { role: 'bot', text: data.reply }
          : { role: 'error', text: data.error }
      }
    } catch {
      answer = { role: 'error', text: "Couldn't reach the server. Is the backend running? (On Colab: the session may have stopped. Re-run the last cell for a new link.)" }
    }

    setMessages((current) => {
      const updated = [...current]
      if (answer.role === 'bot') {
        updated[updated.length - 1] = { ...updated[updated.length - 1], answered: true }
      }
      return [...updated, { ...answer, time: currentTime() }]
    })
    setSending(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    send(input)
  }

  return (
    <main className="page">
      <div className="chat">
        <header className="chat-header">
          <span className="chat-header-icon">
            <Icon name="robot" />
          </span>
          <div>
            <h1>AI Assistant</h1>
            <p className="status">
              <span className="status-dot" /> Online
            </p>
          </div>
          <button
            type="button"
            className="minimize"
            aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
            aria-expanded={!minimized}
            onClick={() => setMinimized(!minimized)}
          >
            <Icon name={minimized ? 'plus' : 'minus'} />
          </button>
        </header>

        {!minimized && (
          <>
            <div className="log" ref={logRef} role="log" aria-live="polite">
              {messages.map((message, index) => (
                <Message key={index} message={message} />
              ))}
              {sending && (
                <div className="message bot">
                  <span className="avatar">
                    <Icon name="robot" />
                  </span>
                  <div className="message-body">
                    <div className="bubble bot typing">Thinking…</div>
                  </div>
                </div>
              )}
            </div>

            <div className="composer">
              <div className="chips">
                {QUICK_REPLIES.map(({ label, message }) => (
                  <button
                    key={label}
                    type="button"
                    className="chip"
                    disabled={sending}
                    onClick={() => send(message)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={MAX_LENGTH}
                  placeholder="Type your message here..."
                  aria-label="Your message"
                  autoFocus
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!input.trim() || sending}
                >
                  <Icon name="send" />
                </button>
              </form>
              <p className="counter">
                {input.length}/{MAX_LENGTH}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="hood">
        <button
          type="button"
          className="hood-toggle"
          aria-expanded={showHood}
          onClick={() => setShowHood(!showHood)}
        >
          {showHood ? 'Hide Under the Hood' : 'Show Under the Hood'}
        </button>
        {showHood && <UnderTheHood hood={hood} />}
      </div>
    </main>
  )
}
