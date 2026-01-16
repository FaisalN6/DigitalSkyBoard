'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/api';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userStr));
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetchWithAuth('http://localhost:8001/api/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-indigo-900 text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Flights', icon: '✈️', path: '/dashboard/flights' },
    { name: 'Airlines', icon: '🏢', path: '/dashboard/airlines' },
    { name: 'Airports', icon: '🌍', path: '/dashboard/airports' },
    { name: 'Gates', icon: '🚪', path: '/dashboard/gates' },
    { name: 'Flight Status', icon: 'ℹ️', path: '/dashboard/flight-statuses' },
    { name: 'Users', icon: '👥', path: '/dashboard/users' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-24'
          } bg-white transition-all duration-300 flex flex-col fixed h-full z-20 left-0 top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100/50`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between h-24">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                DB
              </div>
              <span className="text-gray-900 font-extrabold text-xl tracking-tight">DigiBoard</span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-indigo-200">
              DB
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-indigo-600 hidden lg:block transition-all p-2 hover:bg-indigo-50 rounded-xl absolute -right-3 top-8 bg-white border border-gray-100 shadow-sm"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 font-medium'
                  }`}
              >
                <span className={`text-xl w-6 text-center transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className={`truncate ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className={`flex items-center gap-4 ${!isSidebarOpen && 'justify-center'}`}>
            <div className={`w-12 h-12 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-indigo-700 font-bold shrink-0 overflow-hidden ring-2 ring-indigo-50`}>
              {user?.name.charAt(0)}
            </div>

            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm font-bold truncate">{user?.name}</p>
                <p className="text-gray-500 text-xs truncate font-medium">{user?.email}</p>
              </div>
            )}

            {isSidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-24'
          } p-10 bg-slate-50 min-h-screen`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
