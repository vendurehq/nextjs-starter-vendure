'use client';

import {useState} from 'react';
import type {AddressInput} from '@/lib/commerce/address';
import {addressToInput} from '@/lib/commerce/address';
import {createCustomerAddress, setShippingAddress} from '@/lib/commerce/actions/checkout';
import {AddressForm} from '@/components/commerce/address-form';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Card} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Loader2} from 'lucide-react';
import {useRouter} from '@/i18n/navigation';
import {useCheckout} from '../checkout-provider';
import {useTranslations} from 'next-intl';

interface ShippingAddressStepProps {
    onComplete: () => void;
}

const checkoutAddressLabels = {
    phoneNumber: 'phoneNumber',
};

export default function ShippingAddressStep({onComplete}: ShippingAddressStepProps) {
    const t = useTranslations('Checkout');
    const router = useRouter();
    const {addresses, countries, order, isGuest} = useCheckout();
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
        if (order.shippingAddress) {
            const matchingAddress = addresses.find(
                (address) =>
                    address.streetLine1 === order.shippingAddress?.streetLine1 &&
                    address.postalCode === order.shippingAddress?.postalCode
            );
            if (matchingAddress) {
                return matchingAddress.id;
            }
        }

        const defaultAddress = addresses.find((address) => address.defaultShippingAddress);
        return defaultAddress?.id || null;
    });
    const [dialogOpen, setDialogOpen] = useState(addresses.length === 0 && !isGuest);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [useSameForBilling, setUseSameForBilling] = useState(true);

    const getGuestDefaultValues = (): Partial<AddressInput> => {
        const customerFullName = order.customer
            ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
            : '';

        if (isGuest && order.shippingAddress?.streetLine1) {
            return {
                fullName: order.shippingAddress.fullName || customerFullName,
                streetLine1: order.shippingAddress.streetLine1 || '',
                streetLine2: order.shippingAddress.streetLine2 || '',
                city: order.shippingAddress.city || '',
                province: order.shippingAddress.province || '',
                postalCode: order.shippingAddress.postalCode || '',
                countryCode: countries.find((country) => country.name === order.shippingAddress?.country)?.code || countries[0]?.code || 'US',
                phoneNumber: order.shippingAddress.phoneNumber || order.customer?.phoneNumber || '',
                company: order.shippingAddress.company || '',
            };
        }

        return {
            fullName: customerFullName,
            countryCode: countries[0]?.code || 'US',
            phoneNumber: order.customer?.phoneNumber || '',
        };
    };

    const handleSelectExistingAddress = async () => {
        if (!selectedAddressId) {
            return;
        }

        setLoading(true);
        try {
            const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
            if (!selectedAddress) {
                return;
            }

            await setShippingAddress(addressToInput(selectedAddress), useSameForBilling);
            router.refresh();
            onComplete();
        } catch (error) {
            console.error('Error setting address:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNewAddress = async (data: AddressInput) => {
        setSaving(true);
        try {
            const newAddress = await createCustomerAddress(data);
            setDialogOpen(false);
            router.refresh();
            setSelectedAddressId(newAddress.id);
        } catch (error) {
            console.error('Error creating address:', error);
            alert(`Error creating address: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitGuestAddress = async (data: AddressInput) => {
        setLoading(true);
        try {
            await setShippingAddress(data, useSameForBilling);
            router.refresh();
            onComplete();
        } catch (error) {
            console.error('Error setting address:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isGuest) {
        return (
            <div className="space-y-6">
                <AddressForm
                    countries={countries}
                    onSubmit={handleSubmitGuestAddress}
                    onCancel={() => undefined}
                    isSubmitting={loading}
                    translationNamespace="Checkout"
                    labels={checkoutAddressLabels}
                    defaultValues={getGuestDefaultValues()}
                    showCancel={false}
                    submitLabel={t('continue')}
                    actionsClassName="block"
                    submitButtonClassName="w-full mt-4"
                />

                <SameBillingCheckbox
                    id="same-billing-guest"
                    checked={useSameForBilling}
                    onCheckedChange={setUseSameForBilling}
                    label={t('useSameForBilling')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {addresses.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold">{t('selectSavedAddress')}</h3>
                    <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId}>
                        {addresses.map((address) => (
                            <div key={address.id} className="flex items-start space-x-3">
                                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                                    <Card className="p-4">
                                        <div className="leading-tight space-y-0">
                                            <p className="font-medium">{address.fullName}</p>
                                            {address.company && <p className="text-sm text-muted-foreground">{address.company}</p>}
                                            <p className="text-sm text-muted-foreground">
                                                {address.streetLine1}
                                                {address.streetLine2 && `, ${address.streetLine2}`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {address.city}, {address.province} {address.postalCode}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{address.country.name}</p>
                                            <p className="text-sm text-muted-foreground">{address.phoneNumber}</p>
                                        </div>
                                    </Card>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    <SameBillingCheckbox
                        id="same-billing"
                        checked={useSameForBilling}
                        onCheckedChange={setUseSameForBilling}
                        label={t('useSameForBilling')}
                    />

                    <div className="flex gap-3">
                        <Button
                            onClick={handleSelectExistingAddress}
                            disabled={!selectedAddressId || loading}
                            className="flex-1"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('continueWithSelected')}
                        </Button>

                        <NewAddressDialog
                            open={dialogOpen}
                            onOpenChange={setDialogOpen}
                            title={t('addNewAddress')}
                            description={t('addNewAddressDescription')}
                            triggerLabel={t('addNewAddress')}
                            countries={countries}
                            onSubmit={handleSaveNewAddress}
                            isSubmitting={saving}
                        />
                    </div>
                </div>
            )}

            {addresses.length === 0 && (
                <NewAddressDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    title={t('addShippingAddress')}
                    description={t('addShippingAddressDescription')}
                    triggerLabel={t('addShippingAddress')}
                    countries={countries}
                    onSubmit={handleSaveNewAddress}
                    isSubmitting={saving}
                    triggerClassName="w-full"
                />
            )}
        </div>
    );
}

function SameBillingCheckbox({
    id,
    checked,
    onCheckedChange,
    label,
}: {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
}) {
    return (
        <div className="flex items-center space-x-2">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(value) => onCheckedChange(value === true)}
            />
            <label
                htmlFor={id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
            </label>
        </div>
    );
}

function NewAddressDialog({
    open,
    onOpenChange,
    title,
    description,
    triggerLabel,
    countries,
    onSubmit,
    isSubmitting,
    triggerClassName,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    triggerLabel: string;
    countries: ReturnType<typeof useCheckout>['countries'];
    onSubmit: (data: AddressInput) => Promise<void>;
    isSubmitting: boolean;
    triggerClassName?: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={<Button type="button" variant="outline" className={triggerClassName} />}>
                {triggerLabel}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <AddressForm
                    countries={countries}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                    translationNamespace="Checkout"
                    labels={checkoutAddressLabels}
                />
            </DialogContent>
        </Dialog>
    );
}
