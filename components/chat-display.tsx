'use client';

import { useChat } from './chat-context';
import { StreamingResponse } from './streaming-response';

export function ChatDisplay() {
  const { messages, currentResponse, isStreaming } = useChat();

  return (
    <div className="p-4 max-w-3xl w-full mx-auto space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="space-y-4">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">{message.message}</div>
          </div>

          {/* AI Response */}
          {(message.response || message.isStreaming) && <StreamingResponse response={message.response} isStreaming={message.isStreaming} />}
        </div>
      ))}
    </div>
  );
}
