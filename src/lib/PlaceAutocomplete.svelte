<script lang="ts">
	import { onMount } from 'svelte';
	import * as GMaps from '@googlemaps/js-api-loader';
	import type { ComponentOptions, Props } from './interfaces.js';
	import { validateOptions, validateRequestParams } from './helpers.js';
	const { Loader } = GMaps;

	let {
		/**
		 * By default using SKU: Place Detals (Location Only) - 0.005 USD per each
		 * @see https://developers.google.com/maps/documentation/javascript/usage-and-billing#location-placedetails
		 */
		PUBLIC_GOOGLE_MAPS_API_KEY,
		fetchFields = $bindable(['formattedAddress', 'addressComponents']),
		options,
		onResponse = $bindable((e: Event) => {}),
		onError = $bindable((error: string) => {}),
		requestParams = {}
	}: Props = $props();

	// validate options
	options = validateOptions(options);

	// set classes as state
	let cl = $state(options.classes);

	// format meters to km and meters
	const formatMeters = function (meters: number): string|null {
		if(typeof meters !== 'number') {
			return null;
		}
		const km = Math.floor(meters / 1000);
		const remainingMeters = meters % 1000;
		let formattedString = '';
		if (km > 0) {
			formattedString += km + 'km ';
		}
		formattedString += remainingMeters + 'm';
		return formattedString;
	};

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
	// validate and merge requestParams with requestParamsDefault
	//let request = $state(validateRequestParams(Object.assign(requestParamsDefault, requestParams)));
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
			const formatter = new Intl.NumberFormat('en');
			// iterate suggestions and add results to an array
			for (const suggestion of suggestions) {
				
				// add suggestions to results
				results.push({
					to_pace: suggestion.placePrediction.toPlace(),
					text: suggestion.placePrediction.text.toString(),
					distance: formatMeters(suggestion.placePrediction.distanceMeters)
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
	const onPlaceSelected = async (place: {
		[x: string]: any;
		fetchFields: (arg0: { fields: string[] }) => any;
		addressComponents: any;
		formattedAddress: string;
	}): Promise<void> => {
		try {
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
				onPlaceSelected(results[currentSuggestion].to_pace);
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
				{#each results as place, i}
					<li
						class={[options.classes.li, i === currentSuggestion && options.classes.li_current]}
						id="option-{i + 1}"
					>
						<!-- svelte-ignore a11y_invalid_attribute -->
						<a
							href="javascript:void(0)"
							class={[options.classes?.li_a, 'flex justify-between']}
							tabindex={i + 1}
							onclick={() => onPlaceSelected(place.to_pace)}
						>
							<div class="flex min-w-0 gap-x-4">
								<!-- <img
									class="size-12 flex-none rounded-full bg-gray-50"
									src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
									alt=""
								/> -->
								<div class="min-w-0 flex-auto">
									<p class={[i === currentSuggestion && options.classes.li_current,'text-sm/6 font-semibold text-gray-900']}>{place.text}</p>
									<!-- <p class="mt-1 truncate text-xs/5 text-gray-500">leslie.alexander@example.com</p> -->
								</div>
							</div>
							{#if options.show_distance && place.distance}
								<div class="shrink-0 flex flex-col items-end min-w-16">
									<p class={[i === currentSuggestion && options.classes.li_current,'mt-1 text-xs/5 text-gray-500']}>
										{place.distance}
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
