'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <StarIcon className="h-6 w-6" />
          <span className="text-xl font-semibold">Next-R.A.G</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/"
          className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/chat"
          className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span>Chat</span>
        </Link>
      </nav>

      <div className="p-4 space-y-2 border-t">
        <Button variant="outline" className="w-full">Sign In</Button>
        <Button className="w-full">Sign Up</Button>
      </div>
    </aside>
  );
} 