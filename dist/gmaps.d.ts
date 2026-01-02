import { type Writable } from 'svelte/store';
import { importLibrary, type APIOptions } from "@googlemaps/js-api-loader";
/**
 * Context object for managing Google Maps API initialisation state across components.
 * Provides reactive stores for initialisation status and error handling, plus a shared promise
 * to prevent duplicate API loading attempts.
 * @interface GMapsContext
 */
interface GMapsContext {
    /** Reactive store tracking whether the Google Maps API has been successfully initialised. */
    isInitialised: Writable<boolean>;
    /** Reactive store containing any error that occurred during API initialisation. */
    error: Writable<Error | null>;
    /** Shared promise for API initialisation, ensuring only one load attempt occurs across all components. */
    initialisationPromise: Promise<void> | null;
}
/**
 * Re-exported types for external use.
 * @public
 */
export type { GMapsContext, APIOptions };
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
export declare function setGMapsContext(): void;
/**
 * Retrieves the shared Google Maps context from Svelte's context API.
 * Must be called after setGMapsContext() has been invoked in a parent component.
 * @public
 * @returns {GMapsContext} The context object containing initialisation stores and promise.
 * @throws {Error} If the context has not been set by a parent component.
 */
export declare function getGMapsContext(): GMapsContext;
/**
 * Checks whether the Google Maps context has been set in the component tree.
 * Use this to conditionally handle scenarios where context may or may not be available.
 * @public
 * @returns {boolean} True if the context exists, false otherwise.
 */
export declare function hasGMapsContext(): boolean;
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
export declare function initialiseGMaps(options: APIOptions): Promise<void>;
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
export declare function initialiseGMapsNoContext(options: APIOptions): Promise<void>;
/**
 * Re-exported from @googlemaps/js-api-loader for convenient access.
 * Dynamically imports a specific Google Maps library (e.g., 'places', 'maps', 'marker').
 * @public
 * @see https://developers.google.com/maps/documentation/javascript/importing-libraries
 */
export { importLibrary };
