import { Sidebar } from '@/components/layout/Sidebar';
import { ChatBox } from '@/components/chat/ChatBox';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center p-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Next-R.A.G Chat Assistant
          </h1>
          <ChatBox />
        </div>
      </main>
    </div>
  );
}
