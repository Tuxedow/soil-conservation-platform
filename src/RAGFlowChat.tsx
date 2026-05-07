import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader2, Trash2, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface RAGFlowChatProps {
  onClose?: () => void;
}

const RAGFLOW_URL = 'https://dtgis.com.cn:55558/next-chats/share?shared_id=fc9971fa1ddb11f195020242ac140006&from=chat&auth=bKG1WNOGTPHDAfY5mdu5SJclO_v4ZIYn&theme=light';

export default function RAGFlowChat({ onClose }: RAGFlowChatProps) {
  const [mode, setMode] = useState<'chat' | 'iframe'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是水土保持知识助手，可以回答您关于法规、标准、方案编制等问题。请问有什么可以帮助您的？',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 模拟 AI 回复（因为无法直接调用 API）
    setTimeout(() => {
      const responses = [
        '根据《水土保持法》第二十二条规定，生产建设项目应当编制水土保持方案...',
        '关于水土保持措施设计，建议参考 GB/T 15772-2022《水土保持综合治理规划通则》...',
        '您可以参考同类型项目的案例，比如高速公路项目的水土保持方案...',
        '根据规范要求，林草覆盖率应达到 25% 以上才算合格...',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '对话已清空，请问还有什么可以帮助您的？',
      },
    ]);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-secondary)',
    }}>
      {/* 头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--primary)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={22} />
          <span style={{ fontWeight: 600 }}>AI 智能助手</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setMode(mode === 'chat' ? 'iframe' : 'chat')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
            title={mode === 'chat' ? '切换到完整对话' : '切换到简洁模式'}
          >
            <ExternalLink size={14} />
            {mode === 'chat' ? '完整版' : '简洁版'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      {mode === 'iframe' ? (
        <iframe
          ref={iframeRef}
          src={RAGFLOW_URL}
          style={{
            flex: 1,
            border: 'none',
            width: '100%',
            height: '100%',
          }}
          title="RAGFlow Chat"
        />
      ) : (
        <>
          {/* 对话区域 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {messages.map(message => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {message.role === 'assistant' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0,
                  }}>
                    <Bot size={18} />
                  </div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: message.role === 'user' ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}>
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--gray-300)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gray-600)',
                    flexShrink: 0,
                  }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end',
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入问题，按 Enter 发送..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  resize: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  minHeight: '44px',
                  maxHeight: '120px',
                }}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  opacity: input.trim() && !isLoading ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Send size={16} />
                发送
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
              当前为模拟回复，如需完整功能请点击右上角「完整版」切换
            </p>
          </div>
        </>
      )}
    </div>
  );
}
