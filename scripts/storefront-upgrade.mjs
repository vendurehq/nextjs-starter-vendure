#!/usr/bin/env node
import path from 'node:path';
import {
    finalizeUpgrade,
    initializeStorefront,
    prepareUpgrade,
    verifyUpgrade,
} from './lib/upgrade-protocol.mjs';

const root = process.cwd();
const [command, ...args] = process.argv.slice(2);

try {
    switch (command) {
        case 'init': {
            const release = await initializeStorefront(root);
            console.log(`Initialized storefront provenance at ${release.commit}.`);
            console.log('Commit .vendure/storefront.json with your storefront source.');
            break;
        }
        case 'prepare': {
            const version = args.find(arg => !arg.startsWith('--'));
            const movedBaselineIndex = args.indexOf('--allow-moved-baseline');
            const allowMovedBaseline = movedBaselineIndex === -1 ? null : args[movedBaselineIndex + 1];
            if (movedBaselineIndex !== -1 && !allowMovedBaseline) {
                throw new Error('--allow-moved-baseline requires the recorded commit hash.');
            }
            const prepared = await prepareUpgrade(root, version, {
                legacy: args.includes('--legacy'),
                allowMovedBaseline,
            });
            console.log(`Prepared v${prepared.targetVersion} upgrade context.`);
            console.log(`Read ${path.relative(root, path.join(prepared.contextDirectory, 'INTEGRATION.md'))} before editing source.`);
            console.log(`Write the final report to ${prepared.reportPath} before verification.`);
            break;
        }
        case 'verify': {
            const state = await verifyUpgrade(root);
            console.log(`Verified the upgrade to v${state.targetVersion}.`);
            break;
        }
        case 'finalize': {
            const config = await finalizeUpgrade(root);
            console.log(`Advanced storefront provenance to v${config.version} (${config.commit}).`);
            console.log('Commit the integrated source, upgrade report, and .vendure/storefront.json together.');
            break;
        }
        default:
            throw new Error('Usage: storefront-upgrade.mjs <init|prepare VERSION [--legacy] [--allow-moved-baseline COMMIT]|verify|finalize>');
    }
} catch (error) {
    console.error(`Storefront upgrade failed: ${error.message}`);
    process.exitCode = 1;
}
