import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  Maximize2, 
  X,
  PhoneCall
} from 'lucide-react';

export default function LiveVideoWidget() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-soft-lg w-full aspect-[16/10] max-h-[220px] flex flex-col justify-between group">
      {/* Video Feed / Avatar Background */}
      {isCallActive ? (
        isVideoOff ? (
          <div className="absolute inset-0 bg-[#16181D] flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 rounded-full bg-[#23272F] flex items-center justify-center font-bold text-2xl text-[#C7F436] ring-4 ring-black/40">
              AM
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-300">Alex Miller (Camera Off)</p>
          </div>
        ) : (
          <div className="absolute inset-0">
            <img 
              src="/video_participant.jpg" 
              alt="Alex Miller - Video Call Participant"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95" 
            />
            {/* Subtle Gradient Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
          </div>
        )
      ) : (
        <div className="absolute inset-0 bg-[#16181D] flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
            <PhoneOff className="w-6 h-6" />
          </div>
          <h4 className="text-white font-bold text-sm">Call Ended</h4>
          <p className="text-gray-400 text-xs mt-1">Duration: 18m 42s</p>
          <button 
            onClick={() => setIsCallActive(true)}
            className="mt-3 flex items-center gap-2 bg-[#C7F436] hover:bg-[#B8E52B] text-black font-bold text-xs px-4 py-2 rounded-full transition shadow-md"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Reconnect Call
          </button>
        </div>
      )}

      {/* Top Header Controls Overlay */}
      {isCallActive && (
        <div className="relative z-10 flex items-center justify-between p-4">
          {/* Google Meet Badge */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-4 h-4 rounded-sm bg-white p-0.5 flex items-center justify-center">
              <span className="text-[9px] font-black text-[#00832d]">M</span>
            </div>
            <span className="text-white text-xs font-semibold tracking-wide">Alex Miller</span>
            <span className="w-2 h-2 rounded-full bg-[#C7F436] animate-pulse" />
          </div>

          {/* Window action buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              title="Expand View"
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition border border-white/10"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsCallActive(false)}
              title="Minimize/Close"
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Call Controls Pill */}
      {isCallActive && (
        <div className="relative z-10 p-4 flex justify-center">
          <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-lg border border-white/15 px-3 py-2 rounded-full shadow-2xl">
            {/* Video Toggle */}
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isVideoOff ? 'bg-red-500/80 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
            </button>

            {/* Mic Toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isMuted ? 'bg-red-500/80 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Speaker Toggle */}
            <button 
              onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
              title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isSpeakerMuted ? 'bg-amber-500/80 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* End Call Button */}
            <button 
              onClick={() => setIsCallActive(false)}
              title="Leave Call"
              className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow-md"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#121418] text-white border border-gray-800 rounded-3xl w-full max-w-4xl p-6 relative flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#C7F436] animate-pulse" />
                <h3 className="font-bold text-lg">1-on-1 Strategy Sync: Alex Miller</h3>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
              <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80" 
                  alt="Alex Miller"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-xs">Alex Miller (Senior Lead)</span>
              </div>
              <div className="bg-[#191D24] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#C7F436] mb-2">Meeting Notes & Action Items</h4>
                  <ul className="text-xs text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">✓ Verified SOC2 compliance timeline with audit team</li>
                    <li className="flex items-start gap-2">✓ Approved security brief for Q4 infrastructure rollouts</li>
                    <li className="flex items-start gap-2">⏱ Pending approval: External pentest contractor agreement</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-gray-800 text-xs text-gray-400">
                  Meeting Audio: High-Definition Opus codec • Encrypted E2EE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
