'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle } from 'lucide-react';
import { Link, useRouter } from '@/platform/i18n/navigation';
import { setCustomerForOrder, SetCustomerForOrderResult } from '../actions';
import {useTranslations} from 'next-intl';

interface ContactStepProps {
  onComplete: () => void;
}

interface ContactFormData {
  emailAddress: string;
  firstName: string;
  lastName: string;
}

export default function ContactStep({ onComplete }: ContactStepProps) {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SetCustomerForOrderResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>();

  function getErrorMessage(error: SetCustomerForOrderResult) {
    if (error.success) return null;

    switch (error.errorCode) {
      case 'EMAIL_CONFLICT':
        return (
          <>
            {t('emailConflict')}{' '}
            <Link href="/sign-in?redirectTo=/checkout" className="underline hover:no-underline">
              {t('emailConflictSignIn')}
            </Link>{' '}
            {t('emailConflictSuffix')}
          </>
        );
      case 'GUEST_CHECKOUT_DISABLED':
        return t('guestCheckoutDisabled');
      case 'NO_ACTIVE_ORDER':
        return (
          <>
            {t('cartEmpty')}{' '}
            <Link href="/" className="underline hover:no-underline">
              {t('cartEmptyShop')}
            </Link>
          </>
        );
      default:
        return error.message;
    }
  }

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await setCustomerForOrder(data);

      if (result.success) {
        router.refresh();
        onComplete();
      } else {
        setError(result);
      }
    } catch (err) {
      console.error('Error setting customer:', err);
      setError({ success: false, errorCode: 'UNKNOWN', message: t('unexpectedError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/sign-in?redirectTo=/checkout" className="text-primary underline hover:no-underline">
          {t('signInLink')}
        </Link>
      </p>

      {error && !error.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel htmlFor="emailAddress">{t('emailAddress')}</FieldLabel>
              <Input
                id="emailAddress"
                type="email"
                {...register('emailAddress', {
                  required: t('emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('invalidEmail'),
                  },
                })}
              />
              <FieldError>{errors.emailAddress?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="firstName">{t('firstName')}</FieldLabel>
              <Input
                id="firstName"
                {...register('firstName', { required: t('firstNameRequired') })}
              />
              <FieldError>{errors.firstName?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="lastName">{t('lastName')}</FieldLabel>
              <Input
                id="lastName"
                {...register('lastName', { required: t('lastNameRequired') })}
              />
              <FieldError>{errors.lastName?.message}</FieldError>
            </Field>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('continue')}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
