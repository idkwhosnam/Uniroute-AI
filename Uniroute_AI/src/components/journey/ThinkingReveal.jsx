import React, { useEffect, useState } from 'react';
import AiThinking from './AiThinking';

// Hiển thị hiệu ứng "AI đang suy luận" ~1.4s rồi fade-in nội dung đề xuất.
export default function ThinkingReveal({ label, active = true, deps = [], children }) {
  const [thinking, setThinking] = useState(active);

  useEffect(() => {
    if (!active) { setThinking(false); return; }
    setThinking(true);
    const t = setTimeout(() => setThinking(false), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps]);

  if (thinking) return <AiThinking label={label} />;
  return children;
}