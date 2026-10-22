const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Khóa lưu mới (v2) — bỏ toàn bộ dữ liệu demo học sinh A/B/C cũ
const KEY = 'uniroute_user_v2';

// Hồ sơ cho người dùng thật (đã đăng ký) — trạng thái riêng theo tài khoản
export function freshUserState(user = {}) {
  let pend = {};
  try { pend = JSON.parse(sessionStorage.getItem('uniroute_pending_profile') || '{}'); } catch (e) { /* ignore */ }
  return {
    onboarded: false,
    profile: {
      name: pend.name || user.full_name || '',
      school: '',
      grade: Number(pend.grade || user.grade || 10),
      home: '',
      phone: pend.phone || user.phone || '',
      gender: pend.gender || user.gender || '',
      dob: pend.dob || user.dob || '',
      ielts: null,
      interests: [], declared: [], direction: 'Chưa xác định',
    },
    academic: { cards: [{ id: 'c_g9', label: 'Lớp 9', scores: {}, savedAt: null }], current: {}, previous: {}, history: [] },
    certificates: [],
    assessment: { responses: {}, completed: false, completedAt: null },
    personaVersions: [],
    selectedFields: [], skippedFields: [],
    subjectPlan: null,
    selectedMajors: [],
    shortlist: [], compare: [],
    targets: [],
    roadmap: null,
    logs: [],
  };
}

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.states) return d;
    }
  } catch (e) { /* ignore */ }
  return { studentId: null, states: {} };
};

const Ctx = createContext(null);

export function AppStoreProvider({ children }) {
  const [db, setDb] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignore */ }
  }, [db]);

  const value = useMemo(() => {
    const patch = (fn) => setDb((d) => {
      const cur = d.studentId;
      const s = d.states[cur] || freshUserState({});
      const ns = typeof fn === 'function' ? fn(s) : { ...s, ...fn };
      return { ...d, states: { ...d.states, [cur]: ns } };
    });
    const addLog = (type, note) => patch((s) => ({
      ...s, logs: [{ at: new Date().toISOString(), type, note }, ...s.logs].slice(0, 30),
    }));
    const resetStudent = () => setDb((d) => ({ ...d, states: { ...d.states, [d.studentId]: freshUserState({}) } }));
    const isOnboarded = (id) => !!db.states[id]?.onboarded;
    const ensureUser = (user) => setDb((d) => {
      const uid = `u_${user.id}`;
      const states = d.states[uid] ? d.states : { ...d.states, [uid]: freshUserState(user) };
      return { studentId: d.studentId || uid, states };
    });
    const s = db.studentId ? (db.states[db.studentId] || freshUserState({})) : null;
    return { studentId: db.studentId, states: db.states, s, patch, addLog, resetStudent, isOnboarded, ensureUser };
  }, [db]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);