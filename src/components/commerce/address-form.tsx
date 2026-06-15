'use client';

import type {AddressFieldKey} from '@/lib/storefront/schema';
import type {AddressInput, Country, CustomerAddress} from '@/lib/commerce/address';
import {addressToInput} from '@/lib/commerce/address';
import {storefront} from '@/lib/storefront/config';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Field, FieldLabel, FieldError, FieldGroup} from '@/components/ui/field';
import {useForm, Controller} from 'react-hook-form';
import {Loader2} from 'lucide-react';
import {CountrySelect} from '@/components/shared/country-select';
import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';

const labelKeys: Record<AddressFieldKey, string> = {
    fullName: 'fullName',
    company: 'company',
    streetLine1: 'streetAddress',
    streetLine2: 'apartment',
    city: 'city',
    province: 'stateProvince',
    postalCode: 'postalCode',
    countryCode: 'country',
    phoneNumber: 'phoneNumberField',
};

const requiredMessageKeys: Record<AddressFieldKey, string> = {
    fullName: 'fullNameRequired',
    company: 'companyRequired',
    streetLine1: 'streetRequired',
    streetLine2: 'apartmentRequired',
    city: 'cityRequired',
    province: 'stateProvinceRequired',
    postalCode: 'postalCodeRequired',
    countryCode: 'countryRequired',
    phoneNumber: 'phoneRequired',
};

interface AddressFormProps {
  countries: Country[];
  address?: CustomerAddress;
  onSubmit: (data: AddressInput & { id?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  translationNamespace?: 'Account' | 'Checkout';
  labels?: Partial<Record<AddressFieldKey, string>>;
  requiredMessages?: Partial<Record<AddressFieldKey, string>>;
  submitLabel?: string;
  defaultValues?: Partial<AddressInput>;
  showCancel?: boolean;
  actionsClassName?: string;
  submitButtonClassName?: string;
}

export function AddressForm({
    countries,
    address,
    onSubmit,
    onCancel,
    isSubmitting,
    translationNamespace = 'Account',
    labels,
    requiredMessages,
    submitLabel,
    defaultValues,
    showCancel = true,
    actionsClassName,
    submitButtonClassName,
}: AddressFormProps) {
  const t = useTranslations(translationNamespace);
  const translate = t as (key: string) => string;
  const resolvedLabels = {...labelKeys, ...labels};
  const resolvedRequiredMessages = {...requiredMessageKeys, ...requiredMessages};
  const fieldPolicies = storefront.checkout.addressFields;
  const { register, handleSubmit, formState: { errors }, control } = useForm<AddressInput>({
    defaultValues: address
        ? addressToInput(address)
        : {
            countryCode: countries[0]?.code || 'US',
            ...defaultValues,
        }
  });

  const handleFormSubmit = async (data: AddressInput) => {
    await onSubmit(address ? { ...data, id: address.id } : data);
  };

  const shouldRender = (field: AddressFieldKey) => fieldPolicies[field] !== 'hidden';
  const rulesFor = (field: AddressFieldKey) => fieldPolicies[field] === 'required'
      ? {required: translate(resolvedRequiredMessages[field])}
      : undefined;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup className="my-6">
        <div className="grid grid-cols-2 gap-4">
          {shouldRender('fullName') && (
              <Field className="col-span-2">
                <FieldLabel htmlFor="fullName">{translate(resolvedLabels.fullName)}</FieldLabel>
                <Input
                  id="fullName"
                  {...register('fullName', rulesFor('fullName'))}
                  disabled={isSubmitting}
                />
                <FieldError>{errors.fullName?.message}</FieldError>
              </Field>
          )}

          {shouldRender('company') && (
              <Field className="col-span-2">
                <FieldLabel htmlFor="company">{translate(resolvedLabels.company)}</FieldLabel>
                <Input id="company" {...register('company', rulesFor('company'))} disabled={isSubmitting} />
                <FieldError>{errors.company?.message}</FieldError>
              </Field>
          )}

          {shouldRender('streetLine1') && (
              <Field className="col-span-2">
                <FieldLabel htmlFor="streetLine1">{translate(resolvedLabels.streetLine1)}</FieldLabel>
                <Input
                  id="streetLine1"
                  {...register('streetLine1', rulesFor('streetLine1'))}
                  disabled={isSubmitting}
                />
                <FieldError>{errors.streetLine1?.message}</FieldError>
              </Field>
          )}

          {shouldRender('streetLine2') && (
              <Field className="col-span-2">
                <FieldLabel htmlFor="streetLine2">{translate(resolvedLabels.streetLine2)}</FieldLabel>
                <Input id="streetLine2" {...register('streetLine2', rulesFor('streetLine2'))} disabled={isSubmitting} />
                <FieldError>{errors.streetLine2?.message}</FieldError>
              </Field>
          )}

          {shouldRender('city') && (
              <Field>
                <FieldLabel htmlFor="city">{translate(resolvedLabels.city)}</FieldLabel>
                <Input
                  id="city"
                  {...register('city', rulesFor('city'))}
                  disabled={isSubmitting}
                />
                <FieldError>{errors.city?.message}</FieldError>
              </Field>
          )}

          {shouldRender('province') && (
              <Field>
                <FieldLabel htmlFor="province">{translate(resolvedLabels.province)}</FieldLabel>
                <Input
                  id="province"
                  {...register('province', rulesFor('province'))}
                  disabled={isSubmitting}
                />
                <FieldError>{errors.province?.message}</FieldError>
              </Field>
          )}

          {shouldRender('postalCode') && (
              <Field>
                <FieldLabel htmlFor="postalCode">{translate(resolvedLabels.postalCode)}</FieldLabel>
                <Input
                  id="postalCode"
                  {...register('postalCode', rulesFor('postalCode'))}
                  disabled={isSubmitting}
                />
                <FieldError>{errors.postalCode?.message}</FieldError>
              </Field>
          )}

          {shouldRender('countryCode') && (
              <Field>
                <FieldLabel htmlFor="countryCode">{translate(resolvedLabels.countryCode)}</FieldLabel>
                <Controller
                  name="countryCode"
                  control={control}
                  rules={rulesFor('countryCode')}
                  render={({ field }) => (
                    <CountrySelect
                      countries={countries}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <FieldError>{errors.countryCode?.message}</FieldError>
              </Field>
          )}

          {shouldRender('phoneNumber') && (
              <Field className="col-span-2">
                <FieldLabel htmlFor="phoneNumber">{translate(resolvedLabels.phoneNumber)}</FieldLabel>
                <Input
                  id="phoneNumber"
                  type="tel"
                  {...register('phoneNumber', rulesFor('phoneNumber'))}
                  disabled={isSubmitting}
                />
                <FieldError>{errors.phoneNumber?.message}</FieldError>
              </Field>
          )}
        </div>
      </FieldGroup>

      <div className={cn('flex gap-3 justify-end', actionsClassName)}>
        {showCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {translate('cancel')}
            </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className={submitButtonClassName}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel || (address ? translate('updateAddress') : translate('saveAddress'))}
        </Button>
      </div>
    </form>
  );
}
