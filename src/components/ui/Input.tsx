import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full bg-white rounded-full px-5 lg:px-6 py-[0.6rem] text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[18px] md:text-[20px] shadow-sm ${props.className || ''}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
