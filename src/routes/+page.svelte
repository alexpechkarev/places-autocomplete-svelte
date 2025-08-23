<script lang="ts">
	import type { ComponentOptions, FormattedAddress, PlaceResult } from '$lib/interfaces.js';
	import PlaceAutocomplete from '$lib/PlaceAutocomplete.svelte';
	let autocompleteComponent: PlaceAutocomplete | undefined = $state(undefined); // This will hold the component instance

	let unique = $state({}); // every {} is unique, {} === {} evaluates to false
	let handleChange = (e: Event | null) => {
		if (typeof e === 'object' && e !== null) {
			unique = {};
		}
	};

	// Request parameters
	const requestParams = {
		// The language in which to return results. Will default to the browser's language preference.
		language: 'en-GB',
		// The region code, specified as a CLDR two-character region code. This affects address formatting, result ranking, and may influence what results are returned. This does not restrict results to the specified region.
		region: 'GB',
		// The location around which to retrieve place information. This will bias results to the specified area, but will not restrict results to this area.
		includedRegionCodes: ['GB'],
		//includedPrimaryTypes: ['restaurant', 'food'],
		origin: {
			lat: 53.76538654312942,
			lng: -3.0181503295898438
		}
	};
	//  geometry, icon, name, permanentlyClosed, photo, placeId, url, utcOffset, vicinity, openingHours, icon, name

	// 'formattedAddress', 'addressComponents', 'accessibilityOptions', 'allowsDogs', 'businessStatus','hasCurbsidePickup', 'hasDelivery','hasDineIn','displayName','displayNameLanguageCode','editorialSummary','evChargeOptions'
	const fetchFields = ['formattedAddress', 'addressComponents', 'displayName'];

	// Options
	const options: ComponentOptions = {
		placeholder: 'Start typing your address',
		distance: true,
		distance_units: 'km',
		clear_input: false,
		debounce: 100
		//  label: 'Address',
		// classes:{
		// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-from-line-icon lucide-arrow-right-from-line"><path d="M3 5v14"/><path d="M21 12H7"/><path d="m15 18 6-6-6-6"/></svg>',
		// }
	};

	// Full address as string
	let formattedAddress = $state('');
	// Formatted address object
	let formattedAddressObj: FormattedAddress = $state({
		street_number: '',
		street: '',
		town: '',
		county: '',
		country_iso2: '',
		postcode: ''
	});
	/**
	 * @type {PlaceResult | null}
	 * fullResponse - Unformatted response from Google Places API
	 */
	let fullResponse: PlaceResult | null = $state(null);
	// Google Maps API key
	const PUBLIC_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

	// Countries - optional, if not provided defaults to GB
	let countries = $state([
		{ name: 'United Kingdom', region: 'GB' },
		{ name: 'United States', region: 'US' },
		{ name: 'Switzerland', region: 'CH' },
		{ name: 'Greece', region: 'GR' },
		{ name: 'Russia', region: 'RU' },
		{ name: 'Japan', region: 'JP' }
	]);
	let selectedCountry = $state('GB');

	// Update region on country change
	let onCountryChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
		const target = e.currentTarget;
		requestParams.region = target.value;
		requestParams.includedRegionCodes = [target.value];
		handleChange(e);
	};
	// Error message
	let placesError = $state('');
	// Error handler function
	let onError = (error: string) => {
		placesError = error;
	};

	// Handle response from Google Places API
	let onResponse = (response: PlaceResult) => {
		if (!response.addressComponents || response.addressComponents.length === 0) {
			// Handle the case where addressComponents is empty or undefined
			onError('No address components found in the response.');
			return;
		}

		formattedAddress = response.formattedAddress ?? '';
		fullResponse = response;

		// Reset formattedAddressObj before populating
		formattedAddressObj = {
			street_number: '',
			street: '',
			town: '',
			county: '',
			country_iso2: '',
			postcode: ''
		};

		for (const component of response.addressComponents) {
			switch (component.types[0]) {
				case 'street_number':
				case 'point_of_interest':
				case 'establishment':
					formattedAddressObj.street_number = component.longText;
					break;
				// Street name
				case 'route':
				case 'premise':
					formattedAddressObj.street = component.longText;
					break;
				// Often the town/city
				case 'postal_town':
				case 'locality':
					formattedAddressObj.town = component.longText;
					break;
				// Typically county in UK/US
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

		// Trigger UI update if needed, e.g., by reassigning unique
		handleChange(null); // Or pass a relevant event/data
	};

	// Display response in tabs
	const tabs = [
		{ name: 'Response', id: 1 },
		{ name: 'Formatted Resposne', id: 2 }
	];
	let selectedTab = $state(tabs.find((tab) => tab.id === 1)?.id ?? tabs[0].id);
</script>

<svelte:head>
	<title>Places Autocomplete Svelte - Google Maps Autocomplete Component for SvelteKit</title>
	<meta
		name="description"
		content="This Svelte component leverages the Google Maps Places Autocomplete API to provide a user-friendly way to search for and retrieve detailed address information within your SvelteKit applications."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
	{#if placesError}
		<div
			class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-10"
			role="alert"
		>
			<strong class="font-bold">Error!</strong>
			<span class="block sm:inline">{placesError}</span>
		</div>
	{/if}

	<div class="my-12">
		<div class="grid grid-cols-1 lg:grid-cols-6 gap-x-4 mb-10">
			<div class="col-span-6">
			<textarea name="address" id="address" placeholder="Enter your address" class="border-2 block w-full p-2 rounded-md"></textarea>
			</div>
			<div class={[countries.length && 'lg:col-span-4', !countries.length && 'lg:col-span-6']}>
				<label class="mt-1 text-sm leading-6 text-gray-600" for="search"
					>Start typing your address</label
				>
				{#key unique}
					<PlaceAutocomplete
						bind:this={autocompleteComponent}
						{onError}
						{onResponse}
						{PUBLIC_GOOGLE_MAPS_API_KEY}
						{requestParams}
						{fetchFields}
						{options}
					/>
				{/key}
			</div>

			<!-- Country selector -->
			<div
				class={[countries.length && 'lg:col-span-2 mt-10 lg:mt-0', !countries.length && 'hidden']}
			>
				<label class="mt-1 text-sm leading-6 text-gray-600" for="search">Address country</label>
				<div class="flex items-center mt-4">
					<label for="country" class="sr-only">Country</label>
					<select
						id="country"
						name="country"
						class="h-10 w-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 ring-1 ring-inset ring-gray-300 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
						bind:value={selectedCountry}
						onchange={onCountryChange}
					>
						{#each countries as country}
							<option value={country.region}>{country.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Powered by Google  -->
		<div class="flex flex-wrap items-end">
			<div class="text-gray-500">powered by</div>
			<img
				src="google_on_white_hdpi.png"
				width="79"
				height="24"
				alt="powered by Google"
				class="h-6 ml-1"
			/>
		</div>
	</div>

	<button onclick={() => console.log(JSON.stringify(autocompleteComponent?.getRequestParams()))}>
		Get Request Param
	</button>

	<button onclick={() => autocompleteComponent?.focus()}> Focus </button>

	{#if Object.values(formattedAddressObj).filter((value) => value).length > 0}
		<h1 class="text-base font-semibold leading-6 text-gray-900 mt-10">Response</h1>
		<!-- Tabs -->
		<div>
			<div class="sm:hidden">
				<label for="tabs" class="sr-only">Select a tab</label>
				<select
					id="tabs"
					name="tabs"
					bind:value={selectedTab}
					class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-2.5"
				>
					{#each tabs as tab}
						<option value={tab.id}>{tab.name}</option>
					{/each}
				</select>
			</div>
			<div class="hidden sm:block">
				<div class="border-b border-gray-200">
					<nav class="-mb-px flex" aria-label="Tabs">
						{#each tabs as tab}
							<!-- svelte-ignore a11y_invalid_attribute -->
							<a
								href="#"
								onclick={() => (selectedTab = tab.id)}
								class="w-1/2 border-b-2 px-1 py-4 text-center text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-gray-700"
								class:text-indigo-600={selectedTab === tab.id}
								class:border-indigo-500={selectedTab === tab.id}
								class:border-transparent={selectedTab !== tab.id}
								aria-current={selectedTab === tab.id ? 'page' : undefined}
							>
								{tab.name}
							</a>
						{/each}
					</nav>
				</div>
			</div>
		</div>

		<!-- Unformatted response -->
		{#if selectedTab === 1}
			<div class="mt-10">
				<div class="sm:flex sm:items-center">
					<div class="sm:flex-auto">
						<h1 class="text-base font-semibold leading-6 text-gray-900">Query preditcions</h1>
						<p class="mt-1 text-sm leading-6 text-gray-600">
							Unformatted place details response from <a
								href="https://developers.google.com/maps/documentation/javascript/reference/place#Place.fetchFields"
								target="_blank"
								><code class="bg-gray-100 px-2 rounded-md"
									>fetchFields()
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-4 h-4 inline-block items-center justify-center"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path
											d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
										></path></svg
									>
								</code>
							</a> method.
						</p>
					</div>
					<div class="flex justify-end">
						<button
							type="button"
							onclick={() =>
								(formattedAddressObj = {
									street_number: '',
									street: '',
									town: '',
									county: '',
									country_iso2: '',
									postcode: ''
								})}
							class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
							>Clear</button
						>
					</div>
				</div>
				<div class="bg-slate-800 text-slate-300 text-sm rounded-md p-4 mt-2">
					<code class="block whitespace-pre">
						{JSON.stringify(fullResponse, null, 2)}
					</code>
				</div>
			</div>
		{/if}

		<!-- Formatted response -->
		{#if selectedTab === 2}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-10">
				<div>
					<div class="sm:flex sm:items-center">
						<div class="sm:flex-auto">
							<h1 class="text-base font-semibold leading-6 text-gray-900">
								Formatted address response
							</h1>
						</div>
					</div>
				</div>
				<div class="flex justify-end">
					<button
						type="button"
						onclick={() =>
							(formattedAddressObj = {
								street_number: '',
								street: '',
								town: '',
								county: '',
								country_iso2: '',
								postcode: ''
							})}
						class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>Clear</button
					>
				</div>

				<!-- Street Number -->
				<div class="mt-2">
					<label for="street_number" class="block text-sm font-medium leading-6 text-gray-900"
						>Street number</label
					>
					<input
						type="text"
						id="street_number"
						bind:value={formattedAddressObj.street_number}
						class="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
					/>
				</div>
				<!-- Street -->
				<div class="mt-2">
					<label for="street" class="block text-sm font-medium leading-6 text-gray-900"
						>Street</label
					>
					<input
						type="text"
						id="street"
						bind:value={formattedAddressObj.street}
						class="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
					/>
				</div>
				<!-- Town -->
				<div class="mt-2">
					<label for="town" class="block text-sm font-medium leading-6 text-gray-900">Town</label>
					<input
						type="text"
						id="town"
						bind:value={formattedAddressObj.town}
						class="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
					/>
				</div>
				<!-- County -->
				<div class="mt-2">
					<label for="county" class="block text-sm font-medium leading-6 text-gray-900"
						>County</label
					>
					<input
						type="text"
						id="county"
						bind:value={formattedAddressObj.county}
						class="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
					/>
				</div>
				<!-- Postcode -->
				<div class="mt-2">
					<label for="postcode" class="block text-sm font-medium leading-6 text-gray-900"
						>Postcode</label
					>
					<input
						type="text"
						id="postcode"
						bind:value={formattedAddressObj.postcode}
						class="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
					/>
				</div>
				<!-- Country -->
				<div class="mt-2">
					<label for="country_iso2" class="block text-sm font-medium leading-6 text-gray-900"
						>Country</label
					>
					<select
						id="country_iso2"
						class="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
						bind:value={formattedAddressObj.country_iso2}
					>
						{#each countries as country}
							<option value={country.region}>{country.name}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}
	{/if}

	<footer class="bg-white">
		<div class="mx-auto max-w-7xl py-12 md:flex md:items-center md:justify-between">
			<div class="flex justify-center space-x-6 md:order-2">
				<a
					href="https://github.com/alexpechkarev/places-autocomplete-svelte"
					class="text-gray-400 hover:text-gray-500"
				>
					<span class="sr-only">GitHub</span>
					<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							clip-rule="evenodd"
						/>
					</svg>
				</a>
			</div>
			<div class="mt-8 md:order-1 md:mt-0">
				<p class="text-center text-xs leading-5 text-gray-500">
					{new Date().getFullYear()} Places Autocomplete Svelte.
				</p>
			</div>
		</div>
	</footer>
</div>
