'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import Image from 'next/image';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white border-b">
      <div className="flex items-center gap-2">
        {/* <Image src="/logo-alfajr.png" alt="Alfajr Logo" width={32} height={32} /> */}
        <span className="font-bold text-lg text-black">E-Learning</span>
      </div>
      <button
        onClick={onMenuClick}
        className="p-2 text-black"
      >
        <Menu size={24} />
      </button>
    </div>
  );
};

export default MobileHeader;
