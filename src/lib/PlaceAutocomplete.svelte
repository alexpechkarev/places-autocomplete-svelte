<script lang="ts">
	import { onMount } from 'svelte';
	import * as GMaps from '@googlemaps/js-api-loader';
	const { Loader } = GMaps;

	// Props Interface
	interface Props {
		PUBLIC_GOOGLE_MAPS_API_KEY: string;
		fetchFields: string[];
		countries: { name: string; region: string }[];
		formattedAddress: string;
		fullResponse: { longText: string; shortText: string; types: Array<string> }[];
		formattedAddressObj: {
			street_number: string;
			street: string;
			town: string;
			county: string;
			country_iso2: string;
			postcode: string;
		};
		onError: (error: string) => void;
	}
	// Bindable Props
	let {
		PUBLIC_GOOGLE_MAPS_API_KEY = $bindable(''),
		/**
		 * By default using SKU: Place Detals (Location Only) - 0.005 USD per each
		 * @see https://developers.google.com/maps/documentation/javascript/usage-and-billing#location-placedetails
		 */
		fetchFields = $bindable(['formattedAddress', 'addressComponents']),
		countries = $bindable([]),
		formattedAddress = $bindable(''),
		fullResponse = $bindable([]),
		formattedAddressObj = $bindable({
			street_number: '',
			street: '',
			town: '',
			county: '',
			country_iso2: '',
			postcode: ''
		}),
		onError = $bindable((error: string) => {})
	}: Props = $props();

	// Check if countries are available
	let hasCountries = countries.length > 0;
	// Local variables
	let inputRef: HTMLInputElement;
	let currentSuggestion = $state(-1);
	let title: string = $state('');
	let results: any[] = $state([]);
	let token;
	let loader: GMaps.Loader;
	let placesApi: { [key: string]: any } = {};
	//https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest.includedPrimaryTypes
	let request = $state({
		input: '',
		language: 'en-GB',
		region: 'GB',
		sessionToken: ''
	});

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
		refreshToken(request);
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
			title = '';
			request.input = '';
			results = [];
			return;
		}

		request.input = target.value;
		try {
			const { suggestions } =
				await placesApi.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
			results = [];
			// iterate suggestions and add results to an array
			for (const suggestion of suggestions) {
				// add suggexstions to results
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
			formattedAddressObj = {
				street_number: '',
				street: '',
				town: '',
				county: '',
				country_iso2: '',
				postcode: ''
			};

			title = 'Selected address: ' + placeData.formattedAddress;
			formattedAddress = placeData.formattedAddress;
			fullResponse = placeData.addressComponents;

			for (const component of placeData.addressComponents) {
				switch (component.types[0]) {
					case 'street_number':
					case 'point_of_interest':
					case 'establishment':
						formattedAddressObj.street_number = component.longText;
						break;
					case 'route':
					case 'premise':
						formattedAddressObj.street = component.longText;
						break;
					case 'postal_town':
						formattedAddressObj.town = component.longText;
						break;
					case 'administrative_area_level_2':
						formattedAddressObj.county = component.longText;
						break;
					case 'country':
						formattedAddressObj.country_iso2 = component.shortText;
						break;
					case 'postal_code':
						formattedAddressObj.postcode = component.longText;
						break;
				}
			}
		} catch (e: any) {
			onError(
				(e.name || 'An error occurred') + ' - ' + (e.message || 'error fetching place details')
			);
		}

		// reset srarch input and results
		reset();
	};

	/**
	 * Helper function to refresh the session token.
	 * @param request
	 */
	const refreshToken = async (request: {
		input?: string;
		language?: string;
		region?: string;
		sessionToken?: any;
	}): Promise<{ input?: string; language?: string; region?: string; sessionToken?: any }> => {
		try {
			token = new placesApi.AutocompleteSessionToken();
			request.sessionToken = token;
			return request;
		} catch (e: any) {
			onError((e.name || 'An error occurred') + ' - ' + (e.message || 'error fetch token'));
			return request;
		}
	};
	/**
	 * Initialize the Google Maps JavaScript API Loader.
	 */
	onMount(async (): Promise<void> => {
		inputRef.focus();

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
			token = new placesApi.AutocompleteSessionToken();
			request.sessionToken = token;
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
		} else if (e.key === 'ArrowUp') {
			currentSuggestion = Math.max(currentSuggestion - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (currentSuggestion >= 0) {
				onPlaceSelected(results[currentSuggestion].to_pace);
			}
		} else if (e.key === 'Escape') {
			// reset srarch input and results
			reset();
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<section class="my-10">
	<div class="grid grid-cols-1 lg:grid-cols-6 gap-x-4">
		<div class:lg:col-span-4={hasCountries} class:lg:col-span-6={!hasCountries}>
			<label class="mt-1 text-sm leading-6 text-gray-600" for="search"
				>Start typing your address</label
			>
			<div class="relative z-50 transform rounded-xl mt-4">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
					>
				</div>

				<input
					type="text"
					name="search"
					bind:this={inputRef}
					class="border-1 w-full rounded-md border-0 shadow-sm bg-gray-100 px-4 py-2.5 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm"
					placeholder="Search..."
					aria-controls="options"
					bind:value={request.input}
					oninput={makeAcRequest}
				/>

				{#if results.length > 0}
					<div class="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
						<kbd
							class="inline-flex items-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-8 mr-1"
							>Esc</kbd
						>
						<kbd
							class="inline-flex items-center justify-center rounded border border-gray-300 px-1 font-sans text-xs text-gray-500 w-6"
							>&uArr;</kbd
						>
						<kbd
							class="inline-flex items-center rounded border border-gray-400 px-1 font-sans text-xs text-gray-500 justify-center w-6"
							>&dArr;</kbd
						>
					</div>
					<ul
						class="absolute z-50 -mb-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
						id="options"
					>
						{#each results as place, i}
							<li
								class="z-50 cursor-default select-none py-2 pl-4 text-gray-900 hover:bg-indigo-500 hover:text-white"
								class:bg-indigo-500={i === currentSuggestion}
								class:bg-white={i !== currentSuggestion}
								class:text-white={i === currentSuggestion}
								id="option-{i + 1}"
							>
								<!-- svelte-ignore a11y_invalid_attribute -->
								<a
									href="javascript:void(0)"
									class="block w-full"
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
		</div>

		<div class:lg:col-span-2={hasCountries} class:hidden={!hasCountries}>
			<label class="mt-1 text-sm leading-6 text-gray-600" for="search">Address country</label>
			<div class="flex items-center mt-4">
				<label for="country" class="sr-only">Country</label>
				<select
					id="country"
					name="country"
					class="h-10 w-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 ring-1 ring-inset ring-gray-300 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
					bind:value={request.region}
				>
					{#each countries as country}
						<option value={country.region}>{country.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="lg:col-span-6 mt-2">
			<div class="text-sm font-medium leading-6 text-gray-500">{title}</div>
		</div>
	</div>
</section>
