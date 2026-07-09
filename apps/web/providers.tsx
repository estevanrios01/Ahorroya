"use client";

import { createContext, useContext, ReactNode } from "react";

interface AppContextType {
    apiUrl: string;
}

const AppContext = createContext<AppContextType>({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AppContext.Provider value={{ apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000" }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
