import { SearchBarInput } from '../../components/searchbar-input';
import { ChatDisplay } from '../../components/chat-display';
import { ChatProvider } from '../../components/chat-context';

export default function Home() {
  return (
    <ChatProvider>
      <div className="flex flex-col h-screen bg-gray-900">
        <div className="flex-1 overflow-y-auto">
          <ChatDisplay />
        </div>
        <div className="border-t border-gray-800">
          <SearchBarInput />
        </div>
      </div>
    </ChatProvider>
  );
}
