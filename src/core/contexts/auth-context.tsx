'use client';

import {createContext, ReactNode, useContext} from 'react';
import {ResultOf} from '@/graphql';
import {ActiveCustomerFragment} from '@core/lib/vendure/fragments';

type ActiveCustomer = ResultOf<typeof ActiveCustomerFragment>;

interface AuthContextType {
    activeCustomer: Promise<ActiveCustomer | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
    initialActiveCustomerPromise: Promise<ActiveCustomer | null>;
}

export function AuthProvider({children, initialActiveCustomerPromise}: AuthProviderProps) {

    return (
        <AuthContext.Provider value={{activeCustomer: initialActiveCustomerPromise}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
