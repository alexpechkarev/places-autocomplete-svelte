# Places (New) Autocomplete Svelte

[![npm version](https://badge.fury.io/js/places-autocomplete-svelte.svg)](https://badge.fury.io/js/places-autocomplete-svelte)
[![npm downloads](https://img.shields.io/npm/dm/places-autocomplete-svelte.svg)](https://www.npmjs.com/package/places-autocomplete-svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Maps Platform Awards 2025](https://img.shields.io/badge/Google%20Maps%20Platform-Awards%202025%20Winner-4285F4?style=flat&logo=google-maps&logoColor=white)](https://mapsplatform.google.com/awards/)

A flexible, accessible, and secure [Svelte 5](https://svelte.dev) component leveraging the [Google Maps Places Autocomplete API (New)](https://developers.google.com/maps/documentation/javascript/place-autocomplete-overview). **Winner of the Google Maps Platform Awards 2025**, recognising excellence in Google Maps Platform development.

The component handles API loading, session tokens, debounced fetching, and accessibility, allowing you to focus on building your application. It intelligently manages the Google Maps API loader, creating a shared instance via Svelte's context that prevents conflicts with other map components on the same page.

**Two initialisation patterns:**
- **Simple/Automatic**: Pass your API key directly to the component for basic use cases
- **Advanced/Manual**: Initialise the loader once in a parent component when using multiple Google Maps libraries or components

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Recognition](#recognition)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage-automatic-initialisation)
  - [Advanced Usage](#advanced-usage-manual-initialisation)
- [API Reference](#api-reference)
  - [Props](#props)
  - [Component Methods](#component-methods-imperative-api)
  - [Options](#options)
  - [Events](#events)
- [Styling](#styling)
- [TypeScript](#typescript)
- [Security](#security)
  - [API Key Security](#api-key-security)
  - [XSS Protection](#xss-protection)
- [Accessibility](#accessibility)
- [Google Places API & Billing](#google-places-api--billing)
- [Browser Compatibility](#browser-compatibility)
- [Troubleshooting](#troubleshooting)
- [Standalone JavaScript Library](#standalone-javascript-library)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Features

### Core Functionality
*   🗺️ Integrates with the modern **Google Maps Places Autocomplete API (New)**
*   🔄 **Automatic Shared Loader:** Intelligently creates a single Google Maps loader instance and shares it via Svelte's context
*   💰 Automatically handles **session tokens** for optimal cost management
*   ⚡ **Debounced Input:** Configurable delay to minimise API calls while typing
*   ✨ **Suggestion Highlighting:** Automatically highlights matched text in suggestions

### Accessibility & User Experience
*   ♿ **WCAG Compliant:** Follows WAI-ARIA patterns for comboboxes
*   ⌨️ **Full Keyboard Navigation:** Arrow keys, Enter, and Escape support
*   📢 **Screen Reader Support:** Proper ARIA attributes for assistive technologies

### Developer Experience
*   🎨 **Customisable Styling:** Override default styles via `options.classes` prop
*   🔧 **Imperative API:** Direct control with `clear()`, `focus()`, `getRequestParams()`, `setRequestParams()`, `setFetchFields()`, and `getFetchFields()` methods
*   📘 **TypeScript Support:** Fully typed with comprehensive type definitions
*   🔐 **Secure:** XSS protection with safe rendering of suggestions
*   🎯 **Event Handling:** `onResponse` and `onError` callbacks for complete control

## Demo

Explore live examples showcasing different features and use cases:

**[🚀 Basic Example](https://places-autocomplete-svelte.uk/examples/basic)** - Get started with the simplest implementation

**[🔄 Reactive Parameters](https://places-autocomplete-svelte.uk/examples/reactive-parameters)** - Dynamically change search criteria based on user input, such as filtering by country or switching languages

**[⚙️ Checkout Form](https://places-autocomplete-svelte.uk/examples/checkout-form)** - Capture the detailed address data from a user's selection and use it to automatically populate the fields of a checkout form.

**[📝 Distance & Proximity Filter](https://places-autocomplete-svelte.uk/examples/proximity-filter)** - Restrict or bias search results to a specific area.

<img src="places-autocomplete-svelte.gif" alt="A video demonstrating the Places Autocomplete Svelte component in action, showing address suggestions and selection.">

## Recognition

### 🏆 Google Maps Platform Awards 2025 Winner

<p align="left">
  <a href="https://mapsplatform.google.com/awards/">
    <img src="badge.svg" alt="Google Maps Platform Awards 2025 Winner" width="200">
  </a>
</p>

This component has been recognised as a winner of the **Google Maps Platform Awards 2025** by the Google Developer Program. This award celebrates outstanding projects that demonstrate exceptional use of Google Maps Platform APIs, innovation, and contribution to the developer community.

[Learn more about the Google Maps Platform Awards →](https://mapsplatform.google.com/awards/)

## Requirements

*   **Svelte 5+** - This component requires Svelte 5.0.0 or higher and uses Svelte 5 features including runes (`$state`, `$derived`, etc.)
*   **Node.js 18+** - Required for development and building
*   **Google Maps API Key** with the "Places API" enabled. Refer to [Use API Keys](https://developers.google.com/maps/documentation/javascript/get-api-key) for detailed instructions.

## Installation

```bash
npm install places-autocomplete-svelte
# or
yarn add places-autocomplete-svelte
# or
pnpm add places-autocomplete-svelte
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

For applications using multiple Google Maps libraries (e.g., `places`, `maps`, `marker`) or multiple map components, initialise the loader once in a parent component.

**Benefits:**
- ✅ Loads all required libraries in a single API call (more efficient)
- ✅ Prevents "Loader must not be called again" errors
- ✅ Shares the loader instance across all child components via Svelte context
- ✅ Works seamlessly with SvelteKit's SSR (only initialises in the browser)

**When to use manual initialisation:**
- Multiple Google Maps components on the same page
- Multiple libraries needed (`maps`, `marker`, `geometry`, etc.)
- Shared map functionality across routes
- Centralised error handling for the loader

```javascript
// In +layout.svelte or +page.svelte
<script lang="ts">
    import { browser } from '$app/environment';
    import { PlaceAutocomplete } from 'places-autocomplete-svelte';
    import { setGMapsContext, initialiseGMaps, importLibrary } from 'places-autocomplete-svelte/gmaps';
    import { onMount } from 'svelte';
    import type { PlaceResult } from 'places-autocomplete-svelte/interfaces';

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

## API Reference

The following sections detail the component's props, methods, options, and events.

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

**Example (Svelte 5 syntax):**

```javascript
<script lang="ts">
    import PlaceAutocomplete from 'places-autocomplete-svelte';
    // Note: Using Svelte 5 $state rune
    let autocompleteComponent: PlaceAutocomplete | undefined = $state(undefined);
</script>

<PlaceAutocomplete bind:this={autocompleteComponent} ... />

<button onclick={() => autocompleteComponent?.clear()}>Clear</button>
<button onclick={() => autocompleteComponent?.focus()}>Focus</button>
<button onclick={() => autocompleteComponent?.setRequestParams({ region: 'FR', language: 'fr' })}>
    Switch to French
</button>
<button onclick={() => autocompleteComponent?.setOptions({ placeholder: 'Search locations...', debounce: 300 })}>
    Update Options
</button>
```

| Method | Signature | Description |
| :--- | :--- | :--- |
| `clear()` | `() => void` | Clears the input, removes suggestions, and resets the session token. |
| `focus()` | `() => void` | Sets focus on the text input field. |
| `getRequestParams()` | `() => RequestParams` | Returns the current internal `requestParams` object. |
| `setRequestParams(params)` | `(params: Partial<RequestParams>) => void` | Dynamically updates request parameters. Useful for changing search criteria (region, language, location bias, etc.). Parameters are merged with existing ones. |
| `setFetchFields(fields)` | `(fields: string[]) => void` | Dynamically updates the Place Data Fields to fetch when a place is selected. |
| `getFetchFields()` | `() => string[]` | Returns the current array of Place Data Fields that will be requested. |
| `setOptions(options)` | `(options: Partial<ComponentOptions>) => void` | Dynamically updates the component's configuration options. Merges the provided options with existing settings. |
| `getOptions()` | `() => ComponentOptions` | Returns the current validated options used by the component. Useful for inspecting configuration settings. |

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

## Styling

### Default Styles

The component includes built-in styles with `.pac-` prefixed CSS classes, providing a complete, accessible UI out of the box. These styles are:

*   **Framework-agnostic**: Pure CSS with no dependencies on Tailwind or other frameworks
*   **Modern design**: Clean, professional appearance with proper spacing, shadows, and hover effects
*   **Fully functional**: Includes keyboard navigation indicators, loading states, and responsive behavior
*   **Customisable**: All styles can be overridden via the `options.classes` prop

The default styles include:
- Rounded input with shadow and focus states
- Dropdown list with scroll behavior and dividers
- Keyboard navigation hints (Esc, ↑, ↓)
- Highlighted current selection with color transitions
- Distance display for location-based results
- Icon support with proper alignment
- Responsive layout for mobile and desktop

### Customisation (`options.classes`)

Override any default styling by providing your own CSS classes via `options.classes`. Your custom classes will replace the default `.pac-` classes for the specified elements.

**Available Class Keys:**

*   `section`: The main container `section` (default: `.pac-section`)
*   `container`: The `div` containing the input and suggestions list (default: `.pac-container`)
*   `label`: The `label` element
*   `input`: The main text `input` element (default: `.pac-input`)
*   `icon_container`: Container for the optional icon (default: `.pac-icon-container`)
*   `icon`: SVG string for the icon
*   `ul`: The `<ul>` element for the suggestions list (default: `.pac-ul`)
*   `li`: Each `<li>` suggestion item (default: `.pac-li`)
*   `li_current`: Class added to the currently highlighted `<li>` (default: `.pac-li-current`)
*   `li_button`: The `<button>` within each list item (default: `.pac-li-button`)
*   `li_button_current`: Class added to the currently highlighted button (default: `.pac-li-button-current`)
*   `li_div_container`: Container `div` within each list item (default: `.pac-li-div-container`)
*   `li_div_one`: First inner `div` containing the main text (default: `.pac-li-div-one`)
*   `li_div_one_p`: The `<p>` tag containing the main suggestion text (default: `.pac-li-div-one-p`)
*   `li_div_one_p_secondaryText`: The `<p>` tag for secondary text (default: `.pac-li-div-one-p-secondaryText`)
*   `li_div_p_container`: Container for paragraphs (default: `.pac-li-div-p-container`)
*   `li_div_two`: Second inner `div` containing the distance (default: `.pac-li-div-two`)
*   `li_div_two_p`: The `<p>` tag containing the distance text (default: `.pac-li-div-two-p`)
*   `kbd_container`: Container for the keyboard hint keys (default: `.pac-kbd-container`)
*   `kbd_escape`: The `<kbd>` tag for the 'Esc' hint (default: `.pac-kbd-escape`)
*   `kbd_up`: The `<kbd>` tag for the 'Up Arrow' hint (default: `.pac-kbd-up`)
*   `kbd_down`: The `<kbd>` tag for the 'Down Arrow' hint (default: `.pac-kbd-down`)
*   `kbd_active`: Class applied to active keyboard hints (default: `.pac-kbd-active`)
*   `map_pin_icon`: SVG string for the map pin icon
*   `highlight`: The class applied to the `<span>` wrapping the matched text (default: `.pac-highlight`)

**Example - Using with Tailwind CSS:**

```javascript
const options = {
  classes: {
    input: 'w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500',
    ul: 'absolute mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto',
    li: 'px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer',
    li_current: 'bg-blue-500 text-white',
    highlight: 'font-semibold text-blue-700'
  }
};
```

**Example - Using with Custom CSS:**

```javascript
const options = {
  classes: {
    section: 'autocomplete-wrapper',
    input: 'search-input',
    ul: 'suggestions-list',
    li: 'suggestion-item',
    li_current: 'suggestion-item--active'
  }
};
```

## Events

*   **`onResponse`**: `(response: PlaceResult) => void`
    *   Fired after a user selects a suggestion and `fetchFields` are retrieved.
*   **`onError`**: `(error: string) => void`
    *   Fired on any error (API loading, fetching suggestions, etc.).

## TypeScript

This component is fully written in TypeScript with comprehensive type definitions.

### Available Imports

**Component:**
```typescript
import { PlaceAutocomplete } from 'places-autocomplete-svelte';
```

**Types and Interfaces:**
```typescript
import type { 
    PlaceResult,       // Place data returned from API
    ComponentOptions,  // UI and behavior configuration
    RequestParams,     // Autocomplete request parameters
    FormattedAddress,  // Standardised address structure
    ComponentClasses,  // CSS class overrides
    Props              // Component props
} from 'places-autocomplete-svelte/interfaces';
```

**Google Maps Loader Helpers:**
```typescript
import { 
    setGMapsContext,           // Create shared context
    getGMapsContext,           // Retrieve context
    hasGMapsContext,           // Check if context exists
    initialiseGMaps,           // Initialise with context
    initialiseGMapsNoContext,  // Initialise standalone
    importLibrary,             // Load Google Maps libraries
    type GMapsContext,         // Context type
    type APIOptions            // Loader options type
} from 'places-autocomplete-svelte/gmaps';
```

## Google Places API & Billing

*   This component uses the Google Maps JavaScript API (Places library). Usage is subject to Google's terms and pricing.
*   **Session Tokens** are used automatically to group Autocomplete requests, which can reduce costs.
*   Place Details requests (via `fetchFields`) are billed separately. **Only request the fields you need** to manage costs effectively.
*   For detailed pricing information, see [Google Maps Platform Pricing](https://developers.google.com/maps/documentation/javascript/usage-and-billing).

## Standalone JavaScript Library

Need this functionality for a non-Svelte project? Check out our companion vanilla JavaScript library:

**[places-autocomplete-js](https://github.com/alexpechkarev/places-autocomplete-js)** - Same core Google Places (New) Autocomplete features, framework-agnostic implementation.

## Contributing

Contributions are welcome! We appreciate bug reports, feature requests, and pull requests.

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## Author

**Alexander Pechkarev**
- GitHub: [@alexpechkarev](https://github.com/alexpechkarev)
- Email: alexpechkarev@gmail.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ❤️ using Svelte 5 and Google Maps Platform</sub>
</p>