import type { RequestParams, ComponentOptions, ComponentClasses, DistanceUnits } from './interfaces.js';
/**
 * Default request parameters
 */
export declare const requestParamsDefault: RequestParams;
/**
 * Default fetch fields values
 * https://developers.google.com/maps/documentation/javascript/place-class-data-fields
 *
 * unsupported field values
 * geometry, icon, name, permanentlyClosed, photo, placeId, url, utcOffset, vicinity, openingHours, icon, name
 */
export declare const defaultFetchFields: Array<string>;
/**
 * Validate and cast request parameters
 * @param requestParams
 */
export declare const validateRequestParams: (requestParams: RequestParams | undefined) => RequestParams;
/**
 * Validate fetchFields array parameters
 * @param fetchFields
 */
export declare const validateFetchFields: (fetchFields: Array<string> | undefined) => string[];
/**
 * Default component classes
 */
export declare const componentClasses: ComponentClasses;
/**
 * Default component options
 */
export declare const componentOptions: ComponentOptions;
/**
 * Validate and cast component options
 * @param options
 */
export declare const validateOptions: (options: ComponentOptions | undefined) => ComponentOptions;
/**
 * Display distance in km or miles
 * @param distance
 * @param units
 * @returns
 */
export declare const formatDistance: (distance: number, units: DistanceUnits) => string | null;
