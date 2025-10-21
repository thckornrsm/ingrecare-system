// app/(backoffice)/session-provider.jsx
'use client';

import { createContext, useContext } from 'react';

// 1. สร้าง Context
const SessionContext = createContext(null);

// 2. สร้าง Provider (ตัวหุ้ม)
export function SessionProvider({ user, children }) {
  return (
    <SessionContext.Provider value={user}>
      {children}
    </SessionContext.Provider>
  );
}

// 3. สร้าง Hook (ตัวดึงข้อมูล)
export function useSession() {
  const context = useContext(SessionContext);
  return context;
}