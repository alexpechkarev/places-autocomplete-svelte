import { getContext, setContext } from 'svelte';
import { writable, type Writable, get } from 'svelte/store';
import { setOptions, importLibrary, type APIOptions } from "@googlemaps/js-api-loader";

// This interface now includes the promise, which is key
interface GMapsContext {
    isInitialized: Writable<boolean>;
    error: Writable<Error | null>;
    initializationPromise: Promise<void> | null;
}

export type { GMapsContext, APIOptions };

const LOADER_CONTEXT_KEY = Symbol('gmaps-loader');

/**
 * Creates and sets the Google Maps context with writable stores.
 * This is synchronous and should be called once in a top-level component's script.
 */
export function setGMapsContext(): void {
    // Only set the context if it doesn't already exist.
    if (getContext(LOADER_CONTEXT_KEY)) return;

    setContext<GMapsContext>(LOADER_CONTEXT_KEY, {
        isInitialized: writable(false),
        error: writable(null),
        initializationPromise: null, // Will be set by the loader function
    });
}

/**
 * Retrieves the shared Google Maps context.
 * @returns {GMapsContext} The stores for initialization status and errors.
 */
export function getGMapsContext(): GMapsContext {
    const context = getContext<GMapsContext>(LOADER_CONTEXT_KEY);
    if (!context) {
        throw new Error('Google Maps context not found. Call setGMapsContext in a parent component.');
    }
    return context;
}

export function hasGMapsContext(): boolean {
    const context = getContext<GMapsContext>(LOADER_CONTEXT_KEY);
    return !!context;
}

/**
 * Asynchronously initializes the Google Maps loader using the provided context.
 * This function is idempotent and safe to be called multiple times.
 * @param context - The GMapsContext object.
 * @param options - The options for the JS API loader, including your API key.
 * @returns {Promise<void>}
 */
export async function initialiseGMaps(options: APIOptions): Promise<void> {

  // Get the context internally
  const context:GMapsContext = getGMapsContext();

    // If the promise already exists, just await it. Don't re-initialize.
    if (context.initializationPromise) {
        return context.initializationPromise;
    }
    
    // If it's already marked as initialized (e.g., from a previous page navigation), resolve immediately.
    if (get(context.isInitialized)) {
        return Promise.resolve();
    }

    // Create the promise and store it in the context object.
    context.initializationPromise = new Promise((resolve, reject) => {
        try {
            setOptions(options); // Await the setOptions which returns a promise
            context.isInitialized.set(true);
            resolve();
        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));
            context.error.set(error);
            console.error("Failed to set Google Maps API options.", error);
            reject(error);
        }
    });

    return context.initializationPromise;
}


/**
 * Initializes the Google Maps API without using the context.
 * @param options The options for the JS API loader, including your API key.
 * @returns A promise that resolves when the API is initialized.
 */
export function initialiseGMapsNoContext(options: APIOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            setOptions(options);
            resolve();
        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));
            console.error("Failed to set Google Maps API options.", error);
            reject(error);
        }
    });
}

// Re-export importLibrary for components to use.
export { importLibrary };