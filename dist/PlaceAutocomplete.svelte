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
		debounce
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
	const validatedOptions = $derived(validateOptions(options));
	const validatedFetchFields = $derived(validateFetchFields(fetchFields));
	const validatedRequestParams = $derived(validateRequestParams(requestParams));

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
	const reset = (placeData?: PlaceResult) => {
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
		return request;
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
		requestParams = { ...requestParams, ...params };
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
		fetchFields = fields;
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
		return fetchFields;
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
	 * Constructs the secondary text for autocomplete suggestions from address components.
	 * Combines locality, administrative area, country, and postal code into a formatted string.
	 * @private
	 * @param {Object} place - The place object containing address components.
	 * @returns {string} Formatted secondary text (e.g., "Paris, Île-de-France, France, 75001").
	 */
	const getSecondaryText = (place: { addressComponents: any[] }) => {
		const locality = getAddressComponent(place, 'locality');
		const adminArea = getAddressComponent(place, 'administrative_area_level_1');
		const postalCode = getAddressComponent(place, 'postal_code');
		const country = getAddressComponent(place, 'country');

		let components = [locality, adminArea, country, postalCode].filter(Boolean);
		return components.join(', ');
	};

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
				//console.log(suggestion.placePrediction.toPlace());
				let place = suggestion.placePrediction.toPlace();
				await place.fetchFields({ fields: ['addressComponents'] });

				const predictionText = suggestion.placePrediction.mainText;
				const originalText = predictionText.text;
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

				results.push({
					place: place,
					mainText: highlightedText,
					secondaryText: getSecondaryText(place),
					distance: formatDistance(
						suggestion.placePrediction.distanceMeters,
						validatedOptions.distance_units ?? 'km'
					)
				});
			}
			//console.log('Autocomplete suggestions:', results);
		} catch (e: any) {
			onError((e.name || 'An error occurred') + ' - ' + (e.message || 'see console for details.'));
		}
	};

	/**
	 * Debounced version of makeAcRequest that delays API calls to reduce request frequency.
	 * The debounce delay is reactive and updates when the options.debounce value changes.
	 * @private
	 */
	const debouncedMakeAcRequest = $derived(debounce(makeAcRequest, options?.debounce ?? 100));

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
			// console.log(place);
			// console.log(validatedFetchFields);
			await place.fetchFields({
				fields: validatedFetchFields
			});
			let placeData = place.toJSON();
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
				'PlaceAutocomplete: The `onResponse` callback has not been provided. Selected place data will not be handled. See documentation for usage.'
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
				await gmaps?.initializationPromise;
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
											class="size-5">{@html validatedOptions.classes.map_pin_icon}</svg
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
							{#if validatedOptions.distance && p.distance}
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
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	/* Component styles */
	@layer properties {
		@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or
			((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
			*,
			:before,
			:after,
			::backdrop {
				--tw-rotate-x: initial;
				--tw-rotate-y: initial;
				--tw-rotate-z: initial;
				--tw-skew-x: initial;
				--tw-skew-y: initial;
				--tw-border-style: solid;
				--tw-shadow: 0 0 #0000;
				--tw-shadow-color: initial;
				--tw-shadow-alpha: 100%;
				--tw-inset-shadow: 0 0 #0000;
				--tw-inset-shadow-color: initial;
				--tw-inset-shadow-alpha: 100%;
				--tw-ring-color: initial;
				--tw-ring-shadow: 0 0 #0000;
				--tw-inset-ring-color: initial;
				--tw-inset-ring-shadow: 0 0 #0000;
				--tw-ring-inset: initial;
				--tw-ring-offset-width: 0px;
				--tw-ring-offset-color: #fff;
				--tw-ring-offset-shadow: 0 0 #0000;
				--tw-divide-y-reverse: 0;
				--tw-font-weight: initial;
			}
		}
	}
	:root,
	:host {
		--font-sans:
			ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
		--font-mono:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		-webkit-text-size-adjust: 100%;
		-moz-tab-size: 4;
		  -o-tab-size: 4;
		     tab-size: 4;
		line-height: 1.5;
		font-family: var(
			--default-font-family,
			ui-sans-serif,
			system-ui,
			sans-serif,
			'Apple Color Emoji',
			'Segoe UI Emoji',
			'Segoe UI Symbol',
			'Noto Color Emoji'
		);
		font-feature-settings: var(--default-font-feature-settings, normal);
		font-variation-settings: var(--default-font-variation-settings, normal);
		-webkit-tap-highlight-color: transparent;
		--color-red-50: #fef2f2;
		--color-red-300: #fca5a5;
		--color-red-400: #f87171;
		--color-red-500: #ef4444;
		--color-red-600: #dc2626;
		--color-red-700: #b91c1c;
		--color-red-800: #991b1b;
		--color-green-50: #f0fdf4;
		--color-green-100: #dcfce7;
		--color-green-200: #bbf7d0;
		--color-green-300: #86efac;
		--color-green-400: #4ade80;
		--color-green-800: #166534;
		--color-emerald-300: #6ee7b7;
		--color-emerald-400: #34d399;
		--color-emerald-500: #10b981;
		--color-emerald-600: #059669;
		--color-emerald-700: #047857;
		--color-sky-300: #7dd3fc;
		--color-sky-400: #38bdf8;
		--color-sky-500: #0ea5e9;
		--color-sky-600: #0284c7;
		--color-indigo-400: #818cf8;
		--color-indigo-500: #6366f1;
		--color-indigo-600: #4f46e5;
		--color-violet-300: #c4b5fd;
		--color-pink-300: #f9a8d4;
		--color-slate-50: oklch(98.4% 0.003 247.858);
		--color-slate-200: oklch(92.9% 0.013 255.508);
		--color-slate-300: oklch(86.9% 0.022 252.894);
		--color-slate-400: oklch(70.4% 0.04 256.788);
		--color-slate-500: oklch(55.4% 0.046 257.417);
		--color-slate-600: oklch(44.6% 0.043 257.281);
		--color-slate-700: oklch(37.2% 0.044 257.287);
		--color-slate-800: oklch(27.9% 0.041 260.031);
		--color-slate-900: oklch(20.8% 0.042 265.755);
		--color-gray-50: #f9fafb;
		--color-gray-100: #f4f5f7;
		--color-gray-200: #e5e7eb;
		--color-gray-300: #d2d6dc;
		--color-gray-400: #9fa6b2;
		--color-gray-500: #6b7280;
		--color-gray-600: #4b5563;
		--color-gray-700: #374151;
		--color-gray-800: #1f2937;
		--color-gray-900: #111827;
		--color-zinc-50: #f9fafb;
		--color-zinc-100: #f4f5f7;
		--color-zinc-200: #e5e7eb;
		--color-zinc-300: #d2d6dc;
		--color-zinc-400: #9fa6b2;
		--color-zinc-500: #6b7280;
		--color-zinc-600: #4b5563;
		--color-zinc-700: #374151;
		--color-zinc-800: #1f2937;
		--color-zinc-900: #111827;
		--color-black: #000;
		--color-white: #fff;
		--spacing: 0.25rem;
		--container-md: 28rem;
		--container-lg: 33rem;
		--container-2xl: 40rem;
		--text-xs: 0.8125rem;
		--text-xs--line-height: 1.5rem;
		--text-sm: 0.875rem;
		--text-sm--line-height: 1.5rem;
		--text-base: 1rem;
		--text-base--line-height: 1.75rem;
		--text-lg: 1.125rem;
		--text-lg--line-height: 1.75rem;
		--text-xl: 1.25rem;
		--text-xl--line-height: 1.75rem;
		--text-2xl: 1.5rem;
		--text-2xl--line-height: 2rem;
		--text-4xl: 2.25rem;
		--text-4xl--line-height: 2.5rem;
		--text-5xl: 3rem;
		--text-5xl--line-height: 1;
		--font-weight-normal: 400;
		--font-weight-medium: 500;
		--font-weight-semibold: 600;
		--font-weight-bold: 700;
		--font-weight-extrabold: 800;
		--tracking-tight: -0.025em;
		--leading-tight: 1.25;
		--radius-sm: 0.25rem;
		--radius-md: 0.375rem;
		--radius-lg: 0.5rem;
		--radius-xl: 0.75rem;
		--radius-2xl: 1rem;
		--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
		--animate-spin: spin 1s linear infinite;
		--blur-xs: 4px;
		--blur-sm: 8px;
		--default-transition-duration: 0.15s;
		--default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		--default-font-family: var(--font-sans);
		--default-mono-font-family: var(--font-mono);
		--color-primary-500: #fe795d;
	}
	.pac-section {
		width: 100%;
	}
	.pac-container {
		z-index: 10;
		margin-top: calc(var(--spacing, 0.25rem) * 1);
		transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,)
			var(--tw-skew-y,);
		border-radius: var(--radius-lg, 0.5rem);
		position: relative;
	}
	.pac-icon-container {
		pointer-events: none;
		inset-block: calc(var(--spacing, 0.25rem) * 0);
		left: calc(var(--spacing, 0.25rem) * 0);
		padding-left: calc(var(--spacing, 0.25rem) * 3);
		align-items: center;
		display: flex;
		position: absolute;
	}
	.pac-input {
		border-radius: var(--radius-md, 0.375rem);
		border-style: var(--tw-border-style);
		background-color: var(--color-gray-100, oklch(96.7% 0.003 264.542));
		width: 100%;
		padding-inline: calc(var(--spacing, 0.25rem) * 4);
		padding-block: calc(var(--spacing, 0.25rem) * 2.5);
		padding-right: calc(var(--spacing, 0.25rem) * 20);
		padding-left: calc(var(--spacing, 0.25rem) * 10);
		color: var(--color-gray-900, oklch(21% 0.034 264.665));
		--tw-shadow:
			0 1px 3px 0 var(--tw-shadow-color, #0000001a),
			0 1px 2px -1px var(--tw-shadow-color, #0000001a);
		--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width))
			var(--tw-ring-color, currentcolor);
		box-shadow:
			var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
			var(--tw-ring-shadow), var(--tw-shadow);
		--tw-ring-color: var(--color-gray-300, oklch(87.2% 0.01 258.338));
		--tw-ring-inset: inset;
		border-width: 1px;
	}
	.pac-input:focus {
		--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width))
			var(--tw-ring-color, currentcolor);
		box-shadow:
			var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
			var(--tw-ring-shadow), var(--tw-shadow);
	}
	@media (min-width: 40rem) {
		.pac-input {
			font-size: var(--text-sm, 0.875rem);
			line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
		}
	}
	.pac-kbd-container {
		inset-block: calc(var(--spacing, 0.25rem) * 0);
		right: calc(var(--spacing, 0.25rem) * 0);
		padding-block: calc(var(--spacing, 0.25rem) * 1.5);
		padding-right: calc(var(--spacing, 0.25rem) * 1.5);
		display: flex;
		position: absolute;
	}
	.pac-kbd-escape {
		margin-right: calc(var(--spacing, 0.25rem) * 1);
		width: calc(var(--spacing, 0.25rem) * 8);
		border-radius: var(--radius-sm, 0.25rem);
		border-style: var(--tw-border-style);
		border-width: 1px;
		border-color: var(--color-gray-300, oklch(87.2% 0.01 258.338));
		padding-inline: calc(var(--spacing, 0.25rem) * 1);
		font-family: var(
			--font-sans,
			ui-sans-serif,
			system-ui,
			sans-serif,
			'Apple Color Emoji',
			'Segoe UI Emoji',
			'Segoe UI Symbol',
			'Noto Color Emoji'
		);
		font-size: var(--text-xs, 0.75rem);
		line-height: var(--tw-leading, var(--text-xs--line-height, calc(1 / 0.75)));
		color: var(--color-gray-500, oklch(55.1% 0.027 264.364));
		align-items: center;
		display: inline-flex;
	}
	.pac-kbd-up {
		width: calc(var(--spacing, 0.25rem) * 6);
		border-radius: var(--radius-sm, 0.25rem);
		border-style: var(--tw-border-style);
		border-width: 1px;
		border-color: var(--color-gray-300, oklch(87.2% 0.01 258.338));
		padding-inline: calc(var(--spacing, 0.25rem) * 1);
		font-family: var(
			--font-sans,
			ui-sans-serif,
			system-ui,
			sans-serif,
			'Apple Color Emoji',
			'Segoe UI Emoji',
			'Segoe UI Symbol',
			'Noto Color Emoji'
		);
		font-size: var(--text-xs, 0.75rem);
		line-height: var(--tw-leading, var(--text-xs--line-height, calc(1 / 0.75)));
		color: var(--color-gray-500, oklch(55.1% 0.027 264.364));
		justify-content: center;
		align-items: center;
		display: inline-flex;
	}
	.pac-kbd-down {
		width: calc(var(--spacing, 0.25rem) * 6);
		border-radius: var(--radius-sm, 0.25rem);
		border-style: var(--tw-border-style);
		border-width: 1px;
		border-color: var(--color-gray-400, oklch(70.7% 0.022 261.325));
		padding-inline: calc(var(--spacing, 0.25rem) * 1);
		font-family: var(
			--font-sans,
			ui-sans-serif,
			system-ui,
			sans-serif,
			'Apple Color Emoji',
			'Segoe UI Emoji',
			'Segoe UI Symbol',
			'Noto Color Emoji'
		);
		font-size: var(--text-xs, 0.75rem);
		line-height: var(--tw-leading, var(--text-xs--line-height, calc(1 / 0.75)));
		color: var(--color-gray-500, oklch(55.1% 0.027 264.364));
		justify-content: center;
		align-items: center;
		display: inline-flex;
	}
	.pac-kbd-active {
		background-color: var(--color-indigo-500, oklch(58.5% 0.233 277.117));
		color: var(--color-white, #fff);
	}
	.pac-ul {
		z-index: 50;
		margin-top: calc(var(--spacing, 0.25rem) * 1);
		margin-bottom: calc(var(--spacing, 0.25rem) * -2);
		max-height: calc(var(--spacing, 0.25rem) * 60);
		width: 100%;
		list-style-type: none;
		position: absolute;
	}
	:where(.pac-ul > :not(:last-child)) {
		--tw-divide-y-reverse: 0;
		border-bottom-style: var(--tw-border-style);
		border-top-style: var(--tw-border-style);
		border-top-width: calc(1px * var(--tw-divide-y-reverse));
		border-bottom-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
		border-color: var(--color-gray-100, oklch(96.7% 0.003 264.542));
	}
	.pac-ul {
		border-radius: var(--radius-md, 0.375rem);
		background-color: var(--color-white, #fff);
		padding: calc(var(--spacing, 0.25rem) * 0);
		font-size: var(--text-base, 1rem);
		line-height: var(--tw-leading, var(--text-base--line-height, 1.5));
		--tw-shadow:
			0 10px 15px -3px var(--tw-shadow-color, #0000001a),
			0 4px 6px -4px var(--tw-shadow-color, #0000001a);
		--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width))
			var(--tw-ring-color, currentcolor);
		box-shadow:
			var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
			var(--tw-ring-shadow), var(--tw-shadow);
		--tw-ring-color: var(--color-black, #000);
		overflow: auto;
	}
	.pac-ul:focus {
		--tw-outline-style: none;
		outline-style: none;
	}
	@media (min-width: 40rem) {
		.pac-ul {
			font-size: var(--text-sm, 0.875rem);
			line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));
		}
	}
	.pac-li {
		cursor: default;
		padding-inline: calc(var(--spacing, 0.25rem) * 2);
		padding-block: calc(var(--spacing, 0.25rem) * 2);
		color: var(--color-gray-900, oklch(21% 0.034 264.665));
		-webkit-user-select: none;
		-moz-user-select: none;
		     user-select: none;
	}
	@media (hover: hover) {
		.pac-li:hover {
			background-color: var(--color-indigo-500, oklch(58.5% 0.233 277.117));
			color: var(--color-white, #fff);
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
		-webkit-text-decoration: inherit;
		text-decoration: inherit;
		font: inherit;
		cursor: pointer;
		background: 0 0;
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
		margin-block: 0;
		margin: 0;
	}
	.pac-li-div-one {
		min-width: calc(var(--spacing, 0.25rem) * 0);
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
	}
	.pac-li-current {
		background-color: var(--color-indigo-500, oklch(58.5% 0.233 277.117));
		color: var(--color-white, #fff);
		-webkit-text-decoration: inherit;
		text-decoration: inherit;
	}
	.pac-li-button-current {
		color: var(--color-white, #fff);
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
		line-height: var(--tw-leading, var(--text-xs--line-height, calc(1 / 0.75)));
	}
	.pac-highlight {
		--tw-font-weight: var(--font-weight-bold, 700);
		font-weight: var(--font-weight-bold, 700);
	}
	@property --tw-rotate-x {
		syntax: '*';
		inherits: false;
	}
	@property --tw-rotate-y {
		syntax: '*';
		inherits: false;
	}
	@property --tw-rotate-z {
		syntax: '*';
		inherits: false;
	}
	@property --tw-skew-x {
		syntax: '*';
		inherits: false;
	}
	@property --tw-skew-y {
		syntax: '*';
		inherits: false;
	}
	@property --tw-border-style {
		syntax: '*';
		inherits: false;
		initial-value: solid;
	}
	@property --tw-shadow {
		syntax: '*';
		inherits: false;
		initial-value: 0 0 #0000;
	}
	@property --tw-shadow-color {
		syntax: '*';
		inherits: false;
	}
	@property --tw-shadow-alpha {
		syntax: '<percentage>';
		inherits: false;
		initial-value: 100%;
	}
	@property --tw-inset-shadow {
		syntax: '*';
		inherits: false;
		initial-value: 0 0 #0000;
	}
	@property --tw-inset-shadow-color {
		syntax: '*';
		inherits: false;
	}
	@property --tw-inset-shadow-alpha {
		syntax: '<percentage>';
		inherits: false;
		initial-value: 100%;
	}
	@property --tw-ring-color {
		syntax: '*';
		inherits: false;
	}
	@property --tw-ring-shadow {
		syntax: '*';
		inherits: false;
		initial-value: 0 0 #0000;
	}
	@property --tw-inset-ring-color {
		syntax: '*';
		inherits: false;
	}
	@property --tw-inset-ring-shadow {
		syntax: '*';
		inherits: false;
		initial-value: 0 0 #0000;
	}
	@property --tw-ring-inset {
		syntax: '*';
		inherits: false;
	}
	@property --tw-ring-offset-width {
		syntax: '<length>';
		inherits: false;
		initial-value: 0;
	}
	@property --tw-ring-offset-color {
		syntax: '*';
		inherits: false;
		initial-value: #fff;
	}
	@property --tw-ring-offset-shadow {
		syntax: '*';
		inherits: false;
		initial-value: 0 0 #0000;
	}
	@property --tw-divide-y-reverse {
		syntax: '*';
		inherits: false;
		initial-value: 0;
	}
	@property --tw-font-weight {
		syntax: '*';
		inherits: false;
	}
</style>
