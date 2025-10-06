import { graphql, type ResultOf, type VariablesOf } from '@/graphql';
import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';
import { getAuthToken } from '@/lib/auth';
import { getCurrencyCode } from '@/lib/settings';
import { getLocale } from 'next-intl/server';

const VENDURE_API_URL = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
const VENDURE_CHANNEL_TOKEN = process.env.VENDURE_CHANNEL_TOKEN || process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN || '__default_channel__';
const VENDURE_AUTH_TOKEN_HEADER = 'vendure-auth-token';
const VENDURE_CHANNEL_TOKEN_HEADER = 'vendure-token';

if (!VENDURE_API_URL) {
  throw new Error('VENDURE_SHOP_API_URL or NEXT_PUBLIC_VENDURE_SHOP_API_URL environment variable is not set');
}

interface VendureRequestOptions {
  languageCode?: string;
  currencyCode?: string;
  token?: string;
  useAuthToken?: boolean;
  channelToken?: string;
  fetch?: RequestInit;
  tags?: string[];
  skipLanguageCookie?: boolean;
  skipCurrencyCookie?: boolean;
}

interface VendureResponse<T> {
  data?: T;
  errors?: Array<{ message: string; [key: string]: any }>;
}

/**
 * Extract the Vendure auth token from response headers
 */
function extractAuthToken(headers: Headers): string | null {
  return headers.get(VENDURE_AUTH_TOKEN_HEADER);
}

/**
 * Build the API URL with optional language code and currency code
 */
function buildUrl(languageCode?: string, currencyCode?: string): string {
  const url = new URL(VENDURE_API_URL!);

  if (languageCode) {
    url.searchParams.set('languageCode', languageCode);
  }

  if (currencyCode) {
    url.searchParams.set('currencyCode', currencyCode);
  }

  return url.toString();
}

/**
 * Execute a GraphQL query against the Vendure API
 */
export async function query<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  const { languageCode, currencyCode, token, useAuthToken, channelToken, fetch: fetchOptions, tags, skipLanguageCookie, skipCurrencyCookie } = options || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions?.headers as Record<string, string>),
  };

  // Use the explicitly provided token, or fetch from cookies if useAuthToken is true
  let authToken = token;
  if (useAuthToken && !authToken) {
    authToken = await getAuthToken();
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Set the channel token header (use provided channelToken or default)
  headers[VENDURE_CHANNEL_TOKEN_HEADER] = channelToken || VENDURE_CHANNEL_TOKEN;

  // Get language from next-intl and currency from cookies if not provided and skip flags are not set
  let finalLanguageCode = languageCode;
  let finalCurrencyCode = currencyCode;

  if (!skipLanguageCookie && !languageCode) {
    finalLanguageCode = await getLocale();
  }

  if (!skipCurrencyCookie && !currencyCode) {
    finalCurrencyCode = await getCurrencyCode();
  }

  const url = buildUrl(finalLanguageCode, finalCurrencyCode);

  const response = await fetch(url, {
    ...fetchOptions,
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: print(document),
      variables: variables || {},
    }),
    ...(tags && { next: { tags } }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: VendureResponse<TResult> = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  if (!result.data) {
    throw new Error('No data returned from Vendure API');
  }

  const newToken = extractAuthToken(response.headers);

  return {
    data: result.data,
    ...(newToken && { token: newToken }),
  };
}

/**
 * Execute a GraphQL mutation against the Vendure API
 */
export async function mutate<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  // Mutations use the same underlying implementation as queries in GraphQL
  return query(document, ...[variables, options] as any);
}
