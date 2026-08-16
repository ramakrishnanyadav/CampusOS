import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#F8F9FE]">
      {/* Soft Enterprise Purple Subtle Radial Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-[#6366F1]/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-3xl" />
    </div>
  );
};
