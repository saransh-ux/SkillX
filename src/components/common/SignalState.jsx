import React from 'react';

/**
 * Editorial Loading State for Signal Telemetry
 */
export function SignalLoading({ message = "ANALYZING WORKFORCE SIGNAL..." }) {
  return (
    <div className="border border-[#D8D2C4] bg-[#ECE7DE]/40 p-8 my-6 text-center">
      <div className="inline-flex items-center gap-2.5 font-mono text-xs text-[#171717]">
        <span className="w-2 h-2 bg-[#FF4D2E] animate-pulse"></span>
        <span className="font-bold tracking-widest uppercase">{message}</span>
      </div>
      <div className="text-[10px] font-mono text-[#66645F] mt-1.5 uppercase tracking-wider">
        DISPATCHING TELEMETRY QUERY // RUNTIME ACTIVE
      </div>
    </div>
  );
}

/**
 * Editorial Error State for Signal Telemetry
 */
export function SignalError({ message = "WORKFORCE SIGNAL UNAVAILABLE", onRetry }) {
  return (
    <div className="border border-[#D8D2C4] bg-[#ECE7DE]/30 p-8 my-6 text-center">
      <div className="inline-flex items-center gap-2 font-mono text-xs text-[#FF4D2E]">
        <span className="w-2 h-2 bg-[#FF4D2E]"></span>
        <span className="font-bold tracking-widest uppercase">{message}</span>
      </div>
      <div className="text-[10px] font-mono text-[#66645F] mt-1.5 uppercase tracking-wider">
        BACKEND DISCONNECTED // USING LOCAL INTELLIGENCE CORPUS
      </div>
      {onRetry && (
        <div className="mt-3">
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-[#171717] hover:bg-[#FF4D2E] text-[#F4F1EA] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            RETRY SIGNAL ACQUISITION
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Editorial Empty State for Zero Query Matches
 */
export function SignalEmpty({ message = "NO SIGNAL DETECTED FOR THIS QUERY" }) {
  return (
    <div className="border border-[#D8D2C4] bg-[#ECE7DE]/20 p-8 my-6 text-center">
      <div className="inline-flex items-center gap-2 font-mono text-xs text-[#66645F]">
        <span className="w-1.5 h-1.5 bg-[#66645F]"></span>
        <span className="font-bold tracking-widest uppercase">{message}</span>
      </div>
      <div className="text-[10px] font-mono text-[#8E8B83] mt-1.5 uppercase tracking-wider">
        ZERO OCCURRENCES IN CORPUS // ADJUST PARAMETERS
      </div>
    </div>
  );
}
