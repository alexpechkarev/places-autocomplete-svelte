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
/**
 * Create highlighted segments from the original text based on the provided matches.
 * @param originalText The original text to segment.
 * @param matches An array of match objects containing start and end offsets.
 * @returns An array of text segments with highlighting information.
 */
export declare function createHighlightedSegments(originalText: string, matches: {
    startOffset: number;
    endOffset: number;
}[]): {
    text: string;
    highlighted: boolean;
}[];
/**
 * Debounce function that takes a function and a delay
 * and returns a new function that will only execute
 * after the delay has passed without any new calls.
 * This version is generic and preserves the types of the original function.
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds.
 */
export declare const debounce: <T extends (...args: any[]) => void>(func: T, delay: number) => (...args: Parameters<T>) => void;
export declare const ITINERARY_CATEGORIES: {
    car_rental: string;
    car_dealer: string;
    gas_station: string;
    electric_vehicle_charging_station: string;
    parking: string;
    airport: string;
    bus_station: string;
    train_station: string;
    subway_station: string;
    taxi_stand: string;
    ferry_terminal: string;
    restaurant: string;
    cafe: string;
    coffee_shop: string;
    bar: string;
    pub: string;
    night_club: string;
    bakery: string;
    fast_food_restaurant: string;
    ice_cream_shop: string;
    pizza_restaurant: string;
    steak_house: string;
    sushi_restaurant: string;
    hotel: string;
    hostel: string;
    motel: string;
    resort_hotel: string;
    bed_and_breakfast: string;
    campground: string;
    rv_park: string;
    lodging: string;
    cottage: string;
    inn: string;
    guest_house: string;
    tourist_attraction: string;
    museum: string;
    art_gallery: string;
    cultural_landmark: string;
    historical_landmark: string;
    monument: string;
    performing_arts_theater: string;
    aquarium: string;
    zoo: string;
    visitor_center: string;
    town_square: string;
    landmark: string;
    place_of_worship: string;
    park: string;
    national_park: string;
    state_park: string;
    beach: string;
    hiking_area: string;
    amusement_park: string;
    water_park: string;
    botanical_garden: string;
    golf_course: string;
    gym: string;
    natural_feature: string;
    shopping_mall: string;
    supermarket: string;
    grocery_store: string;
    clothing_store: string;
    electronics_store: string;
    souvenir_shop: string;
    gift_shop: string;
    duty_free_store: string;
    hospital: string;
    pharmacy: string;
    atm: string;
    bank: string;
    post_office: string;
    police: string;
    neighborhood: string;
    sublocality: string;
    route: string;
    street_address: string;
    intersection: string;
    locality: string;
    administrative_area_level_4: string;
    country: string;
    administrative_area_level_1: string;
    administrative_area_level_2: string;
    administrative_area_level_3: string;
    administrative_area_level_5: string;
    sublocality_level_1: string;
    sublocality_level_2: string;
    sublocality_level_3: string;
    sublocality_level_4: string;
    sublocality_level_5: string;
    default: string;
};
export declare const ITINERARY_SVG_ICONS: {
    Automotive: string;
    Transport: string;
    "Food and Drink": string;
    Lodging: string;
    Sightseeing: string;
    Recreation: string;
    Shopping: string;
    Health: string;
    Finance: string;
    Geographical: string;
    Navigation: string;
    City: string;
    District: string;
    Airport: string;
    "Subway Station": string;
    "Train Station": string;
    Default: string;
};
