# Places Autocomplete Svelte

This Svelte component leverages the [Google Maps Places Autocomplete API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview) to provide a user-friendly way to search for and retrieve detailed address information within your [SvelteKit](https://kit.svelte.dev) applications.

Preview this package [Demo](https://places-autocomplete-demo.pages.dev/)

## Features:

- **Seamless Integration:** Easily integrate the component into your SvelteKit projects.
- **Autocomplete Suggestions:** Provide users with real-time suggestions as they type, enhancing the search experience.
- **Detailed Address Retrieval:** Retrieve comprehensive address information, including street address, city, region, postal code, and country.
- **Country/Region Selection:** Allow users to specify a region for more targeted results.
- **Customizable:** Tailor the component's appearance and behavior using language settings, placeholder text.
- **Accessible:** Supports keyboard navigation for selecting suggestions.

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

## Countries/Regions

Use optional `countries` property to refine search by region:

```svelte
<script>
	// ... other imports

	let countries = [
		{ name: 'United Kingdom', region: 'GB', language: 'en-GB' },
		{ name: 'United States', region: 'US', language: 'en-US' }
		// ... more countries
	];
</script>

<PlaceAutocomplete {onResponse} {PUBLIC_GOOGLE_MAPS_API_KEY} bind:countries/>
```

- The `region` code follows the [CLDR two-character format](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest).
- The `language` in which to return results. [See details](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest.language)


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
	let onError = (error: string) => {
		console.error(error);
		pacError = error;
	};
</script>

<PlaceAutocomplete {onError} {onResponse} {PUBLIC_GOOGLE_MAPS_API_KEY} />

{#if pacError}
	<p class="error">{pacError}</p>
{/if}
```

## Customization

- Placeholder: Use the placeholder property to customize the input field's placeholder text.
- Language: Use the language property to set the language of the autocomplete results.
- Region: Use the region property to bias the results toward a particular region. If the countries array is provided the region will be used from the selected country.
- Autocomplete: Use to disable the input autocomplete. 

```svelte
<script>
	// ... other imports
	const placeholder = 'Search...';
	const language = 'en-GB';
	const region = 'GB';
	const autocompete = 'off';
</script>

<PlaceAutocomplete {onError} {onResponse} {PUBLIC_GOOGLE_MAPS_API_KEY} bind:countries {placeholder} {language} {region} {autocomplete}/>

```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/alexpechkarev/places-autocomplete-svelte/).

## License

[MIT](LICENSE)
