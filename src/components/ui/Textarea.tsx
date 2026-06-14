import React from 'react';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full bg-white rounded-2xl lg:rounded-3xl px-5 lg:px-6 py-4 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[18px] md:text-[20px] shadow-sm resize-y min-h-[150px] ${props.className || ''}`}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
