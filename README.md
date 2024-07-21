# Places Autocomplete Svelte

`places-autocomplete-svelte` is an implementation of Places Autocomplete feature of the Places library in the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview) for [SvelteKit](https://kit.svelte.dev) helps o retrieve detailed address information.

## Requirements

Before you start using this components you will need to create an API key with Places API (New) enabled. See [Use API keys](https://developers.google.com/maps/documentation/javascript/get-api-key) for more details.

![Places Autocomplete Svelte](places-autocomplete-svelte.gif)

## Installing

### Package manager

Using npm:

```bash
$ npm i places-autocomplete-svelte
```

Once the package is installed, you can import the library using `import` approach:
```js
import  {PlaceAutocomplete}  from 'places-autocomplete-svelte';
```

## Basic Usage


Initiate the component with your public Google Maps API key `PUBLIC_GOOGLE_MAPS_API_KEY` and `formattedAddress` properties. Enter your search query in the search box, then click to select the results. The `formattedAddress` property poulated with the place name and address. 

The request default `language: 'en-GB'` and `region: 'GB'`, see below to specify different.

Use keyboard `up` and `down` key to navigate the  suggested results. `esc` will clear the search query. 

```js
<script>
import  {PlaceAutocomplete}  from 'places-autocomplete-svelte';
    
//the business name and address.
let formattedAddress = '';
// Your Google Maps Public API Key
let PUBLIC_GOOGLE_MAPS_API_KEY = '--PUBLIC_GOOGLE_MAPS_API_KEY--';
</script>

<PlaceAutocomplete bind:PUBLIC_GOOGLE_MAPS_API_KEY bind:formattedAddress/>

// Etihad Stadium, Etihad Campus, Manchester M11 3FF
<p>{formattedAddress}</p>

```

## Formatted Address

You can bind an optional property `formattedAddressObj` hat gets populated with the parsed address components from the Places API response.

Address Parsing:

The Google Mps API `fetchFields()` method retrieves detailed place information. This information is then mapped to the `formattedAddressObj` based on address component types. The following mapping corresponds to the following  component types:

- `street_number`: longText property of the `street_number`
- `street`: longText property of the `route`
- `town`: longText property of the `postal_town`
- `county`: longText property of the `administrative_area_level_2`
- `country_iso2`: shortText property of the `country`
- `postcode`: longText property of the `postal_code`

Benefits:

By using `formattedAddressObj`, you can easily access individual address components like street number, town, and postcode, simplifying address manipulation in your application.

```js
<script>
import  {PlaceAutocomplete}  from 'places-autocomplete-svelte';
// formatted address object    
let formattedAddressObj = {
    street_number: '',
    street: '',
    town: '',
    county: '',
    country_iso2: '',
    postcode: ''
};
// Your Google Maps Public API Key
let PUBLIC_GOOGLE_MAPS_API_KEY = '--PUBLIC_GOOGLE_MAPS_API_KEY--';

</script>

<PlaceAutocomplete 
    bind:PUBLIC_GOOGLE_MAPS_API_KEY 
    bind:formattedAddressObj />
/**
 * Formatted address
 * {
 *   "street_number":"Etihad Stadium",
 *   "street":"Etihad Campus",
 *   "town":"Manchester",
 *   "county":"Greater Manchester",
 *   "country_iso2":"GB",
 *   "postcode":"M11 3FF"
 * }
*/
<p>{JSON.stringify(formattedAddressObj)}</p>

```

## Region

You can bind an optional property `countries` to allow country selection. As per [Google Maps documentation](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest):

`The region code, specified as a CLDR two-character region code. This affects address formatting, result ranking, and may influence what results are returned. This does not restrict results to the specified region.`

```js
<script>
import  {PlaceAutocomplete}  from 'places-autocomplete-svelte';
    
//the business name and address.
let formattedAddress = '';
// Your Google Maps Public API Key
let PUBLIC_GOOGLE_MAPS_API_KEY = '--PUBLIC_GOOGLE_MAPS_API_KEY--';
// countries
let countries = [
    { name: 'United Kingdom', region: 'GB' },
    { name: 'United States', region: 'US' },
    { name: 'Switzerland', region: 'CH' },
    { name: 'Greece', region: 'GR' },
    { name: 'Russia', region: 'RU' },
    { name: 'Japan', region: 'JP' }
];
</script>

<PlaceAutocomplete 
    bind:PUBLIC_GOOGLE_MAPS_API_KEY 
    bind:formattedAddress 
    bind:countries/>

// Etihad Stadium, Etihad Campus, Manchester M11 3FF
<p>{formattedAddress}</p>

```

## Formatted and Unformatted reponses

Depending on your application requirements you can bind the component properties as needed.
Below example binds all three responsones:
- `formattedAddress` - place name and address as string
- `formattedAddressObj` - populated with the parsed address components
- `fullResponse` - populated address components response as it retruned from `fetchFilds()` method

```js
<script>
import  {PlaceAutocomplete}  from 'places-autocomplete-svelte';
    
//the business name and address.
let formattedAddress = '';
// full unformatted response
let fullResponse = [];
// Your Google Maps Public API Key
let PUBLIC_GOOGLE_MAPS_API_KEY = '--PUBLIC_GOOGLE_MAPS_API_KEY--';
// countries
let countries = [
    { name: 'United Kingdom', region: 'GB' },
    { name: 'United States', region: 'US' },
    { name: 'Switzerland', region: 'CH' },
    { name: 'Greece', region: 'GR' },
    { name: 'Russia', region: 'RU' },
    { name: 'Japan', region: 'JP' }
];
</script>

<PlaceAutocomplete 
    bind:formattedAddress
    bind:formattedAddressObj
    bind:fullResponse
    bind:PUBLIC_GOOGLE_MAPS_API_KEY
    bind:countries/>

```




## License

[MIT](LICENSE)

