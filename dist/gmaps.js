import { getContext, setContext } from 'svelte';
import { writable, get } from 'svelte/store';
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
/**
 * Unique symbol key for storing the Google Maps context in Svelte's context API.
 * Using a Symbol ensures the key cannot be accidentally overwritten by other components.
 * @private
 */
const LOADER_CONTEXT_KEY = Symbol('gmaps-loader');
/**
 * Creates and initialises the Google Maps context with reactive stores.
 * This function should be called once in a top-level parent component (e.g., +layout.svelte)
 * before any child components attempt to use the Google Maps API.
 * The function is idempotent - calling it multiple times has no effect after the first call.
 * @public
 * @returns {void}
 * @example
 * // In +layout.svelte
 * <script>
 *   import { setGMapsContext } from './gmaps';
 *   setGMapsContext();
 * </script>
 */
export function setGMapsContext() {
    // Only set the context if it doesn't already exist.
    if (getContext(LOADER_CONTEXT_KEY))
        return;
    setContext(LOADER_CONTEXT_KEY, {
        isInitialised: writable(false),
        error: writable(null),
        initialisationPromise: null, // Will be set by the loader function
    });
}
/**
 * Retrieves the shared Google Maps context from Svelte's context API.
 * Must be called after setGMapsContext() has been invoked in a parent component.
 * @public
 * @returns {GMapsContext} The context object containing initialisation stores and promise.
 * @throws {Error} If the context has not been set by a parent component.
 */
export function getGMapsContext() {
    const context = getContext(LOADER_CONTEXT_KEY);
    if (!context) {
        throw new Error('Google Maps context not found. Call setGMapsContext in a parent component.');
    }
    return context;
}
/**
 * Checks whether the Google Maps context has been set in the component tree.
 * Use this to conditionally handle scenarios where context may or may not be available.
 * @public
 * @returns {boolean} True if the context exists, false otherwise.
 */
export function hasGMapsContext() {
    const context = getContext(LOADER_CONTEXT_KEY);
    return !!context;
}
/**
 * Asynchronously initialises the Google Maps JavaScript API using the shared context.
 * This function is idempotent and safe to call multiple times - subsequent calls will
 * return the same initialisation promise, preventing duplicate API loading.
 * @public
 * @param {APIOptions} options - Configuration options for the Google Maps API loader, including API key.
 * @returns {Promise<void>} A promise that resolves when the API is fully initialised.
 * @throws {Error} If API initialisation fails (e.g., invalid API key, network issues).
 * @example
 * await initialiseGMaps({ key: 'YOUR_API_KEY', v: 'weekly' });
 */
export async function initialiseGMaps(options) {
    // Get the context internally
    const context = getGMapsContext();
    // If initialisation is already in progress or completed, return the existing promise
    if (context.initialisationPromise) {
        return context.initialisationPromise;
    }
    // If already initialised (e.g., from browser navigation or hot reload), resolve immediately
    if (get(context.isInitialised)) {
        return Promise.resolve();
    }
    // Create a new initialisation promise and store it in the context to prevent duplicate loads
    context.initialisationPromise = new Promise((resolve, reject) => {
        try {
            setOptions(options); // Configure the Google Maps API loader with provided options
            context.isInitialised.set(true);
            resolve();
        }
        catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            context.error.set(error);
            console.error("Failed to set Google Maps API options.", error);
            reject(error);
        }
    });
    return context.initialisationPromise;
}
/**
 * Initialises the Google Maps JavaScript API without using the Svelte context system.
 * Use this when you need standalone initialisation without sharing state across components,
 * such as in the PlaceAutocomplete component when no parent context provider is available.
 * @public
 * @param {APIOptions} options - Configuration options for the Google Maps API loader, including API key.
 * @returns {Promise<void>} A promise that resolves when the API is initialised.
 * @throws {Error} If API initialisation fails.
 * @example
 * await initialiseGMapsNoContext({ key: 'YOUR_API_KEY', v: 'weekly' });
 */
export function initialiseGMapsNoContext(options) {
    return new Promise((resolve, reject) => {
        try {
            setOptions(options);
            resolve();
        }
        catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            console.error("Failed to set Google Maps API options.", error);
            reject(error);
        }
    });
}
/**
 * Re-exported from @googlemaps/js-api-loader for convenient access.
 * Dynamically imports a specific Google Maps library (e.g., 'places', 'maps', 'marker').
 * @public
 * @see https://developers.google.com/maps/documentation/javascript/importing-libraries
 */
export { importLibrary };
