import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RadioProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const Radio: React.FC<RadioProps> = ({ name, value, label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group relative">
    <span className={`relative w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center shrink-0 transition-colors duration-300 ${checked ? 'border-[#06CFD6]' : 'border-white/40 lg:group-hover:border-white/70'}`}>
      <AnimatePresence>
        {checked && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute w-2.5 h-2.5 rounded-full bg-[#06CFD6]"
          />
        )}
      </AnimatePresence>
    </span>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
    <span className={`text-[16px] md:text-[18px] select-none transition-colors duration-300 ${checked ? 'text-white font-medium' : 'text-white/80 lg:group-hover:text-white'}`}>
      {label}
    </span>
  </label>
);

export default Radio;
