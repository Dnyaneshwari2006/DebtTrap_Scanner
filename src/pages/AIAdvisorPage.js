import React, { useState, useRef, useEffect } from 'react';
import './AIAdvisorPage.css';
import './Page.css';

const SYSTEM_PROMPT = `You are DebtTrap AI, a friendly and brutally honest personal finance advisor specializing in loans, EMIs, and debt management for young Indians.

Your role:
- Analyze loan situations and give clear, actionable advice
- Use real Indian context (CIBIL scores, RBI guidelines, Indian banks, rupees)
- Be direct — don't sugarcoat bad financial decisions
- Keep responses concise (3-5 sentences max per point)
- Use emojis sparingly but effectively
- Always mention debt-to-income ratio if the user shares income + EMI data
- Safe DTI limit: 35%. Danger zone: above 50%
- Format responses with clear sections when needed

You know about: EMI calculations, CIBIL scores, personal loans, home loans, vehicle loans, credit cards, debt consolidation, prepayment strategies, and Indian banking regulations.`;

const SUGGESTED = [
  "I earn ₹45,000/month and my current EMI is ₹12,000. Should I take a ₹2 lakh personal loan at 16%?",
  "My CIBIL score is 680. How can I improve it to 750+ in 6 months?",
  "I have 3 loans running simultaneously. Should I consolidate them?",
  "What's the smartest way to prepay a home loan — lump sum or extra monthly EMI?",
  "I missed 2 EMI payments last month. How badly does this affect my credit?",
];

function Message({ msg }) {
  return (
    <div className={`msg ${msg.role}`}>
      {msg.role === 'assistant' && (
        <div className="msg-avatar">AI</div>
      )}
      <div className="msg-bubble">
        {msg.content.split('\n').map((line, i) => (
          <p key={i} style={{ margin: line === '' ? '0.5rem 0' : '0', lineHeight: 1.6 }}>{line}</p>
        ))}
      </div>
      {msg.role === 'user' && (
        <div className="msg-avatar user-avatar">You</div>
      )}
    </div>
  );
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm DebtTrap AI — your personal finance advisor.\n\nAsk me anything about loans, EMIs, credit scores, or debt strategy. I'll give you straight talk, no fluff.\n\nWhat's your situation?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const anthropicKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  const openAIKey = process.env.REACT_APP_OPENAI_API_KEY;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fallbackAI = (userText) => {
    const lower = userText.toLowerCase();
    if (/cibil|credit score/.test(lower)) {
      return 'A strong CIBIL score is 750+. Pay EMIs on time, keep card utilisation < 30%, and avoid multiple hard inquiries. Check your report monthly and dispute errors promptly.';
    }
    if (/emi|loan|personal loan|home loan|interest|rtgs/.test(lower)) {
      return 'If your EMI-to-income ratio is >35%, your debt risk is high. Prioritize high-interest debt (credit cards, personal loans), then use surplus to prepay the biggest interest rate first. If unsure, take only 70% of loan eligibility and keep liquidity for 3 months.';
    }
    if (/dti|debt.*income/.test(lower)) {
      return 'DTI (debt-to-income) should be <=35%; 35-50% is caution, >50% is unsafe. Reduce monthly debts or increase income before adding more credit.';
    }
    if (/consolidate|consolidation/.test(lower)) {
      return 'Consolidating can lower EMI and simplify payments if you get a lower rate than existing loans. Check tenure and total interest—sometimes longer tenure increases total cost. Keep at least one emergency month buffer.';
    }
    if (/miss.*emi|late.*payment/.test(lower)) {
      return 'Missed EMIs hurt CIBIL and can add 1+% penalty. Pay overdue immediately, add auto-debit, and keep up for 6 months to recover score.';
    }
    return 'I am running in local mode without an API key, so I’m giving general guidance: give me income + EMI + loan type for a sharper recommendation.';
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    const appendAssistant = (reply) => {
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    };

    try {
      if (anthropicKey) {
        const response = await fetch('https://api.anthropic.com/v1/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
          },
          body: JSON.stringify({
            model: 'claude-2.1',
            prompt: `\n\nHuman: ${userText}\n\nAssistant:`,
            max_tokens_to_sample: 500,
            stop_sequences: ['\nHuman:'],
          }),
        });
        const data = await response.json();
        const reply = data.completion?.trim() || fallbackAI(userText);
        appendAssistant(reply);
      } else if (openAIKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAIKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...newMessages.map(m => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 500,
          }),
        });
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || fallbackAI(userText);
        appendAssistant(reply);
      } else {
        appendAssistant(fallbackAI(userText));
      }
    } catch (err) {
      appendAssistant('Something went wrong connecting to the AI. Please try again in a moment.');
      console.error('AI response error', err);
    } finally {
      setLoading(false);
    }
  };


  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-avatar-big">AI</div>
          <div>
            <div className="page-title" style={{ marginBottom: 2 }}>AI Loan Advisor</div>
            <div className="ai-status"><span className="ai-dot" />Powered by Claude</div>
          </div>
        </div>
        <button className="clear-btn" onClick={() => setMessages([{
          role: 'assistant',
          content: "Hey! I'm DebtTrap AI — your personal finance advisor.\n\nAsk me anything about loans, EMIs, credit scores, or debt strategy. I'll give you straight talk, no fluff.\n\nWhat's your situation?",
        }])}>
          Clear chat
        </button>
      </div>

      {messages.length === 1 && (
        <div className="suggestions">
          <div className="suggestions-label">Try asking:</div>
          <div className="suggestions-list">
            {SUGGESTED.map((s, i) => (
              <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-window">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div className="msg assistant">
            <div className="msg-avatar">AI</div>
            <div className="msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-wrap">
        <textarea
          className="chat-input"
          placeholder="Ask about your loan situation..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
