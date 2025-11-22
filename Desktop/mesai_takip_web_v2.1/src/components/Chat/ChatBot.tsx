import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Minimize2, Maximize2, X, MessageCircle } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'error';
}

interface ChatBotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen: initialIsOpen = false, onToggle }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Ben MESA Asistanınız. Size nasıl yardımcı olabilirim?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle?.();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Maaş ile ilgili sorular
    if (message.includes('maaş') || message.includes('ücret') || message.includes('salary')) {
      return 'Maaş bilgilerinizi "Maaş Yönetimi" sayfasından görüntüleyebilirsiniz. Aylık brüt/net maaş, prim ve kesintilerinizi detaylı olarak takip edebilirsiniz.';
    }
    
    // Mesai ile ilgili sorular
    if (message.includes('mesai') || message.includes('fazla') || message.includes('overtime')) {
      return 'Mesai kayıtlarınızı "Mesai Takibi" sayfasından yönetebilirsiniz. Yapılan mesailerin onay durumunu ve ücret hesaplamalarını buradan takip edebilirsiniz.';
    }
    
    // İzin ile ilgili sorular
    if (message.includes('izin') || message.includes('tatil') || message.includes('leave')) {
      return 'İzin taleplerinizi "İzin Yönetimi" sayfasından oluşturabilir ve takip edebilirsiniz. Yıllık izin, hastalık izni gibi tüm izin türlerini buradan yönetebilirsiniz.';
    }
    
    // Raporlama ile ilgili sorular
    if (message.includes('rapor') || message.includes('analiz') || message.includes('report')) {
      return 'Raporlar ve analizler için "Raporlar" sayfasını kullanabilirsiniz. Aylık gelir analizi, mesai raporları ve çalışma istatistiklerini burada bulabilirsiniz.';
    }
    
    // AI özellikleri
    if (message.includes('ai') || message.includes('yapay') || message.includes('zeka')) {
      return 'AI özelliklerimiz sayesinde maaş tahminleri, mesai optimizasyonu ve anomali tespiti gibi akıllı özelliklerden faydalanabilirsiniz. AI Dashboard sayfasından daha fazla bilgi edinin.';
    }
    
    // Yardım ve destek
    if (message.includes('yardım') || message.includes('destek') || message.includes('help')) {
      return 'Size nasıl yardımcı olabilirim? Maaş, mesai, izin, raporlama veya AI özellikleri hakkında sorularınızı yanıtlayabilirim.';
    }
    
    // Varsayılan yanıtlar
    const defaultResponses = [
      'Bu konuda daha fazla bilgi almak için ilgili menüyü kullanabilirsiniz.',
      'Bu sorunun cevabını belgelerde bulabilir veya yöneticinize danışabilirsiniz.',
      'Size başka bir konuda yardımcı olabilir miyim?',
      'Bu özellik hakkında detaylı bilgi için ilgili sayfayı ziyaret edebilirsiniz.'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simüle edilmiş bot yanıtı
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const suggestions = [
    'Maaş bilgilerimi nasıl görüntüleyebilirim?',
    'Mesai kaydı nasıl eklerim?',
    'İzin talebi nasıl oluştururum?',
    'AI özellikleri nelerdir?'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Chatbot'u aç"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
      isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">MESA Asistan</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMinimize}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label={isMinimized ? 'Büyüt' : 'Küçült'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleToggle}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[440px] overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Önerilen sorular:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                aria-label="Mesaj gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
