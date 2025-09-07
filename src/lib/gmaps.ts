import { getContext, setContext, hasContext } from 'svelte';
import * as GMaps from '@googlemaps/js-api-loader';
const { Loader } = GMaps;


/**
 * A unique key for setting and getting the Google Maps Loader instance from Svelte's context.
 * This allows multiple components to share a single loader instance.
 */
const gmapsContextKey = Symbol('pacgmaps');

/**
 * Defines the shape of the context object that will be shared.
 * This can be expanded if you need to share more than just the loader.
 */
export type GMapsLoaderType = GMaps.Loader;

/**
 * Gets the Google Maps Loader instance from Svelte's context.
 * @returns {typeof Loader}
 */
export const getGMapsLoader = (PUBLIC_GOOGLE_MAPS_API_KEY:string, version?:string|undefined): GMaps.Loader => {
    version = version || 'weekly';
    if (!hasContext(gmapsContextKey)) {
        const loader = new Loader({
            apiKey: PUBLIC_GOOGLE_MAPS_API_KEY,
            version: version,
        });
        setContext(gmapsContextKey, loader);
    }

    return getContext(gmapsContextKey) as GMaps.Loader;
};