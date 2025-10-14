'use client';

import { useChat } from './chat-context';

export function SearchBarInput() {
  const { sendMessage } = useChat();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const message = formData.get('message') as string;

    if (!message.trim()) return;

    // Clear the input field
    (event.target as HTMLFormElement).reset();

    // Send message using global context
    await sendMessage(message);
  }

  return (
    <div className="p-4 max-w-3xl w-full mx-auto">
      <form onSubmit={handleSubmit} className="flex bg-gray-950 rounded-full px-2 py-2 items-center space-between">
        <input type="text" name="message" placeholder="Type your message..." className="size-1 flex-1 bg-gray-950 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" />
        <button type="submit" className="bg-white font-bold text-gray-950   py-2 px-12 rounded-full hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
}
