import { Header } from '@/components/layout/Header';
import { ChatBox } from '@/components/chat/ChatBox';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          What do you want to know?
        </h1>
        <ChatBox />
      </main>
    </div>
  );
}
