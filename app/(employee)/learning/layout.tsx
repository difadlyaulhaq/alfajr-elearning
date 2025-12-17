'use client';

import React from 'react';
import Sidebar from '@/components/learning/Sidebar';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ScreenProtection } from '@/components/shared/ScreenProtection';
import { useAuth } from '@/hooks/useAuth';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <ScreenProtection
      userEmail={user?.email}
      enableWatermark={true}
      enableBlurOnFocusLoss={true}
      enableKeyboardBlock={true}
      enableContextMenuBlock={true}
      enableDevToolsDetection={true}
      showWarningOnAttempt={true}
    >
      <div className="flex h-screen bg-brand-gray">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Toaster position="top-right" />
          {children}
        </main>
      </div>
    </ScreenProtection>
  );
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
