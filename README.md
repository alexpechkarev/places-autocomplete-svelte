# Places (New) Autocomplete Svelte

[![npm version](https://badge.fury.io/js/places-autocomplete-svelte.svg)](https://badge.fury.io/js/places-autocomplete-svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible, accessible, and secure [Svelte](https://kit.svelte.dev) component leveraging the [Google Maps Places Autocomplete API (New)](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview).

The component handles API loading, session tokens, debounced fetching, and accessibility, allowing you to focus on building your application. It intelligently manages the Google Maps API loader, creating a shared instance via Svelte's context that prevents conflicts with other map components on the same page.

**Two initialisation patterns:**
- **Simple/Automatic**: Pass your API key directly to the component for basic use cases
- **Advanced/Manual**: Initialise the loader once in a parent component when using multiple Google Maps libraries or components 

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

### Basic Usage (Automatic Initialisation)

For simple use cases, just pass your API key to the component. It will automatically handle the Google Maps loader initialisation:


```javascript
<script lang="ts">
    import { PlaceAutocomplete } from 'places-autocomplete-svelte';
    import type { PlaceResult } from 'places-autocomplete-svelte/interfaces';

    // Get API Key securely (e.g., from environment variables)
    const PUBLIC_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

    const handleResponse = (response: PlaceResult) => {
        console.log('Selected:', response.formattedAddress);
    };

    const handleError = (error: string) => {
        console.error('Error:', error);
    };
</script>

<PlaceAutocomplete 
    {PUBLIC_GOOGLE_MAPS_API_KEY}
    onResponse={handleResponse} 
    onError={handleError} 
/>
```

### Advanced Usage (Manual Initialisation)

For applications that need multiple Google Maps libraries (e.g., `places`, `maps`, `marker`) or multiple map components, initialise the loader once in a parent component. This approach:

- Loads all required libraries in a single API call (more efficient)
- Prevents "Loader must not be called again" errors
- Shares the loader instance across all child components via Svelte context
- Works seamlessly with SvelteKit's SSR (only initialises in the browser)

**When to use manual initialisation:**
- Using multiple Google Maps components on the same page
- Need to load multiple libraries (`maps`, `marker`, `geometry`, etc.)
- Building a layout that shares map functionality across routes
- Want centralised error handling for the loader

```javascript
// In +layout.svelte or +page.svelte
<script lang="ts">
    import { browser } from '$app/environment';
    import { PlaceAutocomplete } from 'places-autocomplete-svelte';
    import { setGMapsContext, initialiseGMaps, importLibrary } from 'places-autocomplete-svelte/gmaps';
    import { onMount } from 'svelte';

    // 1. Set the context at the top level (must be synchronous)
    setGMapsContext();

    // 2. Initialise the loader in the browser
    if (browser) {
        initialiseGMaps({
            key: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY,
            v: 'weekly'
        }).catch((error) => {
            console.error('Failed to initialise Google Maps:', error);
        });
    }

    // 3. Load additional libraries as needed
    let map: google.maps.Map;
    
    onMount(async () => {
        const { Map } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');
        
        const mapElement = document.getElementById('map');
        if (mapElement) {
            map = new Map(mapElement, {
                center: { lat: 51.5072, lng: -0.1276 },
                zoom: 10,
                mapId: 'YOUR_MAP_ID'
            });
        }
    });

    // 4. Handle autocomplete responses
    const handleResponse = (response: PlaceResult) => {
        console.log('Selected:', response.formattedAddress);
        // Update map with selected location
        if (response.location && map) {
            map.setCenter(response.location);
            map.setZoom(15);
        }
    };

    const handleError = (error: string) => {
        console.error('Error:', error);
    };
</script>

<!-- The component automatically uses the shared context -->
<!-- No need to pass PUBLIC_GOOGLE_MAPS_API_KEY when using manual initialisation -->
<PlaceAutocomplete 
    onResponse={handleResponse} 
    onError={handleError} 
/>

<div id="map" class="h-96 w-full"></div>
```

**Available helper functions from `places-autocomplete-svelte/gmaps`:**

- `setGMapsContext()` - Creates the shared context (call once at the top level)
- `getGMapsContext()` - Retrieves the context (returns stores for initialisation state and errors)
- `hasGMapsContext()` - Checks if context exists (useful for conditional logic)
- `initialiseGMaps(options)` - Initialises the loader with your API key and options
- `initialiseGMapsNoContext(options)` - Initialises without context (for edge cases)
- `importLibrary(library)` - Dynamically imports Google Maps libraries

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
| `PUBLIC_GOOGLE_MAPS_API_KEY` | `string` | No* | - | Your Google Maps API Key. **Required for automatic initialisation.** Optional if you've initialised the loader in a parent component using `initialiseGMaps()`. |
| `onResponse` | `(response: PlaceResult) => void` | Yes | - | Callback triggered when a user selects a place. Receives the full place details object. |
| `onError` | `(error: string) => void` | Yes | - | Callback triggered when an error occurs (API loading, network issues, etc.). |
| `fetchFields` | `string[]` | No | `['formattedAddress', 'addressComponents']` | Place Data Fields to request from the API. See [Place Data Fields](https://developers.google.com/maps/documentation/javascript/place-data-fields). **Affects API billing.** |
| `requestParams` | `Partial<RequestParams>` | No | `{ inputOffset: 3 }` | Parameters for the Autocomplete API request (language, region, location bias, etc.). See RequestParams interface. |
| `options` | `Partial<ComponentOptions>` | No | `{ debounce: 100 }` | UI and behavior options (placeholder, debounce delay, distance display, custom classes, etc.). See ComponentOptions interface. |

*Either `PUBLIC_GOOGLE_MAPS_API_KEY` prop OR manual initialisation with `initialiseGMaps()` is required.

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

This component is written in TypeScript with full type definitions included.

**Available imports:**

```typescript
// Component
import { PlaceAutocomplete } from 'places-autocomplete-svelte';

// Types and interfaces
import type { 
    PlaceResult,
    ComponentOptions,
    RequestParams,
    FormattedAddress,
    ComponentClasses,
    Props
} from 'places-autocomplete-svelte/interfaces';

// Google Maps loader helpers
import { 
    setGMapsContext,
    getGMapsContext,
    hasGMapsContext,
    initialiseGMaps,
    initialiseGMapsNoContext,
    importLibrary,
    type GMapsContext,
    type APIOptions
} from 'places-autocomplete-svelte/gmaps';
```

## Google Places API & Billing

*   This component uses the Google Maps JavaScript API (Places library). Usage is subject to Google's terms and pricing.
*   It uses **Session Tokens** automatically to group Autocomplete requests, which can reduce costs.
*   Place Details requests (via `fetchFields`) are billed separately. Only request the fields you need to manage costs.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE)