import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export function Layout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-lg">OpKit</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="px-6 py-6 overflow-y-auto h-[calc(100vh-57px)]">
        <Outlet />
      </main>
    </div>
  );
}
