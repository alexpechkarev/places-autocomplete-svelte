# Places (New) Autocomplete Svelte

This Svelte component leverages the [Google Maps Places (New) Autocomplete API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview) to provide a user-friendly way to search for and retrieve detailed address information within your [SvelteKit](https://kit.svelte.dev) applications. Default styling is provided using [Tailwind CSS](https://tailwindcss.com/), but you can fully customize the appearance with your own styles.



## Features:

- **Seamless Integration:** Easily integrate the component into your SvelteKit projects.
- **Autocomplete Suggestions:** Provides real-time address suggestions as the user types.
- **Detailed Address Retrieval:** Retrieve comprehensive address information, including street address, city, region, postal code, and country.
- **Country/Region Filtering:**  Refine search results by specifying countries or regions.
- **Customizable Appearance:** Tailor the component's look and feel with custom CSS classes, overriding the default Tailwind CSS styles.
- **Flexible Data Retrieval:** Control the retrieved data using the `fetchFields` property.
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
	fullResponse = response;
};
</script>

<PlaceAutocomplete  {onResponse} {PUBLIC_GOOGLE_MAPS_API_KEY} />

<p>Response Object: {JSON.stringify(fullResponse, null, 2)}</p>
```



## Customization
- `placeholder`: Use the placeholder property to customize the input field's placeholder text.
- `autocomplete`: Use to disable the HTML `<input>` autocomplete attribute. 
- `requestParams` (optional [AutocompleteRequest properties](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest) ):
	- `language`: in which to return results. If ommited defaults to `en-GB`. [See details](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest.language)
	- `region`: the [CLDR two-character format](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest). Defaults to `GB`. If the countries array is provided the coutries region overwrites the `region` value in `requestParams`.
- `fetchFields`: Use to control the Place response. See [types](https://developers.google.com/maps/documentation/javascript/place-class-data-fields) for details. If omitted defaults to `['formattedAddress', 'addressComponents']`
- `classes`: Customize the styling by providing an object with your CSS classes. This overrides the default Tailwind CSS classes. See the example in the "Basic Usage" section for the structure of the classes object and default class names.

```svelte
<script>
// ... other imports

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
 * AutocompleteRequest properties
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
 * @type object optional
 * Component default Tailwind CSS classes
 */
const classes = {
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
	ul: 'absolute z-50 -mb-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
	li: 'z-50 cursor-default select-none py-2 pl-4 text-gray-900 hover:bg-indigo-500 hover:text-white',
	li_current: 'bg-indigo-500 text-white',
	li_a: 'block w-full'
},

/**
 * @type array optional
 */
const fetchFields = ['formattedAddress', 'addressComponents'];
</script>

<PlaceAutocomplete 
	{onError} 
	{onResponse} 
	{PUBLIC_GOOGLE_MAPS_API_KEY} 
	{requestParams}
	{placeholder} 
	{autocompete}
	{fetchFields}
	{classes}
/>

```


## Component Properties
| Property                 | Type                                       | Description                                                                                                                                                               | Required | Default Value                               |
|--------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------|
| `PUBLIC_GOOGLE_MAPS_API_KEY` | `String`                                     | Your Google Maps Places API Key.                                                                                                                                         | Yes       |                                               |
| `onResponse`              | `CustomEvent` | Dispatched when a place is selected, containing the place details.                                                                                                     | Yes       |                                               |
| `onError`                 | `CustomEvent`                      | Dispatched when an error occurs.                                                                                                                                        | No        |                                               |
| `placeholder`            | `String`                                     | Placeholder text for the input field.                                                                                                                                        | No        | `"Search..."`                             |
| `autocomplete`           | `string`                                     | HTML `autocomplete` attribute for the input field. Set to "off" to disable browser autocomplete.                                                                        | No        | `"off"`                                    |
| `requestParams`          | `Object`   | Object for additional request parameters (e.g., `types`, `bounds`). See [AutocompleteRequest](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest). | No        | `{}`                                       |
| `fetchFields`            | `Array`                                | Array of place data fields to return. See [Supported Fields](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult)                | No        | `['formattedAddress', 'addressComponents']` |
| `classes`              | `Object` |  Object to override default Tailwind CSS classes applied to the component's elements (input, list, etc.). See the "Basic Usage" section for structure and default class names.   | No | *Default Tailwind classes* |


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