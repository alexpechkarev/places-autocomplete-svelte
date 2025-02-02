import type { RequestParams, ComponentOptions, ComponentClasses } from './interfaces.js';

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
    locationBias: null,

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
 * Validate and cast request parameters
 * @param requestParams 
 */
export const validateRequestParams = (requestParams: RequestParams | undefined) => {



    // https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data
    /**
     * If requestParams is not an object, set it to an empty object
    */
    if (typeof requestParams !== 'object' || Object.keys(requestParams).length === 0) {
        requestParams = {
            input: String(''),
            sessionToken: String(''),
            includedRegionCodes: ['GB'],
            language: 'en-GB',
            region: 'GB',
        };

        return requestParams;
    }


    // Remove any keys that are not in requestParamsDefault
    for (const key in requestParams) {
        if (!(key in requestParamsDefault)) {
            delete (requestParams as never)[key];
        }
    }
    // merge requestParams with requestParamsDefault
    requestParams = Object.assign(requestParamsDefault, requestParams);

    // Reset sessionToken to empty string if passed to the component
    if (requestParams.sessionToken) {
        requestParams.sessionToken = String('');
    }

    /**
     * If requestParams.input is not a string, set it to an empty string
     */
    if (typeof requestParams.input !== 'string') {
        requestParams.input = String('');
    }

    /**
     * If requestParams.includedPrimaryTypes is not an array or is an empty array, remove it
     * If requestParams.includedPrimaryTypes is an array and has more than 5 items, slice it to 5
     */
    if (!Array.isArray(requestParams.includedPrimaryTypes)
        || (Array.isArray(requestParams.includedPrimaryTypes) && requestParams.includedPrimaryTypes.length === 0)) {

        delete requestParams.includedPrimaryTypes;

    } else if (Array.isArray(requestParams.includedPrimaryTypes) && requestParams.includedPrimaryTypes.length > 5) {

        requestParams.includedPrimaryTypes = requestParams.includedPrimaryTypes.slice(0, 5);

    }

    /**
     * If requestParams.includedRegionCodes is not an array or is an empty array, remove it
     * If requestParams.includedRegionCodes is an array and has more than 15 items, slice it to 15
     */
    if (!Array.isArray(requestParams.includedRegionCodes)
        || (Array.isArray(requestParams.includedPrimaryTypes) && requestParams.includedPrimaryTypes.length === 0)) {

        delete requestParams.includedRegionCodes;

    } else if (Array.isArray(requestParams.includedRegionCodes) && requestParams.includedRegionCodes.length > 15) {

        requestParams.includedRegionCodes = requestParams.includedRegionCodes.slice(0, 15);

    }

    /**
     * If requestParams.inputOffset is not a number or is less than 1, remove it
     */
    if (typeof requestParams.inputOffset !== 'number'
        || (typeof requestParams.inputOffset === 'number' && requestParams.inputOffset < 1)
    ) {
        delete requestParams.inputOffset;
    }

    // If language is not a string, remove it
    if (typeof requestParams.language !== 'string') {

        delete requestParams.language;
    }

    // If locationBias is not a string, remove it
    if (typeof requestParams.locationBias !== 'string') {

        delete requestParams.locationBias;
    }

    /**
     * If locationRestriction is not set, remove it
     */
    if (requestParams.locationRestriction?.east === 0
        && requestParams.locationRestriction?.north === 0
        && requestParams.locationRestriction?.south === 0
        && requestParams.locationRestriction?.west === 0
    ) {
        delete requestParams.locationRestriction;
    }

    // If origin is not set, remove it
    if (requestParams.origin?.lat === 0 && requestParams.origin?.lng === 0) {
        delete requestParams.origin;
    }

    // If region is not a string, remove it
    if (typeof requestParams.region !== 'string') {

        delete requestParams.region;
    }


    //console.log('requestParams:', Object.keys(requestParams));


    return requestParams;
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
    ul: 'absolute z-50 -mb-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm divide-y divide-gray-100',
    li: 'z-50 cursor-default select-none py-2 px-2 lg:px-4 text-gray-900 hover:bg-indigo-500 hover:text-white',
    li_current: 'bg-indigo-500 text-white',
    li_a: 'block w-full',
}


export const componentOptions: ComponentOptions = {
    autofocus: false,
    autocomplete: 'off',
    classes: componentClasses,
    placeholder: '',
    show_distance: false
};

/**
 * Validate and cast component options
 * @param options 
 */
export const validateOptions = (options: ComponentOptions | undefined): ComponentOptions => {

    // If options is not an object, set it to an empty object
    if (typeof options !== 'object' || Object.keys(options).length === 0) {
        options = {
            autofocus: false,
            autocomplete: 'off',
            classes: componentClasses,
            placeholder: 'Start typing...',
            show_distance: false
        };

        return options;
    }

    // Find the missing options properties
    for (const key in componentOptions) {
        if (!(key in options)) { 
            (options as any)[key] = componentOptions[key];
            
        }
    }

    // Find the missing classes properties
    for (const key in componentClasses) {
        if (!(key in options.classes)) {
            options.classes[key] = componentClasses[key];
        }
    }


    return options;
};