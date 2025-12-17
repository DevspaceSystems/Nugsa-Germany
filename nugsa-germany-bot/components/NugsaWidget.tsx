'use client';

import React, { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { FileDocument, Message, ModelType } from '../types';
import { initChat, sendMessageStream, resetChat } from '../services/geminiService';
import { NUGSA_FAQ_CONTENT, SAMPLE_MESSAGE_CONTENT } from '../data/initialContext';
import { X, MessageCircle } from 'lucide-react';

// TODO: Replace this URL with the actual path to your NUGSA logo in your public folder
const LOGO_URL = "https://ui-avatars.com/api/?name=NUGSA&background=111827&color=fff&rounded=true&bold=true&size=128";

export default function NugsaWidget() {
  // Widget state
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Pre-load context files
  const [files] = useState<FileDocument[]>([
    {
      id: 'nugsa-faq',
      name: 'NUGSA-Germany FAQ.txt',
      type: 'text/plain',
      content: NUGSA_FAQ_CONTENT,
      size: NUGSA_FAQ_CONTENT.length
    },
    {
      id: 'sample-msg',
      name: 'Member Inquiry Sample.txt',
      type: 'text/plain',
      content: SAMPLE_MESSAGE_CONTENT,
      size: SAMPLE_MESSAGE_CONTENT.length
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure we only render on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize chat whenever files change (runs once on mount)
  useEffect(() => {
    resetChat();
    initChat(ModelType.FLASH, files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Listen for external commands from the host website
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpen = () => {
      setIsOpen(true);
      setHasInteracted(true);
    };
    const handleClose = () => setIsOpen(false);
    const handleToggle = () => {
      setIsOpen(prev => {
        if (!prev) setHasInteracted(true);
        return !prev;
      });
    };

    window.addEventListener('nugsa-bot:open', handleOpen);
    window.addEventListener('nugsa-bot:close', handleClose);
    window.addEventListener('nugsa-bot:toggle', handleToggle);

    // Initialize global object for external control
    (window as any).NugsaBot = {
      open: () => window.dispatchEvent(new Event('nugsa-bot:open')),
      close: () => window.dispatchEvent(new Event('nugsa-bot:close')),
      toggle: () => window.dispatchEvent(new Event('nugsa-bot:toggle')),
    };

    return () => {
      window.removeEventListener('nugsa-bot:open', handleOpen);
      window.removeEventListener('nugsa-bot:close', handleClose);
      window.removeEventListener('nugsa-bot:toggle', handleToggle);
    };
  }, []);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasInteracted(true);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const botMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: 'model',
          text: '',
          timestamp: Date.now(),
        },
      ]);

      const stream = sendMessageStream(text, files);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'model',
          text: "I encountered an error. Please try again later.",
          timestamp: Date.now(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden font-sans">
      {/* Widget Container - Positioned Bottom Right */}
      <div className="absolute bottom-5 right-5 flex flex-col items-end gap-4 pointer-events-auto">
        
        {/* Chat Window Popup */}
        <div 
          className={`
            origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            w-[360px] h-[600px] max-h-[80vh] max-w-[calc(100vw-40px)]
            bg-gray-950 rounded-2xl shadow-2xl border border-gray-800
            flex flex-col overflow-hidden
            ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}
          `}
        >
          <ChatInterface 
            messages={messages.filter(m => m.role !== 'system')} 
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            files={files}
            onClose={() => setIsOpen(false)}
            logoUrl={LOGO_URL}
          />
        </div>

        {/* Floating Action Button (Launcher) */}
        <button
          onClick={toggleWidget}
          className={`
            group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl
            transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/10
            ${isOpen ? 'bg-gray-800' : 'bg-white overflow-hidden p-0'}
          `}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? (
            <X size={24} className="text-gray-300" />
          ) : (
             // If image loads successfully, show it. Otherwise fallback to icon.
             !imgError ? (
                <img 
                  src={LOGO_URL} 
                  alt="NUGSA Bot" 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
             ) : (
                <MessageCircle size={28} className="text-indigo-600" />
             )
          )}
          
          {/* Notification Dot */}
          {!hasInteracted && !isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
          )}
        </button>
      </div>
    </div>
  );
}