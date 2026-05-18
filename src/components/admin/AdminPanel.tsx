import React from 'react';
import ShineBorder from '../ui/shine-border';

interface AdminPanelProps {
  children: React.ReactNode;
  className?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ children, className = '' }) => {
  return (
    <ShineBorder
      className={`bg-[#0a0a0a] border-2 border-[#0CA3C6] md:border-transparent ${className}`}
      color={["#024F79", "#026B9B", "#06CFD6", "#0CA3C6"]}
      borderRadius={12} // rounded-xl
      borderWidth={2}
    >
      {/* We use global CSS to hide the animated border on mobile. 
          See the override in index.css or shine-border.tsx */}
      {children}
    </ShineBorder>
  );
};

export default AdminPanel;
