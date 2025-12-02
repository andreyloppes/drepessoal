"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { startOfMonth } from 'date-fns';

interface MonthContextType {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    nextMonth: () => void;
    prevMonth: () => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

    const nextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    return (
        <MonthContext.Provider value={{ currentMonth, setCurrentMonth, nextMonth, prevMonth }}>
            {children}
        </MonthContext.Provider>
    );
}

export function useMonth() {
    const context = useContext(MonthContext);
    if (context === undefined) {
        throw new Error('useMonth must be used within a MonthProvider');
    }
    return context;
}
