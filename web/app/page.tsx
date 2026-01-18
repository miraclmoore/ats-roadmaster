import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Check if user is already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center max-w-4xl">
        <h1 className="text-6xl font-bold text-center">
          🚛 RoadMaster Pro
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400">
          Economic Analysis & Performance Tracking for American Truck Simulator
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            href="/login"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            Sign Up
          </a>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">📊 Track Profitability</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor job income, expenses, and profit per mile in real-time
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">⛽ Optimize Performance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Improve fuel economy and reduce damage with AI-powered insights
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">🤖 AI Dispatcher</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get personalized job recommendations based on your history
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
