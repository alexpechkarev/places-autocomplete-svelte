<script lang="ts">
	import { onMount } from 'svelte';
	import * as GMaps from '@googlemaps/js-api-loader';
	import type { Props } from './interfaces.js';
	import { validateRequestParams } from './helpers.js';
	const { Loader } = GMaps;

	let {
		/**
		 * By default using SKU: Place Detals (Location Only) - 0.005 USD per each
		 * @see https://developers.google.com/maps/documentation/javascript/usage-and-billing#location-placedetails
		 */
		PUBLIC_GOOGLE_MAPS_API_KEY,
		fetchFields = $bindable(['formattedAddress', 'addressComponents']),
		placeholder = 'Search...',
		autocompete = 'off',
		autofocus = false,
		classes = {
			section: '',
			container: 'relative z-10 transform rounded-xl mt-4',
			icon_container: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>',
			input:
				'border-1 w-full rounded-md border-0 shadow-sm bg-gray-100 px-4 py-2.5 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm',
			kbd_container: 'absolute inset-y-0 right-0 flex py-1.5 pr-1.5',
			kbd_escape:
				'inline-flex items-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-8 mr-1',
			kbd_up:
				'inline-flex items-center justify-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-6',
			kbd_down:
				'inline-flex items-center rounded border border-gray-400 px-1 font-sans text-xs text-gray-500 justify-center w-6',
			ul: 'absolute z-50 -mb-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
			li: 'z-50 cursor-default select-none py-2 pl-4 text-gray-900 hover:bg-indigo-500 hover:text-white',
			li_current: 'bg-indigo-500 text-white',
			li_a: 'block w-full'
		},
		onResponse = $bindable((e: Event) => {}),
		onError = $bindable((error: string) => {}),
		requestParams = {}
	}: Props = $props();

	// set classes as state
	let cl = $state(classes);

    // reset keyboard classes
    const resetKbdClasses = () => {
        cl.kbd_down = classes.kbd_down;
        cl.kbd_up = classes.kbd_up;
    }	


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
			// iterate suggestions and add results to an array
			for (const suggestion of suggestions) {
				// add suggestions to results
				results.push({
					to_pace: suggestion.placePrediction.toPlace(),
					text: suggestion.placePrediction.text.toString()
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
		if(autofocus) {
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

<section class="{classes?.section}">
	<div class="{classes.container}">
		{#if classes.icon}
		<div class="{classes.icon_container}">
            {@html classes.icon}
		</div>
        {/if}

		<input
			type="text"
			name="search"
			bind:this={inputRef}
			class="{classes.input}"
			{placeholder}
			autocomplete={autocompete}
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
		<div class="{classes.kbd_container}">
			<kbd
				class="{classes.kbd_escape}"
				>Esc</kbd
			>
			<kbd
				class="{cl.kbd_up}"
				>&uArr;</kbd
			>
			<kbd
				class="{cl.kbd_down}"  
				>&dArr;</kbd
			>
		</div>
			<ul
				class="{classes.ul}"
				id="options"
			>
				{#each results as place, i}
					<li
						class={[ classes.li, i === currentSuggestion && classes.li_current ]}
						id="option-{i + 1}"
					>
						<!-- svelte-ignore a11y_invalid_attribute -->
						<a
							href="javascript:void(0)"
							class="{classes?.li_a}"
							tabindex={i + 1}
							onclick={() => onPlaceSelected(place.to_pace)}
						>
							{place.text}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
