// app/(admin)/admin/layout.tsx
'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import { ScreenProtection } from '@/components/shared/ScreenProtection';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}