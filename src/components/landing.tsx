import React from 'react';
export default function Landing() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Main hero content */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
          The Smart Way to Track{' '}
          <br className="hidden sm:block" />
          IPO GMPs
        </h1>
        <div className='flex flex-wrap justify-center gap-4 mb-8'>
        <div className='border rounded-xl border-[#2d2d2d] w-fit px-4 py-1 bg-[#ffffff14] backdrop-blur-[1px]'>Clear Layout</div>
        <div className='border rounded-xl border-[#2d2d2d] w-fit px-4 py-1 bg-[#ffffff14] backdrop-blur-[1px]'>Beautiful UI</div>
        <div className='border rounded-xl border-[#2d2d2d] w-fit px-4 py-1 bg-[#ffffff14] backdrop-blur-[1px]'>Quick Decisions</div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-gray-400"
        >
          <path 
            d="M7 10L12 15L17 10" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}