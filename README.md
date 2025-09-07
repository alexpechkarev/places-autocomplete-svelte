# Places (New) Autocomplete Svelte

[![npm version](https://badge.fury.io/js/places-autocomplete-svelte.svg)](https://badge.fury.io/js/places-autocomplete-svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible, accessible, and secure [Svelte](https://kit.svelte.dev) component leveraging the [Google Maps Places Autocomplete API (New)](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview).

The component handles API loading, session tokens, debounced fetching, and accessibility, allowing you to focus on building your application. It intelligently manages the Google Maps API loader, creating a shared instance that prevents conflicts with other map components on the same page. 

## Available: Standalone JavaScript Library

Need this functionality for a non-Svelte project? Check out our companion vanilla JavaScript library, `places-autocomplete-js`, which offers the same core Google Places (New) Autocomplete features.
[View `places-autocomplete-js` on GitHub](https://github.com/alexpechkarev/places-autocomplete-js)

## Features

*   Integrates with the modern **Google Maps Places Autocomplete API (New)**.
*   **Automatic Shared Loader:** Intelligently creates a single Google Maps loader instance and shares it via Svelte's context.
*   **Highly Accessible:** Follows WAI-ARIA patterns for comboboxes, with full keyboard navigation and screen reader support.
*   **Secure:** Safely renders suggestions to protect against XSS attacks.
*   Automatically handles **session tokens** for cost management.
*   **Debounced Input:** Limits API calls while the user is typing (configurable).
*   **Suggestion Highlighting:** Automatically highlights the portion of text matching the user's input.
*   **Imperative API:** Exposes `clear()`, `focus()`, and `getRequestParams()` methods for direct control.
*   **Customisable Styling:** Easily override default styles using the `options.classes` prop.
*   **TypeScript Support:** Fully written in TypeScript with included type definitions.
*   **Event Handling:** Provides `onResponse` and `onError` callbacks.

## Demo

See a live demo of the component in action: [Basic Example](https://places-autocomplete-demo.pages.dev/)

[Reactive parameters](https://places-autocomplete-demo.pages.dev/examples/reactive-parameters) - change the search criteria based on user input, like filtering by country or change results language.

[Customise request parameters](https://places-autocomplete-demo.pages.dev/examples/customise-request-parameters) - construct a `requestParams` object and control various aspects of the search, including language, region, and more.

[Retain Input Value After Selection](https://places-autocomplete-demo.pages.dev/examples/retain-input-value) -
This example demonstrates how to configure the component to keep the selected address visible in the input field after a suggestion is chosen.

<img src="places-autocomplete-svelte.gif" alt="A video demonstrating the Places Autocomplete Svelte component in action, showing address suggestions and selection.">

## Requirements

*   **Google Maps API Key** with the "Places API" enabled. Refer to [Use API Keys](https://developers.google.com/maps/documentation/javascript/get-api-key) for detailed instructions.

## Installation

```bash
npm install places-autocomplete-svelte
# or
yarn add places-autocomplete-svelte
```

## Usage

Provide your Google Maps API key to the component. It will automatically handle loading the required `places` library.

```javascript
<script lang="ts">
import { PlaceAutocomplete } from 'places-autocomplete-svelte';
import type { PlaceResult, ComponentOptions, RequestParams } from 'places-autocomplete-svelte/interfaces';

// Get API Key securely (e.g., from environment variables)
const PUBLIC_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

// --- Event Handlers ---
let fullResponse: PlaceResult | null = $state(null);
let placesError = $state('');

const handleResponse = (response: PlaceResult) => {
	console.log('Place Selected:', response);
	fullResponse = response;
	placesError = ''; // Clear previous errors
};

const handleError = (error: string) => {
	console.error('Places Autocomplete Error:', error);
	placesError = error;
	fullResponse = null; // Clear previous results
};

// --- Configuration (Optional) ---
const requestParams: Partial<RequestParams> = $state({
	region: 'GB',
	language: 'en-GB',
});
const fetchFields: string[] = $state(['formattedAddress', 'addressComponents', 'displayName']);
const options: Partial<ComponentOptions> = $state({
	placeholder: 'Start typing your address...',
	debounce: 200,
	classes: {
		input: 'my-custom-input-class border-blue-500',
		highlight: 'bg-yellow-200 text-black',
	},
    clear_input: false,
});
</script>

{#if placesError}
    <div class="error-message" role="alert">
        Error: {placesError}
    </div>
{/if}

<PlaceAutocomplete
    {PUBLIC_GOOGLE_MAPS_API_KEY}
    {requestParams}
    {fetchFields}
    {options}
    onResponse={handleResponse}
    onError={handleError}
/>

{#if fullResponse}
    <h2>Selected Place Details:</h2>
    <pre>{JSON.stringify(fullResponse, null, 2)}</pre>
{/if}

<style>
    :global(.my-custom-input-class) {
        padding: 0.75rem;
        border-radius: 0.25rem;
        width: 100%;
    }
    .error-message {
        color: red;
        margin-bottom: 1rem;
    }
</style>
```

### Advanced: Using with other Google Maps Libraries

You can reuse the shared Google Maps loader created by the `PlaceAutocomplete` component to load other libraries (like `maps`). Because the loader instance is shared, you can access it from any other component to load additional libraries without causing conflicts.

The `PlaceAutocomplete` component only loads the `places` library by default. 
```javascript
// In a parent component, e.g., src/routes/+page.svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { getGMapsLoader } from 'places-autocomplete-svelte/gmaps';
	import PlaceAutocomplete from '$lib/PlaceAutocomplete.svelte';

	const PUBLIC_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

	// Pre-initialise the loader with all libraries needed for this page.
	onMount(async () => {
		const loader = getGMapsLoader(PUBLIC_GOOGLE_MAPS_API_KEY);
		const { Map } = await loader.importLibrary('maps');
        ...
	});
</script>

<!-- The component will now use the loader you created above -->
<PlaceAutocomplete
    {PUBLIC_GOOGLE_MAPS_API_KEY}
    onResponse={...}
    onError={...}
/>

<!-- You can now use other Google Maps services, e.g., a map -->
<div id="map"></div>
```

## Security

### API Key Security

Your Google Maps API Key is a sensitive credential. To prevent unauthorised use and unexpected charges, you **must** restrict it.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials).
2.  Select your API key.
3.  Under **Application restrictions**, select **HTTP referrers (web sites)** and add your application's domain(s) (e.g., `your-domain.com/*`).
4.  Under **API restrictions**, select **Restrict key** and choose the APIs you are using (e.g., **Places API**, **Maps JavaScript API**).

### XSS Protection

This component is designed to be secure out-of-the-box. It safely renders user-input and API responses to prevent Cross-Site Scripting (XSS) vulnerabilities.

## Accessibility

This component is built to be accessible and follows the [WAI-ARIA Authoring Practices for a Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

*   **Keyboard Navigation:** Users can navigate suggestions using `ArrowUp`, `ArrowDown`, select with `Enter`, and close the list with `Escape`.
*   **Screen Reader Support:** Uses `role="combobox"`, `aria-autocomplete`, `aria-expanded`, and `aria-activedescendant` to provide a clear experience for screen reader users.
*   **Focus Management:** Focus remains on the input field while navigating the suggestion list.

## Props

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | `string` | Yes | - | Your restricted Google Maps API Key. |
| `fetchFields` | `string[]` | No | `['formattedAddress', 'addressComponents']` | Place Data Fields to request. **Affects API cost.** |
| `requestParams` | `Partial<RequestParams>` | No | `{ inputOffset: 3, ... }` | Parameters for the Autocomplete API request. |
| `options` | `Partial<ComponentOptions>` | No | `{ debounce: 100, ... }` | Options to control component behavior and appearance. |
| `onResponse` | `(response: PlaceResult) => void` | Yes | - | Callback triggered with the selected place details. |
| `onError` | `(error: string) => void` | Yes | - | Callback triggered when an error occurs. |

## Component Methods (Imperative API)

Get a reference to the component instance using `bind:this` to call its methods directly.

**Example:**

```javascript
<script lang="ts">
    import PlaceAutocomplete from 'places-autocomplete-svelte';
    let autocompleteComponent: PlaceAutocomplete | undefined = $state(undefined);
</script>

<PlaceAutocomplete bind:this={autocompleteComponent} ... />

<button onclick={() => autocompleteComponent?.clear()}>Clear</button>
<button onclick={() => autocompleteComponent?.focus()}>Focus</button>
```

| Method | Signature | Description |
| :--- | :--- | :--- |
| `clear()` | `() => void` | Clears the input, removes suggestions, and resets the session token. |
| `focus()` | `() => void` | Sets focus on the text input field. |
| `getRequestParams()` | `() => RequestParams` | Returns the current internal `requestParams` object. |

## Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `placeholder` | `string` | `''` | Placeholder text for the input field. |
| `debounce` | `number` | `100` | Delay in ms before firing API request. Set to `0` to disable. |
| `distance` | `boolean` | `true` | Show distance from `requestParams.origin` (if provided). |
| `distance_units` | `'km' \| 'miles'` | `'km'` | Units for displaying distance. |
| `label` | `string` | `''` | Optional label text displayed above the input. |
| `autofocus` | `boolean` | `false` | Automatically focus the input on mount. |
| `autocomplete` | `string` | `'off'` | The `autocomplete` attribute for the input field. |
| `classes` | `Partial<ComponentClasses>` | `{}` | Object to override default CSS classes. See Styling section. |
| `clear_input` | `boolean` | `true` | If `false`, retains the `formattedAddress` in the input after selection. |

## Styling (`options.classes`)

Customise the component by providing your own CSS classes via `options.classes`.

**Available Class Keys:**

*   `section`: The main container `section`.
*   `container`: The `div` containing the input and suggestions list.
*   `label`: The `label` element.
*   `input`: The main text `input` element.
*   `icon_container`: Container for the optional icon.
*   `icon`: SVG string for the icon.
*   `ul`: The `<ul>` element for the suggestions list.
*   `li`: Each `<li>` suggestion item.
*   `li_current`: Class added to the currently highlighted `<li>`.
*   `li_div_container`: Container `div` within each list item.
*   `li_div_one`: First inner `div` (contains the main text).
*   `li_div_one_p`: The `<p>` tag containing the main suggestion text.
*   `li_div_two`: Second inner `div` (contains the distance).
*   `li_div_two_p`: The `<p>` tag containing the distance text.
*   `kbd_container`: Container for the keyboard hint keys.
*   `kbd_escape`: The `<kbd>` tag for the 'Esc' hint.
*   `kbd_up`: The `<kbd>` tag for the 'Up Arrow' hint.
*   `kbd_down`: The `<kbd>` tag for the 'Down Arrow' hint.
*   `highlight`: The class applied to the `<span>` wrapping the matched text. Defaults to `'font-bold'`.

**Example:**

```javascript
const options = {
  classes: {
    input: 'form-input w-full rounded-md shadow-sm',
    ul: 'absolute bg-white shadow-lg rounded-md mt-1 w-full z-10',
    li_current: 'bg-blue-500 text-white',
    highlight: 'text-blue-700 font-semibold'
  }
};
```

## Events

*   **`onResponse`**: `(response: PlaceResult) => void`
    *   Fired after a user selects a suggestion and `fetchFields` are retrieved.
*   **`onError`**: `(error: string) => void`
    *   Fired on any error (API loading, fetching suggestions, etc.).

## TypeScript

This component is written in TypeScript. Import types from `places-autocomplete-svelte/interfaces` and helpers from `places-autocomplete-svelte/gmaps`.

## Google Places API & Billing

*   This component uses the Google Maps JavaScript API (Places library). Usage is subject to Google's terms and pricing.
*   It uses **Session Tokens** automatically to group Autocomplete requests, which can reduce costs.
*   Place Details requests (via `fetchFields`) are billed separately. Only request the fields you need to manage costs.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE)