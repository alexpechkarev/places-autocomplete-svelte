# Places Autocomplete Svelte

This Svelte component leverages the [Google Maps Places Autocomplete API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview) to provide a user-friendly way to search for and retrieve detailed address information within your [SvelteKit](https://kit.svelte.dev) applications.

## Features:

- **Seamless Integration:** Easily integrate the component into your SvelteKit projects.
- **Autocomplete Suggestions:** Provide users with real-time suggestions as they type, enhancing the search experience.
- **Detailed Address Retrieval:** Retrieve comprehensive address information, including street address, city, region, postal code, and country.
- **Formatted and Unformatted Responses:** Access both formatted address strings and raw address component data for flexible use cases.
- **Country/Region Selection:** Allow users to specify a region for more targeted results.
- **Customizable:** Tailor the component's appearance and behavior using language settings and placeholder text.

![Places Autocomplete Svelte](places-autocomplete-svelte.gif)


## Requirements

- **Google Maps API Key:** Create an API key with the Places API (New) enabled. Refer to [Use API Keys](https://developers.google.com/maps/documentation/javascript/get-api-key) for detailed instructions.

## Installation Svelte 5

```bash
npm i places-autocomplete-svelte
```

## Installation Svelte 4

```bash
npm i places-autocomplete-svelte@1.0.1
```

## Import Component

```javascript
import PlaceAutocomplete from 'places-autocomplete-svelte';
```

## Basic Usage

1. **Provide your Google Maps API Key:** Replace `'--YOUR_API_KEY--'` with your actual Google Maps API key.
2. **Bind to Address Variables:** Use `bind:formattedAddress` to capture the selected address as string.

```svelte
<script>
  import { PlaceAutocomplete } from 'places-autocomplete-svelte';

  let formattedAddress = '';
  let PUBLIC_GOOGLE_MAPS_API_KEY = '--YOUR_API_KEY--';
</script>

<PlaceAutocomplete 
    bind:PUBLIC_GOOGLE_MAPS_API_KEY 
    bind:formattedAddress />

<p>Formatted Address: {formattedAddress}</p> 
```


## Specifying Countries/Regions

Use the `countries` property to refine search by region:

```svelte
<script>
  // ... other imports

  let countries = [
    { name: 'United Kingdom', region: 'GB' , language:'en-GB'},
    { name: 'United States', region: 'US',language:'en-US' },
    // ... more countries
  ];
</script>

<PlaceAutocomplete 
    bind:PUBLIC_GOOGLE_MAPS_API_KEY 
    bind:formattedAddress 
    bind:countries /> 
```

- The `region` code follows the [CLDR two-character format](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest).
- The `language` in which to return results. [See details](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest.language)

## Accessing Full Response Data

For maximum flexibility, access the complete unformatted response from the Google Maps API:

```svelte
<script>
  // ... other imports
  let fullResponse = {}; 
</script>

<PlaceAutocomplete bind:PUBLIC_GOOGLE_MAPS_API_KEY bind:fullResponse />

<pre>{JSON.stringify(fullResponse, null, 2)}</pre>
```

## Example
```svelte
<script>
  import { PlaceAutocomplete } from 'places-autocomplete-svelte';

  let PUBLIC_GOOGLE_MAPS_API_KEY = '--YOUR_API_KEY--';
  let formattedAddress = '';
  let fullResponse = {};
  let formattedAddressObj = {};
  let countries = [
    { name: 'United Kingdom', region: 'GB' , language:'en-GB'},
    { name: 'United States', region: 'US',language:'en-US' },
    // ... more countries
  ];
</script>

<PlaceAutocomplete 
    bind:PUBLIC_GOOGLE_MAPS_API_KEY 
    bind:formattedAddress
    bind:fullResponse
    bind:formattedAddressObj
    bind:countries
    placeholder="Enter your address...">

```
- The `formattedAddress` - selected address as string.
- The `fullResponse` - the complete unformatted response from the Google Maps API.
- The `formattedAddressObj` - parsed address components, containing individual elements like street number, town, and postcode.

The `formattedAddressObj` mapping corresponds to the following component types:

- `formattedAddressObj.street_number`: longText property of the street_number
- `formattedAddressObj.street`: longText property of the route
- `formattedAddressObj.town`: longText property of the postal_town
- `formattedAddressObj.county`: longText property of the administrative_area_level_2
- `formattedAddressObj.country_iso2`: shortText property of the country
- `formattedAddressObj.postcode`: longText property of the postal_code



## Error Handling

The component will throw an error if:
  - The Google Maps API key is invalid or missing.
  - There are network issues connecting to the Google Maps service.

Handle these errors gracefully in your application:

```svelte
<script>
  // ... other imports

 // Error handler
    let pacError = '';
	let onError = (error:string) => {
		console.error(error);
        pacError = error;
	};
</script>

<PlaceAutocomplete bind:PUBLIC_GOOGLE_MAPS_API_KEY {onError} />

{#if pacError}
  <p class="error">{pacError}</p>
{/if}
```







## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/alexpechkarev/places-autocomplete-svelte/).

## License

[MIT](LICENSE)


