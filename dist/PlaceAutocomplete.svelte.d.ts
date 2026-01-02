import type { Props } from './interfaces.js';
declare const PlaceAutocomplete: import("svelte").Component<Props, {
    clear: () => void;
    focus: () => void;
    getRequestParams: () => any;
    setRequestParams: (params: Partial<import("./interfaces.js").RequestParams>) => void;
    setFetchFields: (fields: string[]) => void;
    getFetchFields: () => string[];
}, "onResponse" | "onError">;
type PlaceAutocomplete = ReturnType<typeof PlaceAutocomplete>;
export default PlaceAutocomplete;
