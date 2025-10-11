<script lang="ts">
	import { onMount } from 'svelte';
	import type { PlaceResult, Props } from './interfaces.js';
	import { getGMapsContext, hasGMapsContext, importLibrary, initialiseGMapsNoContext, type GMapsContext } from './gmaps.js';
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
		 * By default using SKU: Place Detals (Location Only) - 0.005 USD per each
		 * @see https://developers.google.com/maps/documentation/javascript/usage-and-billing#location-placedetails
		 */
		PUBLIC_GOOGLE_MAPS_API_KEY='',
		fetchFields,
		options,
		onResponse = $bindable((response: PlaceResult) => {}),
		onError = $bindable((error: string) => {}),
		requestParams = {}
	}: Props = $props();

	const isDefaultOnResponse = onResponse.toString() === ((response: PlaceResult) => {}).toString();

	// validate options
	options = validateOptions(options);
	//console.log(options);

	// validate fetchFields
	fetchFields = validateFetchFields(fetchFields);
	//console.log(fetchFields);

	let kbdAction = $state(''); // 'up', 'down', or 'escape'

	// Local variables
	let inputRef: HTMLInputElement;
	let currentSuggestion = $state(-1);
	let results: any[] = $state([]);
	let placesApi: { [key: string]: any } = {};

	//https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data
	// validate requestParams
	requestParams = validateRequestParams(requestParams);
	let request = $state(requestParams);
	//$inspect(request);
	// clear result when input is empty
	$effect(() => {
		if (request.input == '') {
			results = [];
		}
	});

	/**
	 * Reset search input and results.
	 */
	const reset = (placeData?: PlaceResult) => {
		currentSuggestion = -1;
		if (options?.clear_input == false) {
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
	 * Refreshes the Google Places session token for a new session.
	 * Can be called imperatively on the component instance.
	 * @example
	 * let autocompleteComponent;
	 * autocompleteComponent.clear();
	 */
	export function clear() {
		reset(); // The existing reset function already handles this
	}

	/**
	 * Programmatically focuses the input element.
	 * @example
	 * autocompleteComponent.focus();
	 */
	export function focus() {
		inputRef?.focus();
	}

	/**
	 * Returns the current internal request parameters.
	 * Useful for debugging or inspecting the component's state.
	 * @returns {RequestParams}
	 */
	export function getRequestParams() {
		return request;
	}

	/**
	 * Make request and get autocomplete suggestions.
	 * @param event
	 */
	const debouncedMakeAcRequest = debounce(async (inputValue: string) => {
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

			// ieterate over suggestions and add results to an array
			for (const suggestion of suggestions) {
				// get prediction text
				const predictionText = suggestion.placePrediction.text;
				const originalText = predictionText.text;
				// Array of objects with startOffset, endOffset
				const matches = predictionText.matches;

				//Highlighting Logic
				let highlightedText: { text: string; highlighted: boolean }[] = [];

				// Sort matches just in case they aren't ordered (though they usually are)
				matches.sort(
					(a: { startOffset: number }, b: { startOffset: number }) => a.startOffset - b.startOffset
				);

				// Create highlighted segments
				highlightedText = createHighlightedSegments(originalText, matches);

				results.push({
					place: suggestion.placePrediction.toPlace(),
					text: highlightedText,
					distance: formatDistance(
						suggestion.placePrediction.distanceMeters,
						options.distance_units ?? 'km'
					)
				});
			}
		} catch (e: any) {
			onError((e.name || 'An error occurred') + ' - ' + (e.message || 'see console for details.'));
		}
	}, options?.debounce ?? 100); // Debounce by 100ms

	/**
     * Event handler for clicking on a suggested place.
     //https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteSuggestion
     * @param place
     */
	const onPlaceSelected = async (place: {
		fetchFields: (arg0: { fields: string[] }) => any;
		toJSON: () => any;
	}): Promise<void> => {
		try {
			// console.log(place);
			// console.log(fetchFields);
			await place.fetchFields({
				fields: fetchFields
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
	 * Helper function to set the session token.
	 */
	const setSessionToken = () => {
		try {
			request.sessionToken = new placesApi.AutocompleteSessionToken();
		} catch (e: any) {
			onError((e.name || 'An error occurred') + ' - ' + (e.message || 'error fetch token'));
		}
	};

	/**
	 * Initialize the Google Maps JavaScript API Loader.
	 */
	onMount(async (): Promise<void> => {


		if (isDefaultOnResponse) {
			console.warn(
				'PlaceAutocomplete: The `onResponse` callback has not been provided. Selected place data will not be handled. See documentation for usage.'
			);
		}
		if (options.autofocus) {
			// focus on the input
			inputRef.focus();
		}

		try {
       		// Await the promise that was stored in the context by the parent.
            // If the parent has already finished, this resolves immediately.
            // If the parent is still loading, this will wait.
			if(typeof gmaps !== 'undefined' && gmaps) {
				await gmaps?.initializationPromise;
			}else{

				// Check if the API key is provided
				if(PUBLIC_GOOGLE_MAPS_API_KEY === '' || !PUBLIC_GOOGLE_MAPS_API_KEY) {
					throw new Error('Google Maps API key is required. Please provide a valid API key.');
				}

				// No context available, initialize without context
				// This will load the Google Maps script
				// and set up the necessary objects
				// for places API usage.
				await initialiseGMapsNoContext({key: PUBLIC_GOOGLE_MAPS_API_KEY, 'v': 'weekly'});
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
	 * Handles keyboard events for navigating the suggestions.
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
		}, 200);
	}

	// Handle click outside the input
	// to reset the search input and results
	function handleClickOutside(event: MouseEvent) {
		if (inputRef && !inputRef.contains(event.target as Node)) {
			reset();
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<section
	class={options.classes?.section}
	role="combobox"
	aria-controls="autocomplete-listbox"
	tabindex="0"
	aria-haspopup="listbox"
	aria-expanded={results.length > 0}
	aria-owns="autocomplete-listbox"
>
	{#if options?.label ?? ''}
		<label for="places-autocomplete-input" class={options.classes?.label ?? ''}>
			{options.label}
		</label>
	{/if}
	<div class={options.classes?.container ?? ''}>
		{#if options.classes?.icon}
			<div class={options.classes.icon_container}>
				{@html options.classes.icon}
			</div>
		{/if}

		<input
			id="places-autocomplete-input"
			type="text"
			name="search"
			bind:this={inputRef}
			class={options.classes?.input ?? ''}
			placeholder={options.placeholder}
			autocomplete={options.autocomplete}
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
			<div class={options.classes?.kbd_container ?? ''}>
				<kbd class={options.classes?.kbd_escape ?? ''} class:kbd-active={kbdAction === 'escape'}
					>Esc</kbd
				>
				<kbd class={options.classes?.kbd_up ?? ''} class:kbd-active={kbdAction === 'up'}>&uArr;</kbd
				>
				<kbd class={options.classes?.kbd_down ?? ''} class:kbd-active={kbdAction === 'down'}
					>&dArr;</kbd
				>
			</div>
			<ul class={options.classes?.ul ?? ''} id="autocomplete-listbox" role="listbox">
				{#each results as p, i}
					<li
						role="option"
						aria-selected={i === currentSuggestion}
						class={[
							options.classes?.li ?? '',
							i === currentSuggestion && options.classes?.li_current
						]}
						onmouseenter={() => (currentSuggestion = i)}
						id="option-{i + 1}"
					>
						<button
							type="button"
							class={[
								options.classes?.li_a,
								i === currentSuggestion && options.classes?.li_a_current
							]}
							onclick={() => onPlaceSelected(p.place)}
						>
							<div class={[options.classes?.li_div_container ?? '']}>
								<div
									class={[
										options.classes?.li_div_one ?? '',
										i === currentSuggestion && options.classes?.li_div_current
									]}
								>
									<p
										class={[
											i === currentSuggestion && options.classes?.li_current,
											options.classes?.li_div_one_p
										]}
									>
										{#each p.text as segment}
											{#if segment.highlighted}
												<span class={options.classes?.highlight ?? 'font-bold'}>{segment.text}</span
												>
											{:else}
												{segment.text}
											{/if}
										{/each}
									</p>
								</div>
							</div>
							{#if options.distance && p.distance}
								<div class={[options.classes?.li_div_two]}>
									<p
										class={[
											i === currentSuggestion && options.classes?.li_current,
											options.classes?.li_div_two_p
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
	/* Combining Tailwind CSS classes bg-indigo-500 text-white */
	.kbd-active {
		/* Use the active class from options if available, or a default */
		background-color: var(--kbd-active-bg, #4f46e5); /* Indigo 500 */
		color: var(--kbd-active-color, white);
		transition:
			background-color 0.1s ease-in-out,
			color 0.1s ease-in-out;
	}
</style>
