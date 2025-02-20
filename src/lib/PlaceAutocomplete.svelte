<script lang="ts">
	import { onMount } from 'svelte';
	import * as GMaps from '@googlemaps/js-api-loader';
	import type { Props } from './interfaces.js';
	import { validateOptions, validateRequestParams, formatDistance, validateFetchFields } from './helpers.js';
	const { Loader } = GMaps;

	let {
		/**
		 * By default using SKU: Place Detals (Location Only) - 0.005 USD per each
		 * @see https://developers.google.com/maps/documentation/javascript/usage-and-billing#location-placedetails
		 */
		PUBLIC_GOOGLE_MAPS_API_KEY,
		//fetchFields = $bindable(['formattedAddress', 'addressComponents']),
		fetchFields,
		options,
		onResponse = $bindable((e: Event) => {}),
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
	let cl = $state(options.classes);

	// reset keyboard classes
	const resetKbdClasses = () => {
		cl.kbd_down = options.classes.kbd_down;
		cl.kbd_up = options.classes.kbd_up;
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
	const reset = () => {
		currentSuggestion = -1;
		request.input = '';
		results = [];
		setSessionToken();
	};

	/**
	 * Make request and get autocomplete suggestions.
	 * @param event
	 */
	const makeAcRequest = async (
		event: Event & { currentTarget: HTMLInputElement }
	): Promise<void> => {
		const target = event.currentTarget as HTMLInputElement;
		if (target?.value == '') {
			//title = '';
			request.input = '';
			results = [];
			return;
		}
		/**
		 * Prevent making request if the inputOffset is greater than the length of the input
		 * The input lenght should be greater than the inputOffset before making a request and displaying suggestions
		 */
		if (request.inputOffset && request.inputOffset >= target.value.length) {
			return;
		}

		// set request input
		request.input = target.value;

		// attempt to get autocomplete suggestions
		try {
			const { suggestions } =
				await placesApi.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
			results = [];
			//const formatter = new Intl.NumberFormat('en');
			// iterate suggestions and add results to an array
			for (const suggestion of suggestions) {
				// add suggestions to results
				results.push({
					place: suggestion.placePrediction.toPlace(),
					text: suggestion.placePrediction.text.toString(),
					distance: formatDistance(
						suggestion.placePrediction.distanceMeters,
						options.distance_units ?? 'km'
					)
				});
			}
		} catch (e: any) {
			onError((e.name || 'An error occurred') + ' - ' + (e.message || 'see console for details.'));
		}
	};
	/**
     * Event handler for clicking on a suggested place.
     //https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteSuggestion
     * @param place
     */
	const onPlaceSelected = async (place: { fetchFields: (arg0: { fields: string[]; }) => any; toJSON: () => any; }): Promise<void> => {
		try {
			// console.log(place);
			// console.log(fetchFields);
			await place.fetchFields({
				fields: fetchFields
			});
			let placeData = place.toJSON();
			onResponse(placeData);
		} catch (e: any) {
			onError(
				(e.name || 'An error occurred') + ' - ' + (e.message || 'error fetching place details')
			);
		}

		// reset search input and results
		reset();
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

			const { AutocompleteSessionToken, AutocompleteSuggestion } =
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
			cl.kbd_down += ' bg-indigo-500 text-white';
		} else if (e.key === 'ArrowUp') {
			currentSuggestion = Math.max(currentSuggestion - 1, 0);
			resetKbdClasses();
			cl.kbd_up += ' bg-indigo-500 text-white';
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (currentSuggestion >= 0) {
				onPlaceSelected(results[currentSuggestion].place);
			}
		} else if (e.key === 'Escape') {
			// reset srarch input and results
			reset();
		}

		setTimeout(() => {
			resetKbdClasses();
		}, 300);
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<section class={options.classes?.section}>
	<div class={options.classes.container}>
		{#if options.classes.icon}
			<div class={options.classes.icon_container}>
				{@html options.classes.icon}
			</div>
		{/if}

		<input
			type="text"
			name="search"
			bind:this={inputRef}
			class={options.classes.input}
			placeholder={options.placeholder}
			autocomplete={options.autocomplete}
			aria-controls="options"
			aria-autocomplete="list"
			aria-owns="options"
			aria-labelledby="search"
			aria-label="Search"
			aria-haspopup="listbox"
			bind:value={request.input}
			oninput={makeAcRequest}
		/>

		{#if results.length > 0}
			<div class={options.classes.kbd_container}>
				<kbd class={options.classes.kbd_escape}>Esc</kbd>
				<kbd class={cl.kbd_up}>&uArr;</kbd>
				<kbd class={cl.kbd_down}>&dArr;</kbd>
			</div>

			<ul class={options.classes.ul} id="options">
				{#each results as p, i}
					<li
						class={[options.classes.li, i === currentSuggestion && options.classes.li_current]}
						id="option-{i + 1}"
					>
						<!-- svelte-ignore a11y_invalid_attribute -->
						<a
							href="javascript:void(0)"
							class={[
								options.classes?.li_a,
								i === currentSuggestion && options.classes.li_a_current
							]}
							tabindex={i + 1}
							onclick={() => onPlaceSelected(p.place)}
						>
							<div class={[options.classes.li_div_container]}>
								<div
									class={[
										options.classes.li_div_one,
										i === currentSuggestion && options.classes.li_div_current
									]}
								>
									<p
										class={[
											i === currentSuggestion && options.classes.li_current,
											options.classes.li_div_one_p
										]}
									>
										{p.text}
									</p>
								</div>
							</div>
							{#if options.distance && p.distance}
								<div class={[options.classes.li_div_two]}>
									<p
										class={[
											i === currentSuggestion && options.classes.li_current,
											options.classes.li_div_two_p
										]}
									>
										{p.distance}
									</p>
								</div>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
