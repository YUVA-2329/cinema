'use client';

import React from 'react';
import Link from 'next/link';

interface KathaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export default function KathaLogo({ size = 'md', showTagline = false, className = '' }: KathaLogoProps) {
  const iconDimensions = {
    sm: { width: 28, height: 28, fontSize: 'text-lg', iconSize: 'w-7 h-7' },
    md: { width: 38, height: 38, fontSize: 'text-2xl', iconSize: 'w-10 h-10' },
    lg: { width: 56, height: 56, fontSize: 'text-4xl', iconSize: 'w-14 h-14' },
  }[size];

  return (
    <Link href="/" className={`group inline-flex items-center gap-3 select-none ${className}`}>
      {/* Premium Clapperboard + Letter K Emblem */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 p-0.5 shadow-lg shadow-red-950/40 group-hover:shadow-red-600/30 transition-all duration-300 ${iconDimensions.iconSize}`}>
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle clapper lines overlay */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,#fff_25%,#fff_50%,transparent_50%,transparent_75%,#fff_75%)] bg-[length:8px_8px]" />
          
          {/* Stylized Telugu 'K' / Clapper SVG */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/4 h-3/4 text-white relative z-10 transition-transform duration-300 group-hover:scale-110"
          >
            {/* Clapper top bar */}
            <path
              d="M6 10L34 6L35 12L7 16L6 10Z"
              fill="url(#logo_grad)"
              stroke="#FFF"
              strokeWidth="0.5"
            />
            {/* White stripe slashes on clapper bar */}
            <path d="M12 9L15 14M20 8L23 13M28 7L31 12" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Letter K & Film Reel Curve */}
            <path
              d="M11 16V33M11 25L27 16M11 25L28 33"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glowing Accent Dot */}
            <circle cx="28" cy="16" r="2.5" fill="#FF4500" />
            
            <defs>
              <linearGradient id="logo_grad" x1="6" y1="6" x2="35" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E50914" />
                <stop offset="1" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Title & Taglines */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-wider text-white uppercase font-sans ${iconDimensions.fontSize} drop-shadow-md`}>
            KATHA
          </span>
          <span className="text-red-500 font-bold text-xs px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40 uppercase tracking-widest">
            TFI
          </span>
        </div>

        {showTagline && (
          <span className="text-xs font-semibold text-amber-400/90 tracking-wide font-sans">
            నీ కథ. మన తీర్పు.
          </span>
        )}
      </div>
    </Link>
  );
}
