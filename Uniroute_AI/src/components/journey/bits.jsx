import React from 'react';
import { Check, Info } from 'lucide-react';

export function Card({ className = '', children }) {
  return <div className={`bg-white border border-[#E4E7EC] rounded-xl ${className}`}>{children}</div>;
}

const TONES = {
  gray: 'bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]',
  blue: 'bg-[#EFF4FF] text-[#253B80] border-[#D6E0FF]',
  teal: 'bg-[#F0FDF9] text-[#0D9488] border-[#CCFBF1]',
  amber: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  rose: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  navy: 'bg-[#253B80] text-white border-[#253B80]',
};

export function Chip({ tone = 'gray', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${TONES[tone] || TONES.gray} ${className}`}>
      {children}
    </span>
  );
}

export function DemoBadge({ label = 'Dữ liệu minh họa' }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F2F4F7] border border-[#E4E7EC] text-[10.5px] font-semibold text-[#667085]">
      <Info className="w-3 h-3" /> {label}
    </span>
  );
}

export function Meter({ value, tone = '#253B80', className = '' }) {
  return (
    <div className={`h-1.5 rounded-full bg-[#F2F4F7] overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }} />
    </div>
  );
}

export function ScoreRing({ value, size = 56 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = value >= 80 ? '#14B8A6' : value >= 65 ? '#253B80' : '#F59E0B';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F2F4F7" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="53%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.28} fontWeight="700" fill="#111827">{value}</text>
    </svg>
  );
}

export function StatusPill({ status }) {
  if (status === 'ok') return <Chip tone="teal"><Check className="w-3 h-3" /> Phù hợp</Chip>;
  if (status === 'partial') return <Chip tone="amber">△ Cần bổ sung</Chip>;
  return <Chip tone="rose">✕ Không phù hợp</Chip>;
}

export function PrimaryButton({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-[#253B80] text-white text-[13.5px] font-semibold hover:bg-[#172554] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white border border-[#E4E7EC] text-[#344054] text-[12.5px] font-semibold hover:bg-[#F7F8FC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}