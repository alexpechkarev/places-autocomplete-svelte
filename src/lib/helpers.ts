import type { RequestParams, ComponentOptions, ComponentClasses, AutoFill, DistanceUnits } from './interfaces.js';

/**
 * Default request parameters
 */
export const requestParamsDefault: RequestParams = {
    /**
     * @type string required
     * The text string on which to search.
     */
    input: '',

    /**
     * @type Array<string>
     * A Place is only returned if its primary type is included in this list.
     * Up to 5 values can be specified.
     * If no types are specified, all Place types are returned.
     * https://developers.google.com/maps/documentation/javascript/place-types
     *
     * ['postal_code','premise','street_address','route']
     * FY83DD 72
     */
    //includedPrimaryTypes: ['postal_code','premise','street_address','route'],
    includedPrimaryTypes: [],
    /**
     * @type Array<string> optional
     * Only include results in the specified regions, specified as up to 15 CLDR two-character region codes.
     * An empty set will not restrict the results.
     * If both locationRestriction and includedRegionCodes are set, the results will be located in the area of intersection.
     */
    includedRegionCodes: ['GB'],
    /**
     * @type number optional
     * A zero-based Unicode character offset of input indicating the cursor position in input.
     * The cursor position may influence what predictions are returned. If not specified, defaults to the length of input.
     */
    inputOffset: 0,

    /**
     * @type string optional
     * The language in which to return results. Will default to the browser's language preference.
     *
     */
    language: 'en-GB',

    /**
     * @type LocationBias  optional
     * Bias results to a specified location.
     * 
     * At most one of locationBias or locationRestriction should be set. 
     * If neither are set, the results will be biased by IP address, meaning the IP address 
     * will be mapped to an imprecise location and used as a biasing signal.
     */
    locationBias: {
        lat: 0,
        lng: 0
    },

    /**
     * @param LocationRestriction optional
     * Restrict results to a specified location.
     * 
     * At most one of locationBias or locationRestriction should be set. 
     * If neither are set, the results will be biased by IP address, meaning the IP address will 
     * be mapped to an imprecise location and used as a biasing signal.
     */
    locationRestriction: {
        west: 0,
        south: 0,
        east: 0,
        north: 0
    },

    /**
     * @type LatLng|LatLngLiteral optional
     * The point around which you wish to retrieve place information.
     */
    origin: {
        lat: 0,
        lng: 0
    },

    /**
     * @type string optional
     * The region code, specified as a CLDR two-character region code. T
     * his affects address formatting, result ranking, and may influence what results are returned.
     * This does not restrict results to the specified region.
     */
    region: 'GB',

    /**
     * @type   AutocompleteSessionToken optional
     * 
     * A token which identifies an Autocomplete session for billing purposes. 
     * Generate a new session token via AutocompleteSessionToken The session begins when the user starts typing a query, and concludes
     * when they select a place and call Place.fetchFields. Each session can have multiple queries, followed by one fetchFields call. 
     * The credentials used for each request within a session must belong to the same Google Cloud Console project. Once a session has 
     * concluded, the token is no longer valid; your app must generate a fresh token for each session. If the sessionToken parameter is 
     * omitted, or if you reuse a session token, the session is charged as if no session token was provided (each request is billed
     * separately).
     * 
     * We recommend the following guidelines:
     * Use session tokens for all Place Autocomplete calls.
     * Generate a fresh token for each session.
     * Be sure to pass a unique session token for each new session. Using the same token for more than one session will result in each 
     * request being billed individually.
     */
    sessionToken: ''

};

/**
 * Default fetch fields values
 * https://developers.google.com/maps/documentation/javascript/place-class-data-fields
 * 
 * unsupported field values
 * geometry, icon, name, permanentlyClosed, photo, placeId, url, utcOffset, vicinity, openingHours, icon, name
 */
export const defaultFetchFields: Array<string> = [
    'formattedAddress',
    'addressComponents',
    'accessibilityOptions',
    'allowsDogs',
    'businessStatus',
    'hasCurbsidePickup',
    'hasDelivery',
    'hasDineIn',
    'displayName',
    'displayNameLanguageCode',
    'editorialSummary',
    'evChargeOptions',
    'adrFormatAddress',
    'fuelOptions',
    'isGoodForChildren',
    'isGoodForGroups',
    'isGoodForWatchingSports',
    'svgIconMaskURI',
    'iconBackgroundColor',
    'internationalPhoneNumber',
    'hasLiveMusic',
    'location',
    'hasMenuForChildren',
    'regularOpeningHours',
    'hasOutdoorSeating',
    'parkingOptions',
    'paymentOptions',
    'photos',
    'nationalPhoneNumber',
    'id',
    'plusCode',
    'priceLevel',
    'primaryType',
    'primaryTypeDisplayName',
    'primaryTypeDisplayNameLanguageCode',
    'rating',
    'userRatingCount',
    'isReservable',
    'hasRestroom',
    'reviews',
    'servesBeer',
    'servesBreakfast',
    'servesBrunch',
    'servesCocktails',
    'servesCoffee',
    'servesDessert',
    'servesDinner',
    'servesLunch',
    'servesVegetarianFood',
    'servesWine',
    'hasTakeout',
    'types',
    'websiteURI',
    'utcOffsetMinutes',
    'viewport',
    'websiteURI'
];

/**
 * Check if a variable is a valid LatLng object
 * @param latLng 
 */
function isValidLatLngLiteral(latLng: { lat: number; lng: number; } | undefined) {
    return latLng && typeof latLng === 'object' && 'lat' in latLng && 'lng' in latLng &&
        typeof latLng.lat === 'number' && typeof latLng.lng === 'number';
}
/**
 * Check if a variable is a valid LatLngBounds object
 * @param bounds 
 * @returns 
 */
function isValidLatLngBoundsLiteral(bounds: { north: number; south: number; east: number; west: number; } | undefined) {
    return bounds && typeof bounds === 'object' && 'north' in bounds && 'south' in bounds && 'east' in bounds && 'west' in bounds &&
        typeof bounds.north === 'number' && typeof bounds.south === 'number' && typeof bounds.east === 'number' && typeof bounds.west === 'number';
}

/**
 * Validate and cast request parameters
 * @param requestParams 
 */
export const validateRequestParams = (requestParams: RequestParams | undefined) => {


    // https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data
    /**
     * create a new object to store validated parameters
    */
    const validatedParams: RequestParams = {
        input: String(''),
        sessionToken: String(''),
        includedRegionCodes: ['GB'],
        language: 'en-GB',
        region: 'GB',
    };



    // iterate over requestParams
    for (const key in requestParams) {
        // Check if key is in requestParamsDefault
        if (key in requestParamsDefault) {
            // Validate and sanitize
            switch (key) {

                case 'input':
                    validatedParams.input = String(requestParams.input);
                    break;

                case 'includedPrimaryTypes':
                    if (Array.isArray(requestParams.includedPrimaryTypes) && requestParams.includedPrimaryTypes.length > 0) {
                        validatedParams.includedPrimaryTypes = requestParams.includedPrimaryTypes.slice(0, 5).map(String);
                    }
                    break;

                case 'includedRegionCodes':
                    if (Array.isArray(requestParams.includedRegionCodes) && requestParams.includedRegionCodes.length > 0) {
                        validatedParams.includedRegionCodes = requestParams.includedRegionCodes.slice(0, 15).map(String);
                    }
                    break;

                case 'inputOffset':
                    {
                        const offset = Number(requestParams.inputOffset);
                        if (!isNaN(offset) && offset >= 0) {  // Allow 0 for offset
                            validatedParams.inputOffset = offset;
                        }
                        break;
                    }

                case 'language':
                    validatedParams.language = String(requestParams.language);
                    break;

                case 'locationBias':
                    if (isValidLatLngLiteral(requestParams.locationBias)) {
                        validatedParams.locationBias = requestParams.locationBias;
                    }
                    break;

                case 'locationRestriction':
                    if (isValidLatLngBoundsLiteral(requestParams.locationRestriction)) {
                        validatedParams.locationRestriction = requestParams.locationRestriction;
                    }
                    break;

                case 'origin':
                    if (isValidLatLngLiteral(requestParams.origin)) {
                        validatedParams.origin = requestParams.origin;
                    }
                    break;

                case 'region':
                    validatedParams.region = String(requestParams.region);
                    break;

                case 'sessionToken': // Session token should be generated on the client-side
                    break; // Ignore any provided sessionToken                    
            }
        }

    }



    //console.log('validatedParams:', Object.keys(validatedParams));
    //console.log('validatedParams:', validatedParams);


    return validatedParams;
};

/**
 * Validate fetchFields array parameters
 * @param fetchFields
 */
export const validateFetchFields = (fetchFields: Array<string> | undefined) => {


    //https://developers.google.com/maps/documentation/javascript/place-class-data-fields
    /**
     * create a new object to store validated parameters
    */
    const validatedFetchFields: Array<string> = [];

    if (typeof fetchFields === 'undefined' || fetchFields.length === 0) {
        return [
            'formattedAddress',
            'addressComponents'
        ];
    }

    // iterate over requestParams
    for (const key of fetchFields) {
        // Check if key is in requestParamsDefault
        if (defaultFetchFields.includes(key)) {
            validatedFetchFields.push(key);
        }
    }

    if (validateFetchFields.length === 0) {
        return [
            'formattedAddress',
            'addressComponents'
        ];
    }


    //console.log('validatedParams:', Object.keys(validatedParams));
    //console.log('validatedParams:', validatedParams);


    return validatedFetchFields;
};


/**
 * Default component classes
 */
export const componentClasses: ComponentClasses = {

    section: '',
    container: 'relative z-10 transform rounded-xl mt-4',
    icon_container: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>',
    input:
        'border-1 w-full rounded-md border-0 shadow-sm bg-gray-100 px-4 py-2.5 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm',
    kbd_container: 'absolute inset-y-0 right-0 flex py-1.5 pr-1.5',
    kbd_escape:
        'inline-flex items-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-8 mr-1',
    kbd_up:
        'inline-flex items-center justify-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-6',
    kbd_down:
        'inline-flex items-center rounded border border-gray-400 px-1 font-sans text-xs text-gray-500 justify-center w-6',
    kbd_active: 'bg-indigo-500 text-white',
    ul: 'absolute z-50 -mb-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm divide-y divide-gray-100',
    li: 'z-50 cursor-default select-none py-2 px-2 lg:px-4 text-gray-900 hover:bg-indigo-500 hover:text-white',
    li_current: 'bg-indigo-500',
    li_a: 'block w-full flex justify-between',
    li_a_current: 'text-white',
    li_div_container: 'flex min-w-0 gap-x-4',
    li_div_one: 'min-w-0 flex-auto',
    li_div_one_p: 'text-sm/6 ',
    li_div_two: 'shrink-0 flex flex-col items-end min-w-16',
    li_div_two_p: 'mt-1 text-xs/5',
    highlight: 'font-bold',
}

/**
 * Default component options
 */
export const componentOptions: ComponentOptions = {
    autofocus: false,
    autocomplete: 'off',
    placeholder: 'Start typing your address',
    distance: true,
    distance_units: 'km',
    classes: componentClasses,
    label: '',
    debounce: 100,
    clear_input: true
}



/**
 * Validate and cast component options
 * @param options 
 */
export const validateOptions = (options: ComponentOptions | undefined): ComponentOptions => {

   if (!options) {
        return componentOptions;
    }

    // Perform a deep merge for the 'classes' object, inspired by the JS library
    const mergedClasses = {
        ...componentOptions.classes,
        ...(options.classes ?? {})
    };

    const validated: ComponentOptions = {
        ...componentOptions, // Start with all defaults
        ...options, // Override with user-provided options
        classes: mergedClasses // Apply the specifically merged classes
    };

    return validated;

};

/**
 * Display distance in km or miles
 * @param distance 
 * @param units 
 * @returns 
 */
export const formatDistance = function (distance: number, units: DistanceUnits): string | null {
    if (typeof distance !== 'number') {
        return null;
    }
    if (units === 'km') {
        return `${(distance / 1000).toFixed(2)} km`;
    } else {
        return `${(distance / 1609.34).toFixed(2)} miles`;
    }
}
