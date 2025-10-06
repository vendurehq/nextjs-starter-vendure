'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import type { ResultOf } from '@/graphql';
import type { GetActiveChannelQuery } from '@/lib/vendure/queries';

type Channel = NonNullable<ResultOf<typeof GetActiveChannelQuery>['activeChannel']>;

interface ChannelContextValue {
    channel: Channel;
    currencyCode: string;
    languageCode: string;
    setCurrencyCode: (code: string) => void;
    setLanguageCode: (code: string) => void;
}

const ChannelContext = createContext<ChannelContextValue | null>(null);

const CURRENCY_CODE_COOKIE = 'vendure-currency-code';
const LANGUAGE_CODE_COOKIE = 'vendure-language-code';

export function ChannelProvider({
    channel,
    children,
}: {
    channel: Channel;
    children: ReactNode;
}) {
    const [currencyCode, setCurrencyCodeState] = useState(() => {
        const cookieValue = Cookies.get(CURRENCY_CODE_COOKIE);
        return cookieValue || channel.defaultCurrencyCode;
    });

    const [languageCode, setLanguageCodeState] = useState(() => {
        const cookieValue = Cookies.get(LANGUAGE_CODE_COOKIE);
        return cookieValue || channel.defaultLanguageCode;
    });

    const setCurrencyCode = (code: string) => {
        setCurrencyCodeState(code);
        Cookies.set(CURRENCY_CODE_COOKIE, code, {
            expires: 365,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
    };

    const setLanguageCode = (code: string) => {
        setLanguageCodeState(code);
        Cookies.set(LANGUAGE_CODE_COOKIE, code, {
            expires: 365,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
    };

    return (
        <ChannelContext.Provider
            value={{
                channel,
                currencyCode,
                languageCode,
                setCurrencyCode,
                setLanguageCode,
            }}
        >
            {children}
        </ChannelContext.Provider>
    );
}

export function useChannel() {
    const context = useContext(ChannelContext);
    if (!context) {
        throw new Error('useChannel must be used within a ChannelProvider');
    }
    return context;
}
