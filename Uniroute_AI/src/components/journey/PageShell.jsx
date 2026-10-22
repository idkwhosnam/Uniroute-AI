import React from 'react';
import { useLocation } from 'react-router-dom';
import JourneyBar from './JourneyBar';

export default function PageShell({ title, subtitle, children, note, badge }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="ur-page-in w-full max-w-[1180px] mx-auto px-6 lg:px-8 py-6 lg:py-8">
      <JourneyBar />
      <div className="mt-6 mb-5">
        {badge && <div className="text-[11px] font-bold uppercase tracking-wider text-[#253B80] mb-1.5">{badge}</div>}
        <h1 className="text-[24px] font-bold text-[#111827] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13.5px] text-[#667085] mt-1 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
      {children}
      {note && (
        <p className="mt-8 text-[11.5px] text-[#98A2B3] border-t border-[#E4E7EC] pt-4 leading-relaxed">{note}</p>
      )}
    </div>
  );
}