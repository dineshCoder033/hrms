import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function LeadCard({ lead, onSelect }) {
  // Render rating dots (exact representation of 5 dots in design)
  const renderDots = (rating, level) => {
    let colors = ['bg-[#FF4D4D]', 'bg-[#FF4D4D]', 'bg-[#FF4D4D]', 'bg-[#22C55E]', 'bg-[#22C55E]'];
    if (level === 'Great interest' || level === 'High Interest') {
      colors = ['bg-[#FF4D4D]', 'bg-[#FF4D4D]', 'bg-[#F97316]', 'bg-[#22C55E]', 'bg-[#22C55E]'];
    } else if (level === 'Medium interest') {
      colors = ['bg-[#FF4D4D]', 'bg-[#FF4D4D]', 'bg-[#FF4D4D]', 'bg-[#E2E8F0]', 'bg-[#E2E8F0]'];
    } else if (level === 'Low interest') {
      colors = ['bg-[#FF4D4D]', 'bg-[#FF4D4D]', 'bg-[#E2E8F0]', 'bg-[#E2E8F0]', 'bg-[#E2E8F0]'];
    }

    return (
      <div className="flex items-center gap-1.5">
        {colors.map((c, i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
        ))}
      </div>
    );
  };

  return (
    <div 
      onClick={() => onSelect && onSelect(lead)}
      className="lead-card group bg-white hover:bg-[#FCFDFE] border border-gray-200/70 hover:border-black/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between shadow-soft-sm hover:shadow-soft-md transition-all duration-300 flex-1 cursor-pointer select-none relative overflow-hidden"
    >
      {/* Top Header: Avatar & Arrow */}
      <div className="flex items-start justify-between">
        <div className="relative">
          <img 
            src={lead.avatar} 
            alt={lead.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-gray-100 group-hover:scale-105 transition-transform" 
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
        </div>
        
        <button 
          title="View Candidate / Lead Profile"
          className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white flex items-center justify-center text-gray-500 transition-colors"
        >
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* Middle: Name & Title */}
      <div className="mt-2.5">
        <h4 className="font-bold text-[14px] text-[#111317] tracking-tight group-hover:text-black transition">
          {lead.name}
        </h4>
        <p className="text-[11px] text-gray-500 font-medium line-clamp-1 mt-0.5">
          {lead.role}
        </p>
      </div>

      {/* Bottom: Sources & Interest / Rating */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span>Source</span>
          <span className="text-[10px] font-semibold text-gray-600 flex items-center gap-1">
            {lead.interestLevel === 'Hot Client' && '🔥 '}
            {lead.interestLevel}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {/* Source Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {lead.sources.map((src, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-medium bg-[#F1F3F5] text-gray-600 px-2 py-0.5 rounded-full"
              >
                {src}
              </span>
            ))}
          </div>

          {/* 5 Dots Rating Indicator */}
          {renderDots(lead.rating, lead.interestLevel)}
        </div>
      </div>
    </div>
  );
}
