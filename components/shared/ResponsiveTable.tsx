// components/shared/ResponsiveTable.tsx
import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Desktop: Normal table view */}
      <div className="hidden md:block overflow-x-auto">
        {children}
      </div>
      
      {/* Mobile: Horizontal scroll with shadow indicators */}
      <div className="md:hidden relative">
        {/* Left scroll shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
        
        {/* Scrollable content */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="inline-block min-w-full">
            {children}
          </div>
        </div>
        
        {/* Right scroll shadow */}
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
        
        {/* Scroll hint */}
        <div className="text-center py-2 text-xs text-gray-500 border-t">
          ← Geser untuk melihat lebih banyak →
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized card view alternative for tables
interface MobileCardListProps {
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const MobileCardList: React.FC<MobileCardListProps> = ({ items, renderCard, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
};

export default ResponsiveTable;
