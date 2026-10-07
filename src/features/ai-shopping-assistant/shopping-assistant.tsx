'use client';

import {startTransition, useActionState, useState} from 'react';
import {Search, Sparkles} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {askShoppingAssistant} from './actions';
import type {AssistantState} from './assistant-view';
import {AssistantResults, AssistantResultsSkeleton} from './components/assistant-results';
import {MAX_REQUEST_LENGTH} from './intent-extraction';

const EXAMPLE_KEYS = ['laptopRam', 'laptopBudget', 'nikeShoes'] as const;
const INITIAL_STATE: AssistantState = {status: 'idle', text: ''};

export function ShoppingAssistant() {
    const t = useTranslations('ShoppingAssistant');
    const [state, formAction, isPending] = useActionState(askShoppingAssistant, INITIAL_STATE);
    // Controlled so the request stays visible after React resets the form on submission.
    const [text, setText] = useState('');

    const submitExample = (example: string) => {
        setText(example);
        const formData = new FormData();
        formData.set('request', example);
        startTransition(() => formAction(formData));
    };

    return (
        <section aria-labelledby="shopping-assistant-title" className="py-12 md:py-16 border-b">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center space-y-3 mb-8">
                    <h2 id="shopping-assistant-title" className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
                        <Sparkles className="size-6 text-primary" aria-hidden/>
                        {t('title')}
                    </h2>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>

                <form action={formAction} className="max-w-2xl mx-auto flex flex-col gap-2 sm:flex-row">
                    <label htmlFor="shopping-assistant-request" className="sr-only">{t('label')}</label>
                    <Input
                        id="shopping-assistant-request"
                        name="request"
                        value={text}
                        onChange={event => setText(event.target.value)}
                        placeholder={t('placeholder')}
                        maxLength={MAX_REQUEST_LENGTH}
                        autoComplete="off"
                        disabled={isPending}
                        className="h-11 flex-1"
                    />
                    <Button type="submit" size="lg" disabled={isPending || !text.trim()} className="h-11 sm:min-w-32">
                        {isPending ? <Spinner aria-hidden/> : <Search aria-hidden/>}
                        {isPending ? t('searching') : t('submit')}
                    </Button>
                </form>

                <div className="max-w-2xl mx-auto mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{t('examplesLabel')}</span>
                    {EXAMPLE_KEYS.map(key => (
                        <Button
                            key={key}
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => submitExample(t(`examples.${key}`))}
                        >
                            {t(`examples.${key}`)}
                        </Button>
                    ))}
                </div>

                <div className="mt-10" aria-live="polite" aria-busy={isPending}>
                    {isPending ? <AssistantResultsSkeleton/> : <AssistantResults state={state}/>}
                </div>
            </div>
        </section>
    );
}
