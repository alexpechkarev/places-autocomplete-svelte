
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

// export interface ComponentClasses{
//     section?: string;
//     container?: string;
//     icon_container?: string;
//     icon?: string;
//     input?: string;
//     kbd_container?: string;
//     kbd_escape?: string;
//     kbd_up?: string;
//     kbd_down?: string;
//     ul?: string;
//     li?: string;
//     li_current?: string;
//     li_a?: string;
// }

// export interface ComponentOptions{
//     autofocus?: boolean;
//     autocomplete?: AutoFill;
//     placeholder?: string;
//     classes: ComponentClasses;
//     show_distance?: boolean;
// }

export interface ComponentClasses {
    [key: string]: string;
}



export interface ComponentOptions {
    autofocus: boolean;
    autocomplete: AutoFill;
    classes: ComponentClasses;
    placeholder: string;
    show_distance: boolean;
}


export interface Props {
    PUBLIC_GOOGLE_MAPS_API_KEY: string;
    options?:ComponentOptions;
    fetchFields?: string[];
    placeholder?: string;
    autofocus?: boolean;
    autocompete?: AutoFill;
    classes?: ComponentClasses;
    requestParams?: RequestParams;
    onResponse: (e: Event) => void;
    onError: (error: string) => void;
}