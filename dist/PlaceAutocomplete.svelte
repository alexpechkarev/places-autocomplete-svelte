<script lang="ts">
	/**
	 * @fileoverview PlaceAutocomplete Component - Google Places Autocomplete for Svelte 5
	 * @author Alexander Pechkarev <alexpechkarev@gmail.com>
	 * @see https://github.com/alexpechkarev/places-autocomplete-svelte
	 * @version 1.0.0
	 * @license MIT
	 *
	 * A production-ready, accessible autocomplete component for Google Places API (New).
	 * Built with Svelte 5 runes for optimal reactivity and performance.
	 *
	 * @features
	 * - Full keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
	 * - Session token management for billing optimization
	 * - Debounced API requests to minimize costs
	 * - Customizable styling via CSS classes
	 * - Distance calculations from origin point
	 * - Text highlighting in suggestions
	 * - ARIA-compliant accessibility
	 * - Imperative API for programmatic control
	 *
	 *
	 * @publicMethods
	 * - `clear()` - Clears input and resets session
	 * - `focus()` - Focuses the input field
	 * - `getRequestParams()` - Returns current request parameters
	 * - `setRequestParams(params)` - Updates request parameters dynamically
	 * - `setFetchFields(fields)` - Updates Place Data Fields to fetch
	 * - `getFetchFields()` - Returns current fetch fields
	 * - `setInputValue(latitude, longitude)` - Finds and selects a place by coordinates
	 *
	 */

	import { onMount, untrack } from 'svelte';
	import type { PlaceResult, Props } from './interfaces.js';
	import {
		getGMapsContext,
		hasGMapsContext,
		importLibrary,
		initialiseGMapsNoContext,
		type GMapsContext
	} from './gmaps.js';
	import {
		validateOptions,
		validateRequestParams,
		formatDistance,
		validateFetchFields,
		createHighlightedSegments,
		debounce,
		ITINERARY_CATEGORIES,
		ITINERARY_SVG_ICONS
	} from './helpers.js';

	let gmaps: GMapsContext | undefined;
	// Get the context synchronously. This is safe.
	if (hasGMapsContext()) {
		gmaps = getGMapsContext();
	}

	let {
		/**
		 * Google Maps API key required for Places API usage.
		 * By default, uses SKU: Place Details (Location Only) - 0.005 USD per request.
		 * @see https://developers.google.com/maps/documentation/javascript/usage-and-billing#location-placedetails
		 */
		PUBLIC_GOOGLE_MAPS_API_KEY = '',
		fetchFields = ['addressComponents', 'formattedAddress'],
		options = {},
		onResponse = $bindable((response: PlaceResult) => {}),
		onError = $bindable((error: string) => {}),
		requestParams = {}
	}: Props = $props();

	const isDefaultOnResponse = onResponse.toString() === ((response: PlaceResult) => {}).toString();

	/**
	 * Create validated derived values that react to prop changes
	 */
	let validatedOptions = $derived(validateOptions(options));
	let validatedFetchFields = $derived(validateFetchFields(fetchFields));
	let validatedRequestParams = $derived(validateRequestParams(requestParams));

	/**
	 * Local variables
	 */
	let kbdAction = $state(''); // 'up', 'down', or 'escape'
	let inputRef: HTMLInputElement;
	let currentSuggestion = $state(-1);
	let results: any[] = $state([]);
	let placesApi: { [key: string]: any } = {};

	/**
	 * Initialise request state - will be synced with validated params in effect
	 */
	let request = $state<any>({ input: '' });
	//$inspect(request);

	/**
	 * Synchronizes the request object with validated request parameters while preserving the current input value.
	 * Uses untrack() to prevent reading request.input from creating a reactive dependency that would trigger the effect.
	 */
	$effect(() => {
		const currentInput = untrack(() => request.input);
		request = { ...validatedRequestParams, input: currentInput };
	});

	/**
	 * Clears the suggestions list when the input field is empty.
	 */
	$effect(() => {
		if (request.input == '') {
			results = [];
		}
	});

	/**
	 * Resets the search input and clears the suggestions list.
	 * Optionally populates the input with the formatted address of the selected place.
	 * @param {PlaceResult} [placeData] - Optional place data to populate the input field with.
	 * @private
	 */
	export const reset = (placeData?: PlaceResult) => {
		currentSuggestion = -1;
		if (validatedOptions?.clear_input == false) {
			if (placeData && placeData.formattedAddress) {
				// set input to formatted address
				request.input = placeData.formattedAddress;
			}
		} else {
			request.input = '';
		}
		results = [];
		setSessionToken();
		//console.log('reset completed', results);
	};

	/**
	 * Clears the autocomplete input field and suggestions list.
	 * Refreshes the Google Places session token to start a new autocomplete session.
	 * This method can be called imperatively on the component instance.
	 * @public
	 * @example
	 * let autocompleteComponent;
	 * autocompleteComponent.clear();
	 */
	export function clear() {
		currentSuggestion = -1;
		request.input = '';
		results = [];
		setSessionToken();
	}

	/**
	 * Programmatically sets focus to the autocomplete input element.
	 * @public
	 * @example
	 * autocompleteComponent.focus();
	 */
	export function focus() {
		inputRef?.focus();
	}

	/**
	 * Returns the current internal request parameters being used for API calls.
	 * Useful for debugging or inspecting the component's state.
	 * @public
	 * @returns {RequestParams} The current request parameters object.
	 */
	export function getRequestParams() {
		return validatedRequestParams;
	}

	/**
	 * Dynamically updates the request parameters used for Places API autocomplete calls.
	 * Useful for changing search criteria dynamically (e.g., region, language, or location bias).
	 * The provided parameters are merged with existing ones without replacing the entire object.
	 * @public
	 * @param {Partial<RequestParams>} params - Partial request parameters to merge with current settings.
	 * @example
	 * // Change region and language
	 * autocompleteComponent.setRequestParams({
	 *   region: 'FR',
	 *   language: 'fr',
	 *   includedRegionCodes: ['FR']
	 * });
	 *
	 * // Set origin for distance calculations
	 * autocompleteComponent.setRequestParams({
	 *   origin: { lat: 48.8566, lng: 2.3522 }
	 * });
	 */
	export function setRequestParams(params: Partial<typeof requestParams>) {
		validatedRequestParams = validateRequestParams({ ...requestParams, ...params });
	}

	/**
	 * Dynamically updates the Place Data Fields to fetch when a place is selected.
	 * Replaces the current fetch fields with the provided array.
	 * @public
	 * @param {string[]} fields - Array of Place Data Field names to fetch (e.g., 'displayName', 'types', 'location').
	 * @see https://developers.google.com/maps/documentation/javascript/place-data-fields
	 * @example
	 * autocompleteComponent.setFetchFields(['displayName', 'types', 'location']);
	 */
	export function setFetchFields(fields: string[]) {
		validatedFetchFields = validateFetchFields(fields);
	}

	/**
	 * Returns the current array of Place Data Fields that will be requested when a place is selected.
	 * @public
	 * @returns {string[]} Array of current Place Data Field names.
	 * @example
	 * const fields = autocompleteComponent.getFetchFields();
	 * console.log('Current fields:', fields);
	 */
	export function getFetchFields(): string[] {
		return validatedFetchFields;
	}

	/**
	 * Dynamically updates the component's configuration options.
	 * Merges the provided options with existing settings.
	 * @public
	 * @param options - Partial options object to update component behavior and appearance.
	 * @example
	 * // Update options to change placeholder and enable distance display
	 * autocompleteComponent.setOptions({
	 *   placeholder: 'Enter a location',
	 *   showDistance: true
	 * });
	 */
	export function setOptions(options: typeof validatedOptions) {
		validatedOptions = validateOptions(options);
	}

	/**
	 * Returns the current validated options used by the component.
	 * Useful for inspecting configuration settings.
	 * @public
	 * @returns {typeof validatedOptions} The current validated options object.
	 * @example
	 * const options = autocompleteComponent.getOptions();
	 * console.log('Current options:', options);
	 */
	export function getOptions(): typeof validatedOptions {
		return validatedOptions;
	}

	/**
	 * Sets the input value by finding and selecting a place for the given coordinates.
	 * Performs reverse geocoding to convert latitude/longitude to a place, then fetches
	 * place details and triggers the onResponse callback.
	 * @public
	 * @param {number} latitude - The latitude coordinate of the location.
	 * @param {number} longitude - The longitude coordinate of the location.
	 * @returns {Promise<void>} A promise that resolves when the place has been found and selected.
	 * @throws {Error} If the geocoding fails or no place is found for the coordinates.
	 * @example
	 * // Set input to a specific location (e.g., Eiffel Tower)
	 * await autocompleteComponent.setInputValue(48.8584, 2.2945);
	 */
	export async function setInputValue(latitude: number, longitude: number): Promise<void> {
		try {
			// Ensure placesApi is loaded
			if (!placesApi.AutocompleteSuggestion) {
				throw new Error('Places API not loaded yet. Please wait for component initialisation.');
			}

			// Import the geocoding library
			const { Geocoder } = await importLibrary('geocoding');
			const geocoder = new Geocoder();

			// Perform reverse geocoding
			const response = await geocoder.geocode({
				location: { lat: latitude, lng: longitude }
			});

			if (!response.results || response.results.length === 0) {
				throw new Error('No place found for the given coordinates.');
			}

			// Get the first result (most specific)
			const geocodeResult = response.results[0];

			// Import the Place class to create a Place object from the place ID
			const { Place } = await importLibrary('places');
			const place = new Place({
				id: geocodeResult.place_id
			});

			// Fetch the place details with the configured fields
			await place.fetchFields({
				fields: validatedFetchFields
			});

			// Convert to JSON format
			const placeData = place.toJSON() as PlaceResult;

			// Reset search input and results
			reset(placeData);

			// Trigger the onResponse callback
			onResponse(placeData);
		} catch (e: any) {
			// Handle errors
			onError(
				(e.name || 'An error occurred') +
					' - ' +
					(e.message || 'error setting input value from coordinates')
			);
			throw e;
		}
	}

	/**
	 * Extracts a specific address component from the place response.
	 * @private
	 * @param {Object} response - The place response object containing address components.
	 * @param {string} type - The address component type to find (e.g., 'locality', 'country').
	 * @returns {string} The long text of the address component, or an empty string if not found.
	 */
	const getAddressComponent = (response: { addressComponents: any[] }, type: string) =>
		response.addressComponents?.find((c: { types: string | string[] }) => c.types.includes(type))
			?.longText || '';

	/**
	 * Fetches autocomplete suggestions from the Google Places API based on user input.
	 * @private
	 * @param {string} inputValue - The user's input text to search for.
	 * @returns {Promise<void>}
	 */
	const makeAcRequest = async (inputValue: string) => {
		if (inputValue === '') {
			request.input = '';
			results = [];
			return;
		}
		if (request.inputOffset && request.inputOffset >= inputValue.length) {
			return;
		}

		// User input
		request.input = inputValue;

		//console.log(request.input);

		try {
			// Ensure placesApi is loaded
			if (!placesApi.AutocompleteSuggestion) {
				console.warn('Places API not loaded yet.');
				return;
			}
			const { suggestions } =
				await placesApi.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

			// Clear previous results
			results = [];

			// Iterate over suggestions and add results to an array
			for (const suggestion of suggestions) {
				// get prediction text
				//console.log(suggestion.placePrediction.secondaryText);
				let place = suggestion.placePrediction.toPlace();

				const predictionText = suggestion.placePrediction.mainText;
				const originalText = predictionText.text;
				const secondaryText = suggestion.placePrediction?.secondaryText?.text ?? '';
				// Extract match positions (array of objects with startOffset, endOffset)
				const matches = predictionText.matches;

				// Apply highlighting logic to matched text segments
				let highlightedText: { text: string; highlighted: boolean }[] = [];

				// Sort matches just in case they aren't ordered (though they usually are)
				matches.sort(
					(a: { startOffset: number }, b: { startOffset: number }) => a.startOffset - b.startOffset
				);

				// Create highlighted segments
				highlightedText = createHighlightedSegments(originalText, matches);
				//console.log(suggestion.placePrediction.types);

				// Extract the types array for cleaner code
				const types = suggestion.placePrediction.types;
				let placeType = {
					icon: '',
					label: ''
				};

				if (validatedOptions.show_place_type) {
					if (Array.isArray(types) && types.length > 0) {
						// Look through the array until we find a type we actually recognize
						const matchedType = types.find(
							(type: string) => typeof type === 'string' && type in ITINERARY_CATEGORIES
						);

						// If we found a match, get its label; otherwise, use 'Default'
						const categoryLabel = matchedType
							? ITINERARY_CATEGORIES[matchedType as keyof typeof ITINERARY_CATEGORIES]
							: 'Default';

						placeType = {
							icon: ITINERARY_SVG_ICONS[categoryLabel as keyof typeof ITINERARY_SVG_ICONS] || '',
							label: categoryLabel
						};
					}
				}

				results.push({
					place: place,
					mainText: highlightedText,
					secondaryText: secondaryText,
					distance: formatDistance(
						suggestion.placePrediction.distanceMeters,
						validatedOptions.distance_units ?? 'km'
					),
					placeType: placeType
				});
			}
			//console.log('Autocomplete suggestions:', results);
		} catch (e: any) {
			onError((e.name || 'An error occurred') + ' - ' + (e.message || 'see console for details.'));
		}
	};

	/**
	 * Debounced version of makeAcRequest that delays API calls to reduce request frequency.
	 * The debounce delay is reactive and updates when the validatedOptions.debounce value changes.
	 * @private
	 */
	const debouncedMakeAcRequest = $derived(
		debounce(makeAcRequest, validatedOptions?.debounce ?? 100)
	);

	/**
	 * Handles the selection of an autocomplete suggestion.
	 * Fetches detailed place data and invokes the onResponse callback.
	 * @private
	 * @param {Object} place - The selected place object from the autocomplete suggestion.
	 * @returns {Promise<void>}
	 * @see https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteSuggestion
	 */
	const onPlaceSelected = async (place: {
		fetchFields: (arg0: { fields: string[] }) => any;
		toJSON: () => any;
	}): Promise<void> => {
		try {
			await place.fetchFields({
				fields: validatedFetchFields
			});
			// return place as json or full place class instance
			let placeData = validatedOptions.response_type === 'json' ? place.toJSON() : place;
			// reset search input and results
			reset(placeData);
			onResponse(placeData);
		} catch (e: any) {
			// reset search input and results
			reset();
			onError(
				(e.name || 'An error occurred') + ' - ' + (e.message || 'error fetching place details')
			);
		}
	};

	/**
	 * Initializes a new Google Places autocomplete session token.
	 * Session tokens group autocomplete and place details requests for billing optimization.
	 * @private
	 * @see https://developers.google.com/maps/documentation/javascript/place-autocomplete#session_tokens
	 */
	const setSessionToken = () => {
		try {
			request.sessionToken = new placesApi.AutocompleteSessionToken();
		} catch (e: any) {
			onError((e.name || 'An error occurred') + ' - ' + (e.message || 'error fetch token'));
		}
	};

	/**
	 * Initializes the Google Maps JavaScript API and Places library.
	 * Loads required APIs, validates configuration, and sets up the autocomplete session.
	 * @private
	 */
	onMount(async (): Promise<void> => {
		if (isDefaultOnResponse) {
			console.warn(
				'[PlaceAutocomplete] No onResponse callback provided. Place selection events will not be handled. Please provide an onResponse function to handle place selections. See: https://places-autocomplete-svelte.uk/docs'
			);
		}
		if (validatedOptions.autofocus) {
			// focus on the input
			inputRef.focus();
		}

		try {
			// Await the promise that was stored in the context by the parent.
			// If the parent has already finished, this resolves immediately.
			// If the parent is still loading, this will wait.
			if (typeof gmaps !== 'undefined' && gmaps) {
				await gmaps?.initialisationPromise;
			} else {
				// Check if the API key is provided
				if (PUBLIC_GOOGLE_MAPS_API_KEY === '' || !PUBLIC_GOOGLE_MAPS_API_KEY) {
					throw new Error('Google Maps API key is required. Please provide a valid API key.');
				}

				// No context available, initialize without context
				// This will load the Google Maps script
				// and set up the necessary objects
				// for places API usage.
				await initialiseGMapsNoContext({ key: PUBLIC_GOOGLE_MAPS_API_KEY, v: 'weekly' });
			}

			const { AutocompleteSessionToken, AutocompleteSuggestion } = await importLibrary('places');

			placesApi.AutocompleteSessionToken = AutocompleteSessionToken;
			placesApi.AutocompleteSuggestion = AutocompleteSuggestion;

			setSessionToken();
		} catch (e: any) {
			console.log(e);
			onError(
				(e.name || 'An error occurred') + ' - ' + (e.message || 'Error loading Google Maps API')
			);
		}
	});
	/**
	 * Handles keyboard navigation within the autocomplete suggestions list.
	 * Supports ArrowUp, ArrowDown, Enter, and Escape keys for navigation and selection.
	 * @private
	 * @param {KeyboardEvent} e - The keyboard event object.
	 */
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			currentSuggestion = Math.min(currentSuggestion + 1, results.length - 1);
			kbdAction = 'down';
		} else if (e.key === 'ArrowUp') {
			currentSuggestion = Math.max(currentSuggestion - 1, 0);
			kbdAction = 'up';
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (currentSuggestion >= 0) {
				onPlaceSelected(results[currentSuggestion].place);
			}
		} else if (e.key === 'Escape') {
			kbdAction = 'escape';
			request.input = '';
			reset();
		}
		// Optional: Scroll suggestion into view
		const selectedElement = document.getElementById(`option-${currentSuggestion + 1}`);
		selectedElement?.scrollIntoView({ block: 'nearest' });
		// Reset the action state after a short delay to allow CSS transition to finish
		setTimeout(() => {
			kbdAction = '';
		}, 300);
	}

	/**
	 * Handles click events outside the input element to close the suggestions list.
	 * Resets the search input and clears results when clicking outside the component.
	 * @private
	 * @param {MouseEvent} event - The mouse event object.
	 */
	function handleClickOutside(event: MouseEvent) {
		if (inputRef && !inputRef.contains(event.target as Node)) {
			reset();
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<section
	class={validatedOptions.classes?.section}
	role="combobox"
	aria-controls="autocomplete-listbox"
	tabindex="0"
	aria-haspopup="listbox"
	aria-expanded={results.length > 0}
	aria-owns="autocomplete-listbox"
>
	{#if validatedOptions?.label ?? ''}
		<label for="places-autocomplete-input" class={validatedOptions.classes?.label ?? ''}>
			{validatedOptions.label}
		</label>
	{/if}
	<div class={validatedOptions.classes?.container ?? ''}>
		{#if validatedOptions.classes?.icon}
			<div class={validatedOptions.classes.icon_container}>
				{@html validatedOptions.classes.icon}
			</div>
		{/if}

		<input
			id="places-autocomplete-input"
			type="text"
			name="search"
			bind:this={inputRef}
			class={validatedOptions.classes?.input ?? ''}
			placeholder={validatedOptions.placeholder}
			autocomplete={validatedOptions.autocomplete}
			aria-controls="options"
			aria-autocomplete="list"
			aria-owns="options"
			aria-labelledby="search"
			aria-label="Search"
			aria-haspopup="listbox"
			aria-activedescendant={currentSuggestion > -1 ? `option-${currentSuggestion + 1}` : undefined}
			bind:value={request.input}
			onkeydown={onKeyDown}
			oninput={(event) => debouncedMakeAcRequest(event.currentTarget.value)}
		/>
		<!-- oninput={makeAcRequest} -->

		{#if results.length > 0}
			<div class={validatedOptions.classes?.kbd_container ?? ''}>
				<kbd
					class="{validatedOptions.classes?.kbd_escape ?? ''} {kbdAction === 'escape'
						? (validatedOptions.classes?.kbd_active ?? '')
						: ''}">Esc</kbd
				>
				<kbd
					class="{validatedOptions.classes?.kbd_up ?? ''} {kbdAction === 'up'
						? (validatedOptions.classes?.kbd_active ?? '')
						: ''}">&uArr;</kbd
				>
				<kbd
					class="{validatedOptions.classes?.kbd_down ?? ''} {kbdAction === 'down'
						? (validatedOptions.classes?.kbd_active ?? '')
						: ''}"
				>
					&dArr;</kbd
				>
			</div>
			<ul class={validatedOptions.classes?.ul ?? ''} id="autocomplete-listbox" role="listbox">
				{#each results as p, i}
					<li
						role="option"
						aria-selected={i === currentSuggestion}
						class={[
							validatedOptions.classes?.li ?? '',
							i === currentSuggestion && validatedOptions.classes?.li_current
						]}
						onmouseenter={() => (currentSuggestion = i)}
						id="option-{i + 1}"
					>
						<button
							type="button"
							class={[
								validatedOptions.classes?.li_button,
								i === currentSuggestion && validatedOptions.classes?.li_button_current
							]}
							onclick={() => onPlaceSelected(p.place)}
						>
							<div class={[validatedOptions.classes?.li_div_container ?? '']}>
								<div
									class={[
										validatedOptions.classes?.li_div_one ?? '',
										i === currentSuggestion && validatedOptions.classes?.li_div_current
									]}
								>
									{#if validatedOptions.classes?.map_pin_icon}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="size-5 shrink-0">{@html validatedOptions.classes.map_pin_icon}</svg
										>
									{/if}

									<div class={[validatedOptions.classes?.li_div_p_container ?? '']}>
										<p
											class={[
												i === currentSuggestion && validatedOptions.classes?.li_current,
												validatedOptions.classes?.li_div_one_p
											]}
										>
											{#each p.mainText as segment}
												{#if segment.highlighted}
													<span class={validatedOptions.classes?.highlight ?? 'font-bold'}
														>{segment.text}</span
													>
												{:else}
													{segment.text}
												{/if}
											{/each}
										</p>
										<p
											class={[
												i === currentSuggestion && validatedOptions.classes?.li_current,
												validatedOptions.classes?.li_div_one_p_secondaryText
											]}
										>
											{p.secondaryText}
										</p>
									</div>
								</div>
							</div>
							{#if validatedOptions.distance && p.distance && !validatedOptions.show_place_type}
								<div class={[validatedOptions.classes?.li_div_two]}>
									<p
										class={[
											i === currentSuggestion && validatedOptions.classes?.li_current,
											validatedOptions.classes?.li_div_two_p
										]}
									>
										{p.distance}
									</p>
								</div>
							{/if}
							{#if validatedOptions.show_place_type && p.placeType && !validatedOptions.distance}
								<div class={[validatedOptions.classes?.li_div_two]}>
									<div
										class={[
											i === currentSuggestion && validatedOptions.classes?.li_current,
											validatedOptions.classes?.li_div_two_p_place_type
										]}
									>
										<div
											class={[
												i === currentSuggestion && validatedOptions.classes?.li_current,
												validatedOptions.classes?.li_div_two_p_place_type_icon
											]}
										>
											{@html p.placeType.icon}
										</div>
										<div
											class={[
												i === currentSuggestion && validatedOptions.classes?.li_current,
												validatedOptions.classes?.li_div_two_p_place_type_label
											]}
										>
											{p.placeType.label}
										</div>
									</div>
								</div>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
  /* 
    Svelte automatically scopes all these classes to this specific component
    by appending a hash (e.g., .pac-section.svelte-xyz123). 
    No styles or variables will leak outside this file.
  */

  .pac-section {
    width: 100%;
  }

  .pac-container {
    z-index: 10;
    margin-top: calc(var(--spacing, 0.25rem) * 1);
    border-radius: var(--radius-lg, 0.5rem);
    position: relative;
  }

  .pac-icon-container {
    pointer-events: none;
    inset-block: 0;
    left: 0;
    padding-left: calc(var(--spacing, 0.25rem) * 3);
    align-items: center;
    display: flex;
    position: absolute;
  }

  .pac-input {
    border-radius: var(--radius-md, 0.375rem);
    border: 1px solid var(--color-gray-300, #d2d6dc);
    background-color: var(--color-gray-100, #f3f4f6);
    width: 100%;
    padding-inline: calc(var(--spacing, 0.25rem) * 4);
    padding-block: calc(var(--spacing, 0.25rem) * 2.5);
    padding-right: calc(var(--spacing, 0.25rem) * 20);
    padding-left: calc(var(--spacing, 0.25rem) * 10);
    color: var(--color-gray-900, #111827);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    outline: none;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .pac-input:focus {
    border-color: var(--color-indigo-500, #6366f1);
    box-shadow: 
      0 0 0 2px var(--color-indigo-500, #6366f1),
      0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  @media (min-width: 40rem) {
    .pac-input {
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-tight, 1.25);
    }
  }

  .pac-kbd-container {
    inset-block: 0;
    right: 0;
    padding-block: calc(var(--spacing, 0.25rem) * 1.5);
    padding-right: calc(var(--spacing, 0.25rem) * 1.5);
    display: flex;
    position: absolute;
    align-content: center;
    align-items: center;
    flex-wrap: wrap;
    flex-direction: row;
  }

  .pac-kbd-escape, .pac-kbd-up, .pac-kbd-down {
    border-radius: var(--radius-sm, 0.25rem);
    border: 1px solid var(--color-gray-300, #d2d6dc);
    padding-inline: calc(var(--spacing, 0.25rem) * 1);
    font-family: var(--font-sans, ui-sans-serif, system-ui, -apple-system, sans-serif);
    font-size: var(--text-xs, 0.75rem);
    line-height: var(--leading-tight, 1.25);
    color: var(--color-gray-500, #6b7280);
    align-items: center;
    display: inline-flex;
  }

  .pac-kbd-escape {
    margin-right: calc(var(--spacing, 0.25rem) * 1);
    width: calc(var(--spacing, 0.25rem) * 8);
  }

  .pac-kbd-up, .pac-kbd-down {
    width: calc(var(--spacing, 0.25rem) * 6);
    justify-content: center;
  }

  .pac-kbd-down {
    border-color: var(--color-gray-400, #9ca3af);
  }

  .pac-kbd-active {
    background-color: var(--color-indigo-500, #6366f1);
    color: var(--color-white, #ffffff);
  }

  .pac-ul {
    z-index: 50;
    margin-top: calc(var(--spacing, 0.25rem) * 1);
    margin-bottom: calc(var(--spacing, 0.25rem) * -2);
    max-height: calc(var(--spacing, 0.25rem) * 60);
    width: 100%;
    list-style-type: none;
    position: absolute;
    border-radius: var(--radius-md, 0.375rem);
    background-color: var(--color-white, #ffffff);
    padding: 0;
    font-size: var(--text-base, 1rem);
    line-height: var(--leading-normal, 1.5);
    overflow: auto;
    outline: none;
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.1), 
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-gray-200, #e5e7eb);
  }

  .pac-ul > :not(:last-child) {
    border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
  }

  @media (min-width: 40rem) {
    .pac-ul {
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-tight, 1.25);
    }
  }

  .pac-li {
    cursor: default;
    padding-inline: calc(var(--spacing, 0.25rem) * 2);
    padding-block: calc(var(--spacing, 0.25rem) * 2);
    color: var(--color-gray-900, #111827);
    -webkit-user-select: none;
       -moz-user-select: none;
            user-select: none;
  }

  @media (hover: hover) {
    .pac-li:hover {
      background-color: var(--color-indigo-500, #6366f1);
      color: var(--color-white, #ffffff);
    }
  }

  @media (min-width: 64rem) {
    .pac-li {
      padding-inline: calc(var(--spacing, 0.25rem) * 4);
    }
  }

  .pac-li-button {
    width: 100%;
    color: inherit;
    text-decoration: inherit;
    font: inherit;
    cursor: pointer;
    background: transparent;
    border: none;
    justify-content: space-between;
    padding: 0;
    display: flex;
  }

  .pac-li-div-container {
    justify-content: space-between;
    align-items: center;
    width: 100%;
    display: flex;
  }

  .pac-li-div-container p {
    margin: 0;
  }

  .pac-li-div-one {
    min-width: 0;
    align-items: center;
    -moz-column-gap: calc(var(--spacing, 0.25rem) * 3);
         column-gap: calc(var(--spacing, 0.25rem) * 3);
    flex: auto;
    display: flex;
  }

  .pac-map-icon-svg {
    height: calc(var(--spacing, 0.25rem) * 6);
    width: calc(var(--spacing, 0.25rem) * 6);
    flex-shrink: 0;
  }

  .pac-li-div-p-container {
    min-height: calc(var(--spacing, 0.25rem) * 10);
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    display: flex;
  }

  .pac-li-div-one-p {
    font-size: var(--text-sm, 0.875rem);
    line-height: calc(var(--spacing, 0.25rem) * 4);
  }

  .pac-li-div-one-p-secondaryText {
    font-size: var(--text-xs, 0.75rem);
    line-height: calc(var(--spacing, 0.25rem) * 4);
    text-align: left;
  }

  .pac-li-current {
    background-color: var(--color-indigo-500, #6366f1);
    color: var(--color-white, #ffffff);
    text-decoration: inherit;
  }

  .pac-li-button-current {
    color: var(--color-white, #ffffff);
  }

  .pac-li-div-two {
    min-width: calc(var(--spacing, 0.25rem) * 16);
    flex-direction: column;
    flex-shrink: 0;
    align-items: flex-end;
    display: flex;
  }

  .pac-li-div-two-p {
    font-size: var(--text-xs, 0.75rem);
    line-height: var(--leading-tight, 1.25);
  }

  .pac-li-div-two-p-place_type {
    font-size: var(--text-xs, 0.75rem);
    line-height: var(--leading-tight, 1.25);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    gap: 0.5rem;
  }

  .pac-li-div-two-p-place_type-icon {
    flex-shrink: 0;
  }

  .pac-li-div-two-p-place_type-label {
    display: none;
  }

  @media (min-width: 48rem) {
    .pac-li-div-two-p-place_type {
      font-size: var(--text-xs, 0.75rem);
      line-height: var(--leading-tight, 1.25);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      min-width: 120px;
      gap: 0.5rem;
    }
    .pac-li-div-two-p-place_type-label {
      display: inline;
    }
  }

  .pac-highlight {
    font-weight: var(--font-weight-bold, 700);
  }
</style>
