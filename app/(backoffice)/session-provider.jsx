// app/(backoffice)/session-provider.jsx
'use client';

import { createContext, useContext } from 'react';

// Context
const SessionContext = createContext(null);
// Provider
export function SessionProvider({ user, children }) {
    return (
        <SessionContext.Provider value={user}>
            {children}
        </SessionContext.Provider>
    );
}
// Hook
export function useSession() {
    const context = useContext(SessionContext);
    return context;
}