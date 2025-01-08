import Sidebar from '@/components/layout/Sidebar';
import ChatBox from '@/components/chat/ChatBox';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center">
          <ChatBox />
        </div>
      </main>
    </div>
  );
}
