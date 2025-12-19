// app/(admin)/admin/layout.tsx
'use client';

import { AuthProvider } from '@/context/AuthContext';
import React from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';

const ScreenProtection = dynamic(
  () => import('@/components/shared/ScreenProtection').then(mod => mod.ScreenProtection),
  { ssr: false }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ScreenProtection
        enableWatermark={true}
        enableBlurOnFocusLoss={true}
        enableKeyboardBlock={true}
        enableContextMenuBlock={true}
        enableDevToolsDetection={true}
        showWarningOnAttempt={true}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex min-h-screen bg-brand-gray">
          <AdminSidebar />
          {/* Main Content - Responsive padding for mobile */}
          <main className="flex-1 w-full md:ml-0">
            {children}
          </main>
        </div>
      </ScreenProtection>
    </AuthProvider>
  );
}
