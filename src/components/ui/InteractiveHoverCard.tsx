import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  trigger: ReactNode;
  children: ReactNode;
  placement?: 'above' | 'below';
  openDelay?: number;
  closeDelay?: number;
};

type Position = { left: number; top: number };

const InteractiveHoverCard: React.FC<Props> = ({
  trigger,
  children,
  placement = 'above',
  openDelay = 80,
  closeDelay = 220,
}) => {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const clearTimers = () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const open = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    if (position || openTimer.current !== null) return;
    openTimer.current = window.setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const halfWidth = 128;
        setPosition({
          left: Math.min(window.innerWidth - halfWidth - 8, Math.max(halfWidth + 8, rect.left + rect.width / 2)),
          top: placement === 'above' ? rect.top : rect.bottom,
        });
      }
      openTimer.current = null;
    }, openDelay);
  };

  const scheduleClose = () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    openTimer.current = null;
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setPosition(null);
      closeTimer.current = null;
    }, closeDelay);
  };

  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    window.addEventListener('resize', close);
    document.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('resize', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [position]);

  useEffect(() => () => clearTimers(), []);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocusCapture={open}
        onBlurCapture={scheduleClose}
      >
        {trigger}
      </span>
      {position && typeof document !== 'undefined' && createPortal(
        <div
          className={`pointer-events-auto fixed z-[9999] w-64 -translate-x-1/2 ${placement === 'above' ? '-translate-y-full pb-3' : 'pt-3'}`}
          style={{ left: position.left, top: position.top }}
          onMouseEnter={open}
          onMouseLeave={scheduleClose}
        >
          <div role="tooltip" className="rounded-lg border border-white/10 bg-[#121212] p-3 text-left text-xs leading-5 text-white/75 shadow-2xl">
            {children}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default InteractiveHoverCard;
