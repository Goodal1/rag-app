'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  isStreaming: boolean;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  currentResponse: string;
  isStreaming: boolean;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: string) => string;
  updateResponse: (messageId: string, response: string) => void;
  setStreaming: (messageId: string, streaming: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const addMessage = (message: string): string => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      response: '',
      isStreaming: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateResponse = (messageId: string, response: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, response } : msg)));
    setCurrentResponse(response);
  };

  const setStreaming = (messageId: string, streaming: boolean) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: streaming } : msg)));
    setIsStreaming(streaming);
  };

  const sendMessage = async (message: string): Promise<void> => {
    const messageId = addMessage(message);
    setStreaming(messageId, true);
    setCurrentResponse('');

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              setStreaming(messageId, false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedResponse += parsed.content;
                updateResponse(messageId, accumulatedResponse);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      updateResponse(messageId, 'Sorry, something went wrong. Please try again.');
      setStreaming(messageId, false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        currentResponse,
        isStreaming,
        sendMessage,
        addMessage,
        updateResponse,
        setStreaming,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
