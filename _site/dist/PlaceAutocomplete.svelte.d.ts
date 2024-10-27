import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        PUBLIC_GOOGLE_MAPS_API_KEY?: string;
        fetchFields?: string[];
        countries?: {
            name: string;
            region: string;
        }[];
        formattedAddress?: string;
        fullResponse?: {
            longText: string;
            shortText: string;
            types: Array<string>;
        }[];
        formattedAddressObj?: {
            street_number: string;
            street: string;
            town: string;
            county: string;
            country_iso2: string;
            postcode: string;
        };
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type PlaceAutocompleteProps = typeof __propDef.props;
export type PlaceAutocompleteEvents = typeof __propDef.events;
export type PlaceAutocompleteSlots = typeof __propDef.slots;
export default class PlaceAutocomplete extends SvelteComponent<PlaceAutocompleteProps, PlaceAutocompleteEvents, PlaceAutocompleteSlots> {
}
export {};
