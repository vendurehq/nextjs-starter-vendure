import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tag} from 'lucide-react';
import {applyPromotionCode, removePromotionCode} from './actions';
import {getTranslations} from 'next-intl/server';

type ActiveOrder = {
    id: string;
    couponCodes?: string[] | null;
};

export async function PromotionCode({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = await getTranslations('Cart');
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5"/>
                    {t('promotionCode')}
                </CardTitle>
                <CardDescription>
                    {t('enterDiscountCode')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activeOrder.couponCodes && activeOrder.couponCodes.length > 0 ? (
                    <div className="space-y-2">
                        {activeOrder.couponCodes.map((code) => (
                            <div key={code}
                                 className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-950/20">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-green-600"/>
                                    <span className="font-medium text-sm">{code}</span>
                                </div>
                                <form action={removePromotionCode}>
                                    <input type="hidden" name="code" value={code}/>
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        {t('remove')}
                                    </Button>
                                </form>
                            </div>
                        ))}
                    </div>
                ) : (
                    <form action={applyPromotionCode} className="flex gap-2">
                        <Input
                            type="text"
                            name="code"
                            placeholder={t('enterCode')}
                            className="flex-1"
                            required
                        />
                        <Button type="submit">{t('apply')}</Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
