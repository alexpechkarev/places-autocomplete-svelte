
/**
 * @interface RequestParams
 * https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data
 */
export interface RequestParams {
        input: string;
        includedPrimaryTypes?: string[];
        includedRegionCodes?: string[];
        inputOffset?: number;
        language?: string;
        // LatLng|LatLngLiteral|LatLngBounds|LatLngBoundsLiteral|Circle|CircleLiteral|string
        locationBias?: unknown|string;
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


export interface Props {
    PUBLIC_GOOGLE_MAPS_API_KEY: string;
    fetchFields?: string[];
    countries: { name: string; region: string }[];
    placeholder?: string;
    language?: string;
    region?: string;
    // The <input> HTML autocomplete attribute
    autocompete?: AutoFill;
    requestParams: RequestParams;
    onResponse: (e: Event) => void;
    onError: (error: string) => void;
}