'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, FileDocument } from '../types';
import { Send, Bot, AlertCircle, Info, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  files: FileDocument[];
  onClose?: () => void;
  logoUrl?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, onClose, logoUrl }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input);
    setInput('');

    // Reset height of textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Avatar component with fallback
  const LogoAvatar = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const [error, setError] = useState(false);

    if (error || !logoUrl) {
      return (
        <div className={`
          flex items-center justify-center rounded-full bg-indigo-600 text-white flex-shrink-0
          ${size === "sm" ? "w-6 h-6" : "w-9 h-9"}
        `}>
          <Bot size={size === "sm" ? 14 : 20} />
        </div>
      );
    }

    return (
      <div className={`
        relative rounded-full bg-white overflow-hidden border border-gray-700 flex-shrink-0
        ${size === "sm" ? "w-6 h-6" : "w-9 h-9"}
      `}>
        <img
          src={logoUrl}
          alt="NUGSA Logo"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 w-full relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-r from-gray-900 to-gray-900 border-b border-gray-800 z-10 flex justify-between items-center shadow-md rounded-t-2xl">
        <div className="flex items-center gap-3">
          <LogoAvatar size="md" />
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">NUGSA Assistant</h1>
            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-16 pb-4 px-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 px-4 mt-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 p-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="NUGSA Logo"
                  className="w-full h-full object-contain opacity-80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m8 22 4-9 4 9"/><path d="M8 13h4"/><path d="m8 13-3 3-1-1 4-4"/></svg>';
                  }}
                />
              ) : (
                <Bot size={32} className="text-indigo-400" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Hello there! 👋</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              I'm the official NUGSA Germany assistant. Ask me about visas, student life, or upcoming events!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                {/* Avatar - Only show for bot */}
                {msg.role === 'model' && (
                  <div className="mb-1">
                    <LogoAvatar size="sm" />
                  </div>
                )}

                {/* Bubble */}
                <div className={`
                  p-3 rounded-2xl text-sm leading-relaxed overflow-hidden shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'}
                  ${msg.isError ? 'border-red-500 bg-red-900/20 text-red-200' : ''}
                `}>
                  {msg.role === 'model' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 prose-code:bg-gray-900 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-xs">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                  )}

                  {msg.isError && (
                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-red-400">
                      <AlertCircle size={12} />
                      <span>Error</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="flex flex-row items-end gap-2 max-w-[85%]">
              <div className="mb-1">
                <LogoAvatar size="sm" />
              </div>
              <div className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-gray-900 border-t border-gray-800 rounded-b-2xl">
        <div className="relative flex items-end gap-2 bg-gray-800 p-1.5 rounded-xl border border-gray-700 focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-sm px-2 py-2 focus:outline-none resize-none max-h-24 overflow-y-auto"
            style={{ minHeight: '36px' }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className={`
              p-2 rounded-lg transition-all flex-shrink-0
              ${!input.trim() || isLoading
                ? 'text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'}
            `}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-gray-600">Powered by DevSpace Systems AI</p>
        </div>
      </div>
    </div>
  );
};