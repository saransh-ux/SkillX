import React from 'react';
import { AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { IS_DEMO_MODE } from '../../api/client';

/**
 * BACKEND CONNECTION ERROR
 * Reusable editorial error state for failed backend calls.
 * Displays endpoint, HTTP status, and retry button without exposing stack traces or secrets.
 *
 * @param {Object} props
 * @param {string} [props.endpoint] - The API endpoint that failed (e.g. /api/skills)
 * @param {number|string} [props.status] - HTTP status code (e.g. 500, 404, 422, or 0 / NETWORK)
 * @param {string} [props.message] - User-friendly error message
 * @param {function} [props.onRetry] - Callback to retry the operation
 * @param {string} [props.customTitle] - Optional custom title override
 */
export default function BackendConnectionError({
  endpoint = '',
  status = null,
  message = 'Failed to connect to workforce API.',
  onRetry = null,
  customTitle = 'BACKEND CONNECTION ERROR'
}) {
  // Format status display
  let statusDisplay = 'NETWORK / TIMEOUT';
  if (status !== null && status !== undefined && status !== 0) {
    statusDisplay = `HTTP ${status}`;
  } else if (typeof status === 'string' && status.trim()) {
    statusDisplay = status;
  }

  return (
    <div className="border border-[#FF4D2E] bg-white p-6 my-6 font-mono text-xs text-[#171717] shadow-[0_2px_12px_rgba(255,77,46,0.06)]">
      {/* Top Banner / Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FF4D2E]/20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#FF4D2E] flex-shrink-0 animate-pulse" />
          <span className="font-bold tracking-wider text-[#FF4D2E] uppercase">
            {customTitle}
          </span>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 bg-[#FF4D2E]/10 border border-[#FF4D2E]/30 text-[#FF4D2E] font-bold uppercase">
            STATUS: {statusDisplay}
          </span>
          {IS_DEMO_MODE && (
            <span className="px-2 py-0.5 bg-[#171717] text-[#F4F1EA] font-bold uppercase">
              DEMO MODE / MOCK DATA
            </span>
          )}
        </div>
      </div>

      {/* Details Row: Endpoint and Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 text-[11px] border-b border-[#D8D2C4]/40">
        <div>
          <span className="text-[#66645F] uppercase block text-[10px]">TARGET ENDPOINT:</span>
          <span className="font-bold text-[#171717] break-all">
            {endpoint || 'WORKFORCE API TELEMETRY'}
          </span>
        </div>
        <div>
          <span className="text-[#66645F] uppercase block text-[10px]">DIAGNOSTIC STATUS:</span>
          <span className="font-bold text-[#FF4D2E]">
            {statusDisplay}
          </span>
        </div>
      </div>

      {/* Clean Message - Sanitized without internal stack traces */}
      <div className="pt-3 pb-4">
        <span className="text-[#66645F] uppercase block text-[10px] mb-1">SIGNAL FAILURE:</span>
        <p className="text-xs text-[#171717] leading-relaxed">
          {message}
        </p>
      </div>

      {/* Retry Action */}
      {onRetry && (
        <div className="pt-2 flex items-center justify-between border-t border-[#D8D2C4]/40">
          <span className="text-[10px] text-[#66645F] uppercase">
            VERIFY LOCAL FASTAPI INSTANCE (PORT 8000)
          </span>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#171717] hover:bg-[#FF4D2E] text-[#F4F1EA] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RETRY CONNECTION</span>
          </button>
        </div>
      )}
    </div>
  );
}
