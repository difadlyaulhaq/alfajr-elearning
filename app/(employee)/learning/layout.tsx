
import React from 'react';
import Sidebar from '@/components/learning/Sidebar';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider> {/* Bungkus dengan AuthProvider */}
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Toaster position="top-right" />
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
