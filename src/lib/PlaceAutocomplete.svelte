<script lang="ts">
	import { onMount } from 'svelte';
	import * as GMaps from '@googlemaps/js-api-loader';
	import type { PlaceResult, Props } from './interfaces.js';
	import {
		validateOptions,
		validateRequestParams,
		formatDistance,
		validateFetchFields,
		componentOptions
	} from './helpers.js';
	const { Loader } = GMaps;

	let {
		/**
		 * By default using SKU: Place Detals (Location Only) - 0.005 USD per each
		 * @see https://developers.google.com/maps/documentation/javascript/usage-and-billing#location-placedetails
		 */
		PUBLIC_GOOGLE_MAPS_API_KEY,
		fetchFields,
		options,
		onResponse = $bindable((response: PlaceResult) => {}),
		onError = $bindable((error: string) => {}),
		requestParams = {}
	}: Props = $props();

	// validate options
	options = validateOptions(options);
	//console.log(options);

	// validate fetchFields
	fetchFields = validateFetchFields(fetchFields);
	//console.log(fetchFields);

	// set classes as state
	let cl = $state(options.classes ?? {});
	// reset keyboard classes
	const resetKbdClasses = () => {
		cl.kbd_down = options.classes?.kbd_down ?? componentOptions.classes?.kbd_down ?? '';
		cl.kbd_up = options.classes?.kbd_up ?? componentOptions.classes?.kbd_up ?? '';
	};

	// Local variables
	let inputRef: HTMLInputElement;
	let currentSuggestion = $state(-1);
	let results: any[] = $state([]);
	let loader: GMaps.Loader;
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
		if(options?.clear_input == false){
			if (placeData && placeData.formattedAddress) {
				// set input to formatted address
				request.input = placeData.formattedAddress;
			}
		}else{
			request.input = '';
		}
		results = [];
		setSessionToken();
		//console.log('reset completed', results);
	};

	/**
	 * Debounce function to limit the rate at which a function can fire.
	 * @param func
	 * @param wait
	 */
	function debounce<T extends (...args: any[]) => any>(
		func: T,
		wait: number
	): (...args: Parameters<T>) => void {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		return function executedFunction(...args: Parameters<T>) {
			const later = () => {
				timeout = null;
				func(...args);
			};
			if (timeout !== null) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(later, wait);
		};
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
				let highlightedText = '';
				let lastIndex = 0;

				// Sort matches just in case they aren't ordered (though they usually are)
				matches.sort(
					(a: { startOffset: number }, b: { startOffset: number }) => a.startOffset - b.startOffset
				);
				for (const match of matches) {
					// Append text before the current match
					highlightedText += originalText.substring(lastIndex, match.startOffset);

					// Append the highlighted match segment
					// Choose your highlighting class (e.g., 'font-bold' or a custom one)
					highlightedText += `<span class="${options.classes?.highlight ?? 'font-bold'}">`;
					highlightedText += originalText.substring(match.startOffset, match.endOffset);
					highlightedText += `</span>`;

					// Update the last index processed
					lastIndex = match.endOffset;
				}

				// Append any remaining text after the last match
				highlightedText += originalText.substring(lastIndex);
				// --- End Highlighting Logic ---

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
		if (options.autofocus) {
			// focus on the input
			inputRef.focus();
		}

		// load the Google Maps API
		try {
			loader = new Loader({
				apiKey: PUBLIC_GOOGLE_MAPS_API_KEY,
				version: 'weekly',
				libraries: ['places']
			});

			const { AutocompleteSessionToken, AutocompleteSuggestion} =
				await loader.importLibrary('places');

			placesApi.AutocompleteSessionToken = AutocompleteSessionToken;
			placesApi.AutocompleteSuggestion = AutocompleteSuggestion;

			// const {Geocoder} = await loader.importLibrary("geocoding");
			// placesApi.Geocoder = new Geocoder();

			setSessionToken();
		} catch (e: any) {
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
			resetKbdClasses();
			cl.kbd_down += ' ' + (cl?.kbd_active ?? 'bg-indigo-500 text-white');
		} else if (e.key === 'ArrowUp') {
			currentSuggestion = Math.max(currentSuggestion - 1, 0);
			resetKbdClasses();
			cl.kbd_up += ' ' + (cl?.kbd_active ?? 'bg-indigo-500 text-white');
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (currentSuggestion >= 0) {
				onPlaceSelected(results[currentSuggestion].place);
			}
		} else if (e.key === 'Escape') {
			// reset srarch input and results
			request.input = '';
			reset();
		}
		// Optional: Scroll suggestion into view
		const selectedElement = document.getElementById(`option-${currentSuggestion + 1}`);
		selectedElement?.scrollIntoView({ block: 'nearest' });
		setTimeout(() => {
			resetKbdClasses();
		}, 300);
	}

	// Handle click outside the input
	// to reset the search input and results
	function handleClickOutside(event: MouseEvent) {
		if (inputRef && !inputRef.contains(event.target as Node)) {
			reset();
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} onclick={handleClickOutside}/>

<section class={options.classes?.section}>
	{#if options?.label ?? ''}
		<label for="search" class={options.classes?.label ?? ''}>
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
			bind:value={request.input}
			oninput={(event) => debouncedMakeAcRequest(event.currentTarget.value)}
		/>
		<!-- oninput={makeAcRequest} -->

		{#if results.length > 0}
			<div class={options.classes?.kbd_container ?? ''}>
				<kbd class={options.classes?.kbd_escape ?? ''}>Esc</kbd>
				<kbd class={cl.kbd_up}>&uArr;</kbd>
				<kbd class={cl.kbd_down}>&dArr;</kbd>
			</div>

			<ul class={options.classes?.ul ?? ''} id="options" role="listbox">
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
						<!-- svelte-ignore a11y_invalid_attribute -->
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
										<!-- {p.text} -->
										{@html p.text}
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
