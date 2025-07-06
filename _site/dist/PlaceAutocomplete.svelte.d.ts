import type { Props } from './interfaces.js';
declare const PlaceAutocomplete: import("svelte").Component<Props, {
    clear: () => void;
    focus: () => void;
    getRequestParams: () => import("./interfaces.js").RequestParams;
}, "onResponse" | "onError">;
type PlaceAutocomplete = ReturnType<typeof PlaceAutocomplete>;
export default PlaceAutocomplete;
