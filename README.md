# Places (New) Autocomplete Svelte

This Svelte component provides a user-friendly way to search for and retrieve detailed address information within your [SvelteKit](https://kit.svelte.dev) applications, leveraging the power of the [Google Maps Places (New) Autocomplete API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview).  It comes with default styling using [Tailwind CSS](https://tailwindcss.com/), which you can fully customize.



## Features

- **Seamless SvelteKit Integration:** Easily add the component to your SvelteKit projects.
- **Real-time Autocomplete Suggestions:**  As the user types, address suggestions appear dynamically.
- **Comprehensive Address Details:** Retrieve detailed information, including street address, city, state/province, postal code, country, and more.
- **Country/Region Filtering:** Narrow down search results by specifying target countries or regions.
- **Customizable Styles:** Tailor the component's appearance to match your application's design by overriding the default Tailwind CSS classes.
- **Flexible Data Control:** Choose the specific data fields you want to retrieve using the `fetchFields` property.
- **Keyboard Navigation & Accessibility:**  Use keyboard navigation for selecting suggestions, ensuring accessibility for all users.


## Demo

See a live demo of the component in action: [Basic Example](https://places-autocomplete-demo.pages.dev/)

[Reactive parameters](https://places-autocomplete-demo.pages.dev/examples/reactive-parameters) - change the search criteria based on user input, like filtering by country or change results language.

[Customise request parameters](https://places-autocomplete-demo.pages.dev/examples/customise-request-parameters) - construct a `requestParams` object and control various aspects of the search, including language, region, and more.


![Places Autocomplete Svelte](places-autocomplete-svelte.gif)

## Requirements

- **Google Maps API Key** with the Places API (New) enabled. Refer to [Use API Keys](https://developers.google.com/maps/documentation/javascript/get-api-key) for detailed instructions.

## Installation Svelte 5

```bash
npm i places-autocomplete-svelte
```

## Installation Svelte 4

```bash
npm i places-autocomplete-svelte@1.0.1
```


## Basic Usage

1. Replace `'___YOUR_API_KEY___'` with your actual **Google Maps API Key**.
2. Use the `onResponse` callback to **handle the response**.

```svelte
<script>
import { PlaceAutocomplete } from 'places-autocomplete-svelte';

//Recommended: Store your key securely as an environment variable
const PUBLIC_GOOGLE_MAPS_API_KEY = '___YOUR_API_KEY___';


let fullResponse = $state('')
let onResponse = (response) => {
	fullResponse = response;
};
</script>

<PlaceAutocomplete  {onResponse} {PUBLIC_GOOGLE_MAPS_API_KEY} />

<p>Response Object: {JSON.stringify(fullResponse, null, 2)}</p>
```


## Component Properties
| Property                 | Type                                       | Description                                                                                                                                                               | Required | Default Value                               |
|--------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------|
| `PUBLIC_GOOGLE_MAPS_API_KEY` | `String`                                     | Your Google Maps Places API Key.                                                                                                                                         | Yes       |                                               |
| `onResponse`              | `CustomEvent` | Dispatched when a place is selected, containing the place details.                                                                                                     | Yes       |                                               |
| `onError`                 | `CustomEvent`                      | Dispatched when an error occurs.                                                                                                                                        | No        |                                               |
| `placeholder`            | `String`                                     | Placeholder text for the input field.                                                                                                                                        | No        | `"Search..."`                             |
| `autocomplete`           | `string`                                     | HTML `autocomplete` attribute for the input field. Set to "off" to disable browser autocomplete. 
| `autofocus`           | `boolean`                                     | The attribute indicating that an element should be focused on page load.                                                                        | No        | `false`                                    |
| `requestParams`          | `Object`   | Object for additional request parameters (e.g., `types`, `bounds`). See [AutocompleteRequest](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest). | No        | `{}`                                       |
| `fetchFields`            | `Array`                                | Array of place data fields to return. See [Supported Fields](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult)                | No        | `['formattedAddress', 'addressComponents']` |
| `classes`              | `Object` |  Object to override default Tailwind CSS classes applied to the component's elements (input, list, etc.). See the "Basic Usage" section for structure and default class names.   | No | *Default Tailwind classes* |

## Customization
### Styling
Customize the component's appearance by providing an object to the classes property. This object should contain key-value pairs, where the keys correspond to the component's elements and the values are your custom CSS class names. See [styling](https://places-autocomplete-demo.pages.dev/examples/styling) for details.


### Request Parameters (requestParams)
Fine-tune the autocomplete search with the requestParams property. This property accepts an object corresponding to the AutocompleteRequest object in the Google Maps API documentation. See this [request parameters](https://places-autocomplete-demo.pages.dev/component/request-parameters) for more details. Here are some common examples:

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
 * default: 'off'
 * */ 
const autocompete = 'off';

/**
 * @type boolean optional
 * Boolean attribute indicating that an element should be focused on page load.
 * default: false
 * */ 
const autofocus = false;
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
	{autofocus}
	{fetchFields}
	{classes}
/>

```




## Error Handling

Use the `onError` event handler to gracefully manage any errors that may occur during the autocomplete process:


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

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub](https://github.com/alexpechkarev/places-autocomplete-svelte/).

## License

[MIT](LICENSE)