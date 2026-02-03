import type { PlaceResult, Props } from './interfaces.js';
declare const PlaceAutocomplete: import("svelte").Component<Props, {
    /**
         * Resets the search input and clears the suggestions list.
         * Optionally populates the input with the formatted address of the selected place.
         * @param {PlaceResult} [placeData] - Optional place data to populate the input field with.
         * @private
         */ reset: (placeData?: PlaceResult) => void;
    clear: () => void;
    focus: () => void;
    getRequestParams: () => import("./interfaces.js").RequestParams;
    setRequestParams: (params: Partial<import("./interfaces.js").RequestParams>) => void;
    setFetchFields: (fields: string[]) => void;
    getFetchFields: () => string[];
    setOptions: (options: import("./interfaces.js").ComponentOptions) => void;
    getOptions: () => import("./interfaces.js").ComponentOptions;
    setInputValue: (latitude: number, longitude: number) => Promise<void>;
}, "onResponse" | "onError">;
type PlaceAutocomplete = ReturnType<typeof PlaceAutocomplete>;
export default PlaceAutocomplete;
