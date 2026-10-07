import {Suspense} from 'react';
import {connection} from 'next/server';
import {isShoppingAssistantEnabled} from './assistant';
import {ShoppingAssistant} from './shopping-assistant';

/**
 * The opt-in entry point for storefront pages: renders the assistant only when its language model
 * provider is configured. The check runs on the server; the browser never learns why it is absent.
 */
export function ShoppingAssistantSection() {
    return (
        <Suspense fallback={null}>
            <ConfiguredShoppingAssistant/>
        </Suspense>
    );
}

async function ConfiguredShoppingAssistant() {
    // Read the runtime environment rather than the one present at build time.
    await connection();
    return isShoppingAssistantEnabled() ? <ShoppingAssistant/> : null;
}
