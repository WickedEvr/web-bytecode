import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  required?: boolean;
  label: React.ReactNode;
  className?: string;
  textSizeClassName?: string;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onChange,
  name,
  required,
  label,
  className = '',
  textSizeClassName = 'text-[14px] md:text-[15px]',
}) => {
  return (
    <label className={`flex items-start gap-3 md:gap-4 cursor-pointer group ${className}`}>
      <span className={`relative w-5 h-5 md:w-6 md:h-6 rounded-md border-[2px] md:border-[2.5px] mt-0.5 shrink-0 flex items-center justify-center transition-colors duration-300 ${checked ? 'border-[#06CFD6] bg-[#06CFD6]' : 'border-white/40 lg:group-hover:border-white/70'}`}>
        <AnimatePresence>
          {checked && (
            <motion.svg 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              viewBox="0 0 12 10" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-2.5 md:w-3.5 md:h-3"
            >
              <motion.polyline 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathLength: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                points="1,5 4,8 11,1" 
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <input 
        type="checkbox" 
        name={name} 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        required={required} 
        className="sr-only" 
      />
      <span className={`${textSizeClassName} leading-snug select-none transition-colors duration-300 ${checked ? 'text-white' : 'text-white/70 lg:group-hover:text-white/90'}`}>
        {label}
      </span>
    </label>
  );
};

export default AnimatedCheckbox;
