
/**
 * @interface RequestParams
 * https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data
 */
export interface RequestParams {
        input?: string;
        includedPrimaryTypes?: string[];
        includedRegionCodes?: string[];
        inputOffset?: number;
        language?: string;
        // LatLng|LatLngLiteral|LatLngBounds|LatLngBoundsLiteral|Circle|CircleLiteral|string
        locationBias?: {
            lat: number;
            lng: number;
        }
        // LocationRestriction 
        locationRestriction?: {
            west: number;
            south: number;
            east: number;
            north: number;
        };
        // LatLng|LatLngLiteral 
        origin?: {
            lat: number;
            lng: number;
        };
        region?: string;
        sessionToken?: string;
}

export interface ComponentClasses {
    [key: string]: string;
}

// Types
export type AutoFill = "on" | "off";
export type DistanceUnits = "km" | "miles";


export interface ComponentOptions {
    autofocus?: boolean;
    autocomplete?: AutoFill;
    classes?: ComponentClasses;
    placeholder?: string;
    distance?: boolean;
    distance_units?: DistanceUnits;
    label?: string;
    debounce?: number;
    clear_input?: boolean;
   
}

export interface PlaceResult {
    formattedAddress: string;
    addressComponents: {
        longText: string;
        shortText: string;
        types: string[];
    }[];
    location?: {
        lat: number;
        lng: number;
    };
    [key: string]: unknown;
}

export interface FormattedAddress {
    street_number: string;
    street: string;
    town: string;
    county: string;
    country_iso2: string;
    postcode: string;
}

export interface Props {
    PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    options?:ComponentOptions;
    fetchFields?: string[];
    libraries?: string[];
    requestParams?: RequestParams;
    onResponse: (response: PlaceResult) => void;
    onError: (error: string) => void;
}