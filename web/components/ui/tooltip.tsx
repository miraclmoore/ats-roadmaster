'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ content, children, position = 'top', delay = 200, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let x = 0;
        let y = 0;

        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.top + scrollY - 8;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.bottom + scrollY + 8;
            break;
          case 'left':
            x = rect.left + scrollX - 8;
            y = rect.top + rect.height / 2 + scrollY;
            break;
          case 'right':
            x = rect.right + scrollX + 8;
            y = rect.top + rect.height / 2 + scrollY;
            break;
        }

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
      >
        {children}
      </div>

      {isVisible && typeof window !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            className={`
              absolute z-50 px-3 py-1.5 text-sm font-medium rounded-lg
              bg-card text-foreground border border-border shadow-lg
              pointer-events-none whitespace-nowrap
              ${getPositionClasses(position)}
            `}
            style={{
              left: position === 'top' || position === 'bottom' ? coords.x : position === 'left' ? coords.x : coords.x,
              top: position === 'left' || position === 'right' ? coords.y : position === 'top' ? coords.y : coords.y,
              transform: getTransform(position),
            }}
          >
            {content}
            <div
              className={`
                absolute w-2 h-2 bg-card border-border
                ${getArrowClasses(position)}
              `}
            />
          </div>,
          document.body
        )}
    </>
  );
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top':
      return 'mb-2';
    case 'bottom':
      return 'mt-2';
    case 'left':
      return 'mr-2';
    case 'right':
      return 'ml-2';
    default:
      return '';
  }
}

function getTransform(position: string): string {
  switch (position) {
    case 'top':
      return 'translate(-50%, -100%)';
    case 'bottom':
      return 'translate(-50%, 0)';
    case 'left':
      return 'translate(-100%, -50%)';
    case 'right':
      return 'translate(0, -50%)';
    default:
      return '';
  }
}

function getArrowClasses(position: string): string {
  const base = 'rotate-45';
  switch (position) {
    case 'top':
      return `${base} bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r`;
    case 'bottom':
      return `${base} top-[-5px] left-1/2 -translate-x-1/2 border-t border-l`;
    case 'left':
      return `${base} right-[-5px] top-1/2 -translate-y-1/2 border-t border-r`;
    case 'right':
      return `${base} left-[-5px] top-1/2 -translate-y-1/2 border-b border-l`;
    default:
      return '';
  }
}
