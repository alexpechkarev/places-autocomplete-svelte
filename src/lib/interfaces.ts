
/**
 * Configuration parameters for Google Places Autocomplete API requests.
 * @interface RequestParams
 * @see https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data
 */
export interface RequestParams {
        /** The user's search input string. Automatically managed by the component. */
        input?: string;
        
        /** Array of place types to include in results (e.g., ['restaurant', 'cafe']). */
        includedPrimaryTypes?: string[];
        
        /** Array of region codes (CLDR format) to restrict results (e.g., ['US', 'CA']). */
        includedRegionCodes?: string[];
        
        /** Zero-based character position in the input string where the service should start matching. */
        inputOffset?: number;
        
        /** Language code for search results (e.g., 'en', 'fr', 'es'). */
        language?: string;
        
        /** 
         * Location bias to prefer results near a specific location.
         * Accepts LatLng, LatLngLiteral, LatLngBounds, LatLngBoundsLiteral, Circle, CircleLiteral, or string.
         */
        locationBias?: {
            lat: number;
            lng: number;
        }
        
        /** 
         * Location restriction to return only results within a specific area.
         * Defines a rectangular boundary using geographic coordinates.
         */
        locationRestriction?: {
            west: number;
            south: number;
            east: number;
            north: number;
        };
        
        /** 
         * Origin point for calculating distance in results.
         * Accepts LatLng or LatLngLiteral.
         */
        origin?: {
            lat: number;
            lng: number;
        };
        
        /** IANA region code (e.g., 'us', 'gb') to bias results. */
        region?: string;
        
        /** Autocomplete session token for billing optimization. Automatically managed by the component. */
        sessionToken?: string;
}

/**
 * CSS class names for styling component elements.
 * Map of component element identifiers to custom CSS class strings.
 * @interface ComponentClasses
 * @example
 * {
 *   input: 'my-custom-input',
 *   ul: 'my-dropdown-list',
 *   li: 'my-list-item'
 * }
 */
export interface ComponentClasses {
    [key: string]: string;
}

/**
 * HTML autocomplete attribute values.
 * Controls browser autofill behavior for the input field.
 * @type {"on" | "off"}
 */
export type AutoFill = "on" | "off" | string;

/**
 * Distance measurement units for displaying place distances.
 * @type {"km" | "miles"}
 */
export type DistanceUnits = "km" | "miles";


/**
 * Configuration options for customizing the PlaceAutocomplete component behavior and appearance.
 * @interface ComponentOptions
 */
export interface ComponentOptions {
    /** Automatically focus the input field when the component mounts. @default false */
    autofocus?: boolean;
    
    /** Browser autocomplete/autofill behavior for the input field. @default "off" */
    autocomplete?: AutoFill;
    
    /** Custom CSS classes for component elements (input, ul, li, etc.). */
    classes?: ComponentClasses;
    
    /** Placeholder text displayed in the input field. @default "Search for a place..." */
    placeholder?: string;
    
    /** Display distance from origin in autocomplete suggestions. @default false */
    distance?: boolean;
    
    /** Unit of measurement for distance display. @default "km" */
    distance_units?: DistanceUnits;
    
    /** Label text displayed above the input field. */
    label?: string;
    
    /** Debounce delay in milliseconds for API requests. @default 100 */
    debounce?: number;
    
    /** Clear the input field after selecting a place. @default true */
    clear_input?: boolean;
}

/**
 * Detailed information about a selected place returned by the Google Places API.
 * Contains formatted address, address components, location coordinates, and additional place data
 * depending on the requested fetch fields.
 * @interface PlaceResult
 * @see https://developers.google.com/maps/documentation/javascript/place-data-fields
 */
export interface PlaceResult {
    /** Human-readable address of the place (e.g., "1600 Amphitheatre Parkway, Mountain View, CA"). */
    formattedAddress: string;
    
    /** 
     * Array of address components (street, city, state, country, postal code, etc.).
     * Each component includes long text, short text, and type identifiers.
     */
    addressComponents: {
        /** Full text representation of the address component (e.g., "California"). */
        longText: string;
        
        /** Abbreviated representation of the address component (e.g., "CA"). */
        shortText: string;
        
        /** Array of types describing the component (e.g., ["administrative_area_level_1", "political"]). */
        types: string[];
    }[];
    
    /** Geographic coordinates (latitude and longitude) of the place. */
    location?: {
        lat: number;
        lng: number;
    };
    
    /** Additional place data fields as requested via fetchFields prop (e.g., displayName, types, photos). */
    [key: string]: unknown;
}

/**
 * Standardized address format with commonly used components extracted from PlaceResult.
 * Provides a consistent structure for address data across different regions.
 * @interface FormattedAddress
 */
export interface FormattedAddress {
    /** Street number (e.g., "1600"). */
    street_number: string;
    
    /** Street name (e.g., "Amphitheatre Parkway"). */
    street: string;
    
    /** City or locality name (e.g., "Mountain View"). */
    town: string;
    
    /** County or administrative area (e.g., "Santa Clara County"). */
    county: string;
    
    /** Two-letter ISO country code (e.g., "US", "GB", "FR"). */
    country_iso2: string;
    
    /** Postal/ZIP code (e.g., "94043"). */
    postcode: string;
}

/**
 * Component props for the PlaceAutocomplete Svelte component.
 * @interface Props
 */
export interface Props {
    /** 
     * Google Maps API key for Places API authentication.
     * Required if not using a parent GMapsProvider component.
     * @see https://developers.google.com/maps/documentation/javascript/get-api-key
     */
    PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    
    /** Configuration options for component behavior and styling. */
    options?: ComponentOptions;
    
    /** 
     * Array of Place Data Fields to fetch when a place is selected.
     * @default ['addressComponents', 'formattedAddress']
     * @see https://developers.google.com/maps/documentation/javascript/place-data-fields
     */
    fetchFields?: string[];
    
    /** Google Maps libraries to load (managed internally, reserved for future use). */
    libraries?: string[];
    
    /** Additional parameters for Places Autocomplete API requests. */
    requestParams?: RequestParams;
    
    /** 
     * Callback function invoked when a place is successfully selected.
     * Receives the complete PlaceResult object with requested fields.
     */
    onResponse: (response: PlaceResult) => void;
    
    /** 
     * Callback function invoked when an error occurs during API calls.
     * Receives an error message string describing the issue.
     */
    onError: (error: string) => void;
}