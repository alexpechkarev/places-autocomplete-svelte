import type {RequestParams} from './interfaces.js';

export const requestParamsDefault:RequestParams = {
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
        locationBias : null,
        
        /**
         * @param LocationRestriction optional
         * Restrict results to a specified location.
         * 
         * At most one of locationBias or locationRestriction should be set. 
         * If neither are set, the results will be biased by IP address, meaning the IP address will 
         * be mapped to an imprecise location and used as a biasing signal.
         */
        locationRestriction: null,

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
export const validateRequestParams = (requestParams:RequestParams) => {

    // Remove any keys that are not in requestParamsDefault
    for (const key in requestParams) {
        if(!(key in requestParamsDefault)) {
            delete (requestParams as never)[key];
        }
    }



    // https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data
    /**
     * If requestParams is not an object, set it to an empty object
     */
    if(typeof requestParams !== 'object') {
        requestParams = {
            input: String(''),
            sessionToken: String(''),
        };

        return requestParams;
    }


    // Reset sessionToken to empty string if passed to the component
    if(requestParams.sessionToken){
        requestParams.sessionToken = String('');
    }    

    /**
     * If requestParams.input is not a string, set it to an empty string
     */
    if(typeof requestParams.input !== 'string') {
        requestParams.input = String('');
    }

    // Limit the number of includedPrimaryTypes to 5
    if ( Array.isArray(requestParams.includedPrimaryTypes) && requestParams.includedPrimaryTypes.length > 5) {

        requestParams.includedPrimaryTypes = requestParams.includedPrimaryTypes.slice(0, 5);

    }else if(!Array.isArray(requestParams.includedPrimaryTypes)){

        delete requestParams.includedPrimaryTypes;
    }

    // Limit the number of includedRegionCodes to 15
    if (Array.isArray(requestParams.includedRegionCodes) && requestParams.includedRegionCodes.length > 15) {

        requestParams.includedRegionCodes = requestParams.includedRegionCodes.slice(0, 15);

    }else if(!Array.isArray(requestParams.includedRegionCodes)){

        delete requestParams.includedRegionCodes;
    }

    // If inputOffset is not a number, set it to 0
    if(requestParams.inputOffset && typeof requestParams.inputOffset !== 'number') {

        delete requestParams.inputOffset;

    }

    // If language is not a string, remove it
    if(requestParams.language && typeof requestParams.language !== 'string') {

        delete requestParams.language ;
    }

    // If locationBias is not a string, remove it
    if(requestParams.locationBias && typeof requestParams.locationBias !== 'string') {
            
            delete requestParams.locationBias;
    }

    // If region is not a string, remove it
    if(requestParams.region && typeof requestParams.region !== 'string') {

        delete requestParams.region ;
    }
    
    
    //console.log('requestParams:', Object.keys(requestParams));

    return requestParams;
};

/**
 * Validate and cast locationBias
 * @param requestParams 
 * @returns requestParams
 */
export const validateLocationBias = (requestParams:RequestParams) => {
    if(('locationBias' in requestParams) && requestParams.locationBias === null) {
        delete requestParams.locationBias;
    }
    return requestParams;
};

/**
 * Validate and cast locationRestriction
 * @param requestParams 
 * @returns requestParams
 */
export const validateLocationRestriction = (requestParams:RequestParams) => {
    if(('locationRestriction' in requestParams) && requestParams.locationRestriction === null) {
        delete requestParams.locationRestriction;
    }
    return requestParams;
};