import type {Metadata} from 'next';
import {getRouteLocale} from '@/platform/i18n/server';
import { query } from '@/platform/vendure/api';
import {GetCustomerAddressesQuery} from '@/features/account/graphql';
import {GetAvailableCountriesQuery} from '@/features/checkout/graphql';
import { AddressesClient } from './addresses-client';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Account'});
    return {
        title: t('addressesPageTitle'),
    };
}

export default async function AddressesPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Account'});
    const [addressesResult, countriesResult] = await Promise.all([
        query(GetCustomerAddressesQuery, {}, { useAuthToken: true }),
        query(GetAvailableCountriesQuery, {}, { languageCode: locale }),
    ]);

    const addresses = addressesResult.data.activeCustomer?.addresses || [];
    const countries = countriesResult.data.availableCountries || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('addresses')}</h1>
                <p className="text-muted-foreground mt-2">
                    {t('manageAddresses')}
                </p>
            </div>

            <AddressesClient addresses={addresses} countries={countries} />
        </div>
    );
}
