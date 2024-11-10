# Places Autocomplete Svelte

This Svelte component leverages the [Google Maps Places Autocomplete API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview) to provide a user-friendly way to search for and retrieve detailed address information within your [SvelteKit](https://kit.svelte.dev) applications.


## Features:

- **Seamless Integration:** Easily integrate the component into your SvelteKit projects.
- **Autocomplete Suggestions:** Provides real-time address suggestions as the user types.
- **Detailed Address Retrieval:** Retrieve comprehensive address information, including street address, city, region, postal code, and country.
- **Country/Region Filtering:**  Refine search results by specifying countries or regions.
- **Customizable:** Tailor the component's appearance (placeholder, language) and data retrieved (`fetchFields`).
- **Accessible:** Supports keyboard navigation for selecting suggestions.

## Demo

See a live demo of the component in action: [Demo](https://places-autocomplete-demo.pages.dev/)

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


## Basic Usage

1. **Provide your Google Maps API Key:** Replace `'___YOUR_API_KEY___'` with your actual Google Maps API key.
2. **Handle the Response:** Use the `onResponse` callback to receive the selected place details.

```svelte
<script>
	import { PlaceAutocomplete } from 'places-autocomplete-svelte';

	const PUBLIC_GOOGLE_MAPS_API_KEY = '___YOUR_API_KEY___';

	let fullResponse = $state('')
	let onResponse = (response) => {
		console.log(response)
		fullResponse = response;
	};
</script>

<PlaceAutocomplete  {onResponse} {PUBLIC_GOOGLE_MAPS_API_KEY} />

<p>Response Object: {JSON.stringify(fullResponse, null, 2)}</p>
```



## Customization

- `countries`: Use countries property to refine search by region
- `placeholder`: Use the placeholder property to customize the input field's placeholder text.
- `autocomplete`: Use to disable the HTML `<input>` autocomplete attribute. 
- `requestParams` (autocomplete request):
	- `language`: Use the language property to set the language of the autocomplete results.
	- `region`: Use the region property to bias the results toward a particular region. If the countries array is provided the region will be used from the selected country.
- `fetchFields`: Use to control the Place response 

```svelte
<script>
	// ... other imports

	/**
	 * @type array optional
	 */
	let countries = [
		{ name: 'United Kingdom', region: 'GB'},
		{ name: 'United States', region: 'US' }
		// ... more countries
	];
	/**
	 * @type string optional
	 */
	const placeholder = 'Search...';
	/**
	 * @type string optional
	 * The <input> HTML autocomplete attribute.
	 * if ommited defaults to 'off'
	 * */ 
	const autocompete = 'off';
	/**
	 * @type object optional
	 * List of accepted AutocompleteRequest properties
	 */
	const requestParams = {
		/**
		 * @type string optional
		 */
		language : 'en-GB',
		/**
		 * @type string optional
		 */
		region : 'GB',
	}

	/**
	 * @type array optional
	 */
	const fetchFields = ['formattedAddress', 'addressComponents'];
</script>

<PlaceAutocomplete 
	{onError} 
	{onResponse} 
	{PUBLIC_GOOGLE_MAPS_API_KEY} 
	bind:countries 
	{placeholder} 
	{autocompete}
	{fetchFields}/>

```

- `region` code follows the [CLDR two-character format](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest). The selected country region overwrites the `region` value in `requestParams`
- `language` in which to return results. If ommited defaults to the browser's language preference. [See details](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest.language)
- `requestParams` list of accepted [AutocompleteRequest properties](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest)
- `fetchFields` the [types](https://developers.google.com/maps/documentation/javascript/place-class-data-fields) of Place data to return when requesting place details. If omitted defaults to `['formattedAddress', 'addressComponents']`
	 

## Component Properties
| Property                 | Type                                       | Description                                                                                                                                                               | Required | Default Value                               |
|--------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------|
| `PUBLIC_GOOGLE_MAPS_API_KEY` | `String`                                     | Your Google Maps Places API Key.                                                                                                                                         | Yes       |                                               |
| `onResponse`              | `CustomEvent` | Dispatched when a place is selected, containing the place details.                                                                                                     | Yes       |                                               |
| `onError`                 | `CustomEvent`                      | Dispatched when an error occurs.                                                                                                                                        | No        |                                               |
| `countries`              | `Array` | Array of countries/regions to filter results.                                                                                                                            | No        | `[]`                                       |
| `placeholder`            | `String`                                     | Placeholder text for the input field.                                                                                                                                        | No        | `"Search..."`                             |
| `autocomplete`           | `string`                                     | HTML `autocomplete` attribute for the input field. Set to "off" to disable browser autocomplete.                                                                        | No        | `"off"`                                    |
| `requestParams`          | `Object`   | Object for additional request parameters (e.g., `types`, `bounds`). See [AutocompleteRequest](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest). | No        | `{}`                                       |
| `fetchFields`            | `Array`                                | Array of place data fields to return. See [Supported Fields](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult)                | No        | `['formattedAddress', 'addressComponents']` |


## Error Handling

The `onError` event will be dispatched if there is an issue with the Google Maps API or the autocomplete request. 


```svelte
<script>
	// ... other imports

	// Error handler
	let pacError = '';
	let onError = (error: string) => {
		console.error(error);
		pacError = error;
};
</script>

<PlaceAutocomplete 
{onResponse} 
{onError} 
{PUBLIC_GOOGLE_MAPS_API_KEY} />

{#if pacError}
	<p class="error">{pacError}</p>
{/if}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/alexpechkarev/places-autocomplete-svelte/).

## License

[MIT](LICENSE)


