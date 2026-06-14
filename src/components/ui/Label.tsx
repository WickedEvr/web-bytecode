import React from 'react';

interface LabelProps {
  text: string;
  required?: boolean;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ text, required, className = '' }) => (
  <label className={`block text-white/70 text-[18px] md:text-[20px] lg:text-[24px] font-bold mb-1.5 pl-4 lg:pl-5 tracking-wide ${className}`}>
    {text} {required && <span className="text-[#06CFD6] ml-1">*</span>}
  </label>
);
