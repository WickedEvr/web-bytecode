import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption { value: string; label: string; }
export interface CustomDropdownProps { 
  value: string; 
  options: DropdownOption[]; 
  onChange: (val: string) => void; 
  placeholder: string; 
  required?: boolean; 
  disabled?: boolean;
  variant?: 'admin' | 'public'; 
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, options, onChange, placeholder, required, disabled = false, variant = 'admin'}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPublic = variant === 'public';
  const triggerTextSize = isPublic ? 'text-[20px]' : 'text-[15px]';
  const optionTextSize = isPublic ? 'text-[20px] py-3' : 'text-[14px] py-1.5';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input type="text" value={value} onChange={() => {}} required={required} disabled={disabled} className="absolute opacity-0 w-full h-full -z-10 pointer-events-none" tabIndex={-1} />
      <div onClick={() => { if (!disabled) setIsOpen(!isOpen); }} aria-disabled={disabled} className={`flex items-center justify-between w-full bg-white rounded-full px-6 py-[0.6rem] shadow-sm transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isOpen ? 'ring-2 ring-[#06CFD6]' : ''}`}>
        <span className={`${triggerTextSize} ${value ? 'text-[#333]' : 'text-gray-400'}`}>{selectedLabel}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100]">
            <div className="py-2 max-h-[207.5px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <div key={option.value} onClick={() => { onChange(option.value); setIsOpen(false); }} className={`px-6 cursor-pointer transition-colors ${optionTextSize} ${value === option.value ? 'bg-[#06CFD6]/15 text-[#06CFD6] font-bold' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
