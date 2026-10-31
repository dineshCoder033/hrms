import React, { useState } from 'react';
import { 
  Sparkles, 
  Pencil, 
  Download, 
  FileText, 
  Check, 
  Share2 
} from 'lucide-react';

export default function SummaryWidget({ summary, onGoalUpdate }) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(
    summary?.goal?.description || 
    'Reduce the number of security incidents by 50%. This goal is quantitative and measurable, and it would have a significant impact on workforce operations.'
  );
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const handleSaveGoal = () => {
    setIsEditingGoal(false);
    onGoalUpdate && onGoalUpdate(goalText);
  };

  const handleDownload = (docName) => {
    setDownloadSuccess(docName);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="summary-widget rounded-2xl sm:rounded-3xl bg-[#111215] text-white p-3.5 sm:p-4 flex flex-col justify-between shadow-soft-lg border border-white/5 select-none relative overflow-hidden">
      {/* Header: Sparkle icon, "Summary", Edit pen */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-gray-300">
            <Sparkles className="w-3 h-3 text-[#C7F436]" />
          </div>
          <h3 className="font-extrabold text-[15px] tracking-tight text-white">Summary</h3>
        </div>

        <button 
          onClick={() => setIsEditingGoal(!isEditingGoal)}
          title="Edit Summary & Goals"
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </div>

      {/* Main Body with Vertical Timeline */}
      <div className="mt-2.5 flex gap-3">
        {/* Left Vertical Timeline Column */}
        <div className="flex flex-col items-center shrink-0 pt-0.5">
          {/* Node 1 (3:15) */}
          <span className="text-[9px] font-mono text-gray-400 mb-0.5">3:15</span>
          <div className="w-2.5 h-2.5 rounded-full bg-[#C7F436] ring-2 ring-[#C7F436]/20 shadow-xs" />
          
          {/* Timeline Line */}
          <div className="w-[1.5px] h-12 bg-gradient-to-b from-[#C7F436] to-sky-400 my-0.5" />

          {/* Node 2 (2:46) */}
          <span className="text-[9px] font-mono text-gray-400 mb-0.5">2:46</span>
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/20 shadow-xs flex items-center justify-center">
            <span className="w-0.5 h-0.5 bg-white rounded-full"></span>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Section 1: Documents */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-semibold text-gray-300">Documents:</span>
              <button 
                onClick={() => handleDownload('All Documents.zip')}
                title="Download all documents"
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition"
              >
                <Download className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Document Preview Cards */}
            <div className="grid grid-cols-2 gap-2">
              {/* Document 1: Brief.pdf */}
              <div 
                onClick={() => handleDownload('Brief.pdf')}
                className="group/doc bg-white rounded-lg p-1.5 flex flex-col justify-between h-15 cursor-pointer hover:ring-2 hover:ring-[#C7F436] transition relative shadow-sm"
              >
                {/* Visual Lines imitating Document */}
                <div className="space-y-1 opacity-60">
                  <div className="w-3/4 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-full h-0.5 bg-gray-300 rounded-full"></div>
                  <div className="w-5/6 h-0.5 bg-gray-300 rounded-full"></div>
                  <div className="w-4/6 h-0.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="bg-black/90 text-white rounded py-0.5 px-1 text-center">
                  <span className="text-[8.5px] font-bold tracking-tight">Brief.pdf</span>
                </div>
              </div>

              {/* Document 2: Requirement.pdf */}
              <div 
                onClick={() => handleDownload('Requirement.pdf')}
                className="group/doc bg-white rounded-lg p-1.5 flex flex-col justify-between h-15 cursor-pointer hover:ring-2 hover:ring-[#C7F436] transition relative shadow-sm"
              >
                {/* Visual Lines imitating Document */}
                <div className="space-y-1 opacity-60">
                  <div className="w-1/2 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-full h-0.5 bg-gray-300 rounded-full"></div>
                  <div className="w-full h-0.5 bg-gray-300 rounded-full"></div>
                  <div className="w-3/4 h-0.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="bg-black/90 text-white rounded py-0.5 px-1 text-center">
                  <span className="text-[8.5px] font-bold tracking-tight">Requirement.pdf</span>
                </div>
              </div>
            </div>

            {downloadSuccess && (
              <p className="text-[9.5px] text-[#C7F436] font-medium mt-1 flex items-center gap-1 animate-pulse">
                <Check className="w-2.5 h-2.5" /> Downloaded {downloadSuccess}
              </p>
            )}
          </div>

          {/* Section 2: Goal */}
          <div className="pt-1.5 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-semibold text-gray-300">Goal:</span>
              <button 
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-gray-400 hover:text-white"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>

            {isEditingGoal ? (
              <div className="space-y-1.5">
                <textarea 
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg p-1.5 text-[10.5px] text-white resize-none focus:outline-none focus:border-[#C7F436]"
                  rows={2}
                />
                <div className="flex justify-end gap-1.5">
                  <button 
                    onClick={() => setIsEditingGoal(false)}
                    className="px-2 py-0.5 text-[10px] rounded bg-white/10 hover:bg-white/20 text-gray-300"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveGoal}
                    className="px-2 py-0.5 text-[10px] rounded bg-[#C7F436] hover:bg-[#B8E52B] text-black font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[10px] leading-relaxed text-gray-400">
                Reduce the number of security incidents by 50%. This goal is{' '}
                <strong className="text-gray-200 font-semibold underline decoration-[#C7F436]/50">quantitative and measurable</strong>, and it would have a{' '}
                <strong className="text-gray-200 font-semibold">significant impact on the...</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
