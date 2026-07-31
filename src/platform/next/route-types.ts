import type {ReactNode} from 'react';

export type RouteSearchParams = Record<string, string | string[] | undefined>;

export interface RoutePageProps<Params extends Record<string, string> = Record<never, string>> {
    params: Promise<Params & {locale: string}>;
    searchParams: Promise<RouteSearchParams>;
}

export interface RouteLayoutProps<Params extends Record<string, string> = Record<never, string>> {
    children: ReactNode;
    params: Promise<Params & {locale: string}>;
}
