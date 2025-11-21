import React from "react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none animate-fade-in">
      <div className="relative">
        <svg className="animate-spin h-8 w-8 text-black" viewBox="0 0 24 24" style={{ animationDuration: '0.6s' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 