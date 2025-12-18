// app/(admin)/admin/layout.tsx
'use client';

import { AuthProvider } from '@/context/AuthContext';
import React from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import dynamic from 'next/dynamic';

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
        <div className="flex min-h-screen bg-brand-gray">
          <AdminSidebar />
          {/* Main Content */}
          <main className="flex-1 ml-64">
            {children}
          </main>
        </div>
      </ScreenProtection>
    </AuthProvider>
  );
}