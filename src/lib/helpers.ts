import type { RequestParams, ComponentOptions, ComponentClasses, DistanceUnits } from './interfaces.js';

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
     * 
     */
    //includedPrimaryTypes: ['postal_code','premise','street_address','route'],
    includedPrimaryTypes: [],
    /**
     * @type Array<string> optional
     * Only include results in the specified regions, specified as up to 15 CLDR two-character region codes.
     * An empty set will not restrict the results.
     * If both locationRestriction and includedRegionCodes are set, the results will be located in the area of intersection.
     */
    includedRegionCodes: [],
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
        //includedRegionCodes: ['GB'],
        //language: 'en-GB',
        //region: 'GB',
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

   section: 'pac-section',
    container: 'pac-container', //'relative z-10 transform rounded-xl mt-4',
    icon_container: 'pac-icon-container', //'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>',
    input: 'pac-input',
    //'border-1 w-full rounded-md border-0 shadow-sm bg-gray-100 px-4 py-2.5 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm',
    kbd_container: 'pac-kbd-container', //'absolute inset-y-0 right-0 flex py-1.5 pr-1.5',
    kbd_escape: 'pac-kbd-escape', //'inline-flex items-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-8 mr-1',
    kbd_up: 'pac-kbd-up',
    //'inline-flex items-center justify-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-6',
    kbd_down: 'pac-kbd-down',
    //'inline-flex items-center rounded border border-gray-400 px-1 font-sans text-xs text-gray-500 justify-center w-6',
    kbd_active: 'pac-kbd-active', //'bg-indigo-500 text-white',
    ul: 'pac-ul', //'absolute z-50 -mb-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm divide-y divide-gray-100',
    li: 'pac-li', //'z-50 cursor-default select-none py-2 px-2 lg:px-4 text-gray-900 hover:bg-indigo-500 hover:text-white',
    li_current: 'pac-li-current', //'bg-indigo-500 text-white',
    li_button: 'pac-li-button', //'block w-full flex justify-between',
    li_button_current: 'pac-li-button-current', //'text-white',
    li_div_container: 'pac-li-div-container', //'flex min-w-0 gap-x-4',
    li_div_one: 'pac-li-div-one', //'min-w-0 flex-auto flex gap-x-4 justify-center items-center',
    li_div_p_container: 'pac-li-div-p-container', //'min-w-0 flex-auto',
    li_div_one_p: 'pac-li-div-one-p', //'text-sm/6 text-left',
    li_div_one_p_secondaryText: 'pac-li-div-one-p-secondaryText', //'text-xs text-left leading-2',
    li_div_two: 'pac-li-div-two', //'shrink-0 flex flex-col items-end min-w-16',
    li_div_two_p: 'pac-li-div-two-p', //'mt-1 text-xs/5',
    li_div_two_p_place_type: 'pac-li-div-two-p-place_type',
    li_div_two_p_place_type_icon: 'pac-li-div-two-p-place_type-icon',
    li_div_two_p_place_type_label: 'pac-li-div-two-p-place_type-label',
    highlight: 'pac-highlight', //'font-bold',
    map_pin_icon: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
}

/**
 * Default component options
 */
export const componentOptions: ComponentOptions = {
    autofocus: false,
    autocomplete: 'off',
    placeholder: 'Start typing your address',
    distance: false,
    distance_units: 'km',
    classes: componentClasses,
    label: '',
    debounce: 100,
    clear_input: true,
    // Return Value:  Object a JSON object with all the requested Place properties
    // or as google.maps.places.Place class instance
    response_type: 'json', // 'json' | 'place',
    show_place_type: false, // show place type in the autocomplete suggestions
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

/**
 * Create highlighted segments from the original text based on the provided matches.
 * @param originalText The original text to segment.
 * @param matches An array of match objects containing start and end offsets.
 * @returns An array of text segments with highlighting information.
 */
export function createHighlightedSegments(originalText: string, matches: { startOffset: number; endOffset: number }[]) {
    const segments: { text: string; highlighted: boolean }[] = [];
    if (!originalText || !matches) return segments;
    let lastIndex = 0;

    // Sort matches just in case they aren't ordered
    matches.sort((a, b) => a.startOffset - b.startOffset);

    for (const match of matches) {
        // Add text before the match
        if (match.startOffset > lastIndex) {
            segments.push({ text: originalText.substring(lastIndex, match.startOffset), highlighted: false });
        }
        // Add the matched text
        segments.push({ text: originalText.substring(match.startOffset, match.endOffset), highlighted: true });
        lastIndex = match.endOffset;
    }

    // Add any remaining text after the last match
    if (lastIndex < originalText.length) {
        segments.push({ text: originalText.substring(lastIndex), highlighted: false });
    }

    return segments;
}



/**
 * Debounce function that takes a function and a delay
 * and returns a new function that will only execute
 * after the delay has passed without any new calls.
 * This version is generic and preserves the types of the original function.
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

// Itinerary category mapping
export const ITINERARY_CATEGORIES = {
    // --- TRANSPORT & AUTO ---
    "car_rental": "Automotive",
    "car_dealer": "Automotive",
    "gas_station": "Automotive",
    "electric_vehicle_charging_station": "Automotive",
    "parking": "Automotive",
    "airport": "Airport",
    "bus_station": "Transport",
    "train_station": "Train Station",
    "subway_station": "Subway Station",
    "taxi_stand": "Transport",
    "ferry_terminal": "Transport",

    // --- DINING & NIGHTLIFE ---
    "restaurant": "Food and Drink",
    "cafe": "Food and Drink",
    "coffee_shop": "Food and Drink",
    "bar": "Food and Drink",
    "pub": "Food and Drink",
    "night_club": "Food and Drink",
    "bakery": "Food and Drink",
    "fast_food_restaurant": "Food and Drink",
    "ice_cream_shop": "Food and Drink",
    "pizza_restaurant": "Food and Drink",
    "steak_house": "Food and Drink",
    "sushi_restaurant": "Food and Drink",

    // --- LODGING ---
    "hotel": "Lodging",
    "hostel": "Lodging",
    "motel": "Lodging",
    "resort_hotel": "Lodging",
    "bed_and_breakfast": "Lodging",
    "campground": "Lodging",
    "rv_park": "Lodging",
    "lodging": "Lodging",
    "cottage": "Lodging",
    "inn": "Lodging",
    "guest_house": "Lodging",


    // --- SIGHTSEEING & CULTURE ---
    "tourist_attraction": "Sightseeing",
    "museum": "Sightseeing",
    "art_gallery": "Sightseeing",
    "cultural_landmark": "Sightseeing",
    "historical_landmark": "Sightseeing",
    "monument": "Sightseeing",
    "performing_arts_theater": "Sightseeing",
    "aquarium": "Sightseeing",
    "zoo": "Sightseeing",
    "visitor_center": "Sightseeing",
    "town_square": "Sightseeing",
    "landmark": "Sightseeing",
    "place_of_worship": "Sightseeing",

    // --- RECREATION & PARKS ---
    "park": "Recreation",
    "national_park": "Recreation",
    "state_park": "Recreation",
    "beach": "Recreation",
    "hiking_area": "Recreation",
    "amusement_park": "Recreation",
    "water_park": "Recreation",
    "botanical_garden": "Recreation",
    "golf_course": "Recreation",
    "gym": "Recreation",
    "natural_feature": "Recreation",

    // --- SHOPPING ---
    "shopping_mall": "Shopping",
    "supermarket": "Shopping",
    "grocery_store": "Shopping",
    "clothing_store": "Shopping",
    "electronics_store": "Shopping",
    "souvenir_shop": "Shopping", // Simplified name
    "gift_shop": "Shopping",
    "duty_free_store": "Shopping",

    // --- ESSENTIAL SERVICES ---
    "hospital": "Health",
    "pharmacy": "Health",
    "atm": "Finance",
    "bank": "Finance",
    "post_office": "Services",
    "police": "Services",

    // --- GEOGRAPHICAL ---
    "neighborhood": "Geographical",
    "sublocality": "Geographical",

    // --- NAVIGATION ---
    "route": "Navigation",
    "street_address": "Navigation",
    "intersection": "Navigation",

    // -- CITY --
    'locality': 'City',
    'administrative_area_level_4': 'City',
    'country': 'Country',
    'administrative_area_level_1': 'City',
    'administrative_area_level_2': 'City',
    'administrative_area_level_3': 'City',
    'administrative_area_level_5': 'City',
    'sublocality_level_1': 'Neighborhood',
    'sublocality_level_2': 'Neighborhood',
    'sublocality_level_3': 'Neighborhood',
    'sublocality_level_4': 'Neighborhood',
    'sublocality_level_5': 'Neighborhood',

    // --- DEFAULT ---
    "default": "Default"
};

// Itinerary category SVG icons
export const ITINERARY_SVG_ICONS = {
    "Automotive": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,

    "Transport": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,

    "Food and Drink": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,

    "Lodging": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,

    "Sightseeing": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binoculars-icon lucide-binoculars"><path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"/><path d="M 22 16 L 2 16"/><path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/></svg>`,

    "Recreation": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-kayak-icon lucide-kayak"><path d="M18 17a1 1 0 0 0-1 1v1a2 2 0 1 0 2-2z"/><path d="M20.97 3.61a.45.45 0 0 0-.58-.58C10.2 6.6 6.6 10.2 3.03 20.39a.45.45 0 0 0 .58.58C13.8 17.4 17.4 13.8 20.97 3.61"/><path d="m6.707 6.707 10.586 10.586"/><path d="M7 5a2 2 0 1 0-2 2h1a1 1 0 0 0 1-1z"/></svg>`,

    "Shopping": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,

    "Health": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M14 9h-4"/><path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/></svg>`,

    "Finance": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,

    "Geographical": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 20-6-10.6c-.4-.7-1.5-.7-1.9 0L6 20"/><path d="M7 16h10"/><path d="M12 4a8 8 0 0 1 8 8v2a2 2 0 0 1-2 2h-1"/><path d="M7 16H6a2 2 0 0 1-2-2v-2a8 8 0 0 1 8-8"/></svg>`,

    "Navigation": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation-icon lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,


    "City": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2-icon lucide-building-2"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>`,

    "District": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-land-plot-icon lucide-land-plot"><path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/></svg>`,

    "Airport": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane-icon lucide-plane"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,

    "Subway Station": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-subway-icon lucide-subway"><path d="M12 22a10 10 0 0 0 10-10V8l-5-5H7L2 8v4a10 10 0 0 0 10 10Z"/><path d="M12 22V8"/><path d="M7 13h10"/><path d="M7 17h10"/></svg>`,

    "Train Station": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  style="display:inline-block"; viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-train-icon lucide-train"><path d="M2 10h20"/><path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5Z"/><circle cx="7" cy="15" r="2"/><circle cx="17" cy="15" r="2"/></svg>`,

    "Default": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="display:inline-block";  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
};
