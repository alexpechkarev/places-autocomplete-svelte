<script lang="ts">
	import { onMount } from 'svelte';
	import * as GMaps from '@googlemaps/js-api-loader';
	const { Loader } = GMaps;

	export let PUBLIC_GOOGLE_MAPS_API_KEY: string = '';
	export let fetchFields: string[] = ['displayName', 'formattedAddress', 'addressComponents'];
	export let countries: { name: string; region: string }[] = [];
	let hasCountries = countries.length > 0;


	export let formattedAddress: string = '';
	export let fullResponse: { longText: string; shortText: string; types: Array<string> }[] = [];
	export let formattedAddressObj: {
		street_number: string;
		street: string;
		town: string;
		county: string;
		country_iso2: string;
		postcode: string;
	} = {
		street_number: '',
		street: '',
		town: '',
		county: '',
		country_iso2: '',
		postcode: ''
	};

	let placesError: string = '';
	let inputRef: HTMLInputElement;
	let currentSuggestion = -1;
	let title: string = '';
	let results: any[] = [];
	let token;
	let loader: GMaps.Loader;
	let placesApi: { [key: string]: any } = {};
	//https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest.includedPrimaryTypes
	let request = {
		input: '',
		language: 'en-GB',
		region: 'GB',
		sessionToken: ''
	};

	$: {
		if (request.input == '') {
			results = [];
		}
	}

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
		token = new placesApi.AutocompleteSessionToken();
		request.sessionToken = token;
		return request;
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
		} catch (e) {
			console.error(e);
			placesError = 'An error occurred - see console for details.';
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
	{#if placesError}
		<div
			class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
			role="alert"
		>
			<strong class="font-bold">Error!</strong>
			<span class="block">Check your PUBLIC_GOOGLE_MAPS_API_KEY and API restrictions.</span>
			<span class="block sm:inline">{placesError}</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-6 gap-x-4">
		<div class:lg:col-span-4={hasCountries} class:lg:col-span-6={!hasCountries}>
			<label class="mt-1 text-sm leading-6 text-gray-600" for="search">Start typing your address</label>
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
					class="border-1 w-full rounded-md border-gray-300 bg-gray-100 px-4 py-2.5 pl-10 pr-20 text-gray-900 focus:ring-1 sm:text-sm"
					placeholder="Search..."
					aria-controls="options"
					bind:value={request.input}
					on:input={makeAcRequest}
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
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<li
								class="z-50 cursor-default select-none py-2 pl-4 text-gray-900 hover:bg-indigo-500 hover:text-white"
								class:bg-indigo-500={i === currentSuggestion}
								class:bg-white={i !== currentSuggestion}
								class:text-white={i === currentSuggestion}
								id="option-{i + 1}"
								tabindex={i + 1}
								on:click={() => onPlaceSelected(place.to_pace)}
							>
								{place.text}
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
					class="h-10 w-full rounded-md border-1 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
					bind:value={request.region}
				>
					{#each countries as country}
						<option value={country.region}>{country.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="lg:col-span-6">
			<div class="text-sm font-medium leading-6 text-gray-500">{title}</div>
		</div>
	</div>
</section>

<style>
input,select,ul{margin:0;padding:0}.absolute,.sr-only{position:absolute}.block,svg{display:block}*,.border-gray-300{--tw-border-opacity:1}.text-gray-500,.text-gray-900,.text-red-700,.text-white{--tw-text-opacity:1}*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb;--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / 0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }:after,:before{--tw-content:''}:host,section{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:system-ui,sans-serif,apple color emoji,segoe ui emoji,Segoe UI Symbol,noto color emoji;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}strong{font-weight:bolder}kbd{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}input,select{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit}input:where([type=button]),input:where([type=reset]),input:where([type=submit]){background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}ul{list-style:none}.cursor-default,:disabled{cursor:default}svg{vertical-align:middle}[type=text],input:where(:not([type])),select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;border-color:#6b7280;border-width:1px;border-radius:0;padding:.5rem .75rem;font-size:1rem;line-height:1.5rem;--tw-shadow:0 0 #0000}[type=text]:focus,input:where(:not([type])):focus,select:focus{outline:transparent solid 2px;outline-offset:2px;--tw-ring-inset:var(--tw-empty,);--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:#2563eb;--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);border-color:#2563eb}input::-moz-placeholder{color:#6b7280;opacity:1}input::placeholder{color:#6b7280;opacity:1}select{text-transform:none;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGZpbGw9J25vbmUnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBhdGggc3Ryb2tlPScjNmI3MjgwJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS13aWR0aD0nMS41JyBkPSdNNiA4bDQgNCA0LTQnLz48L3N2Zz4=);background-position:right .5rem center;background-repeat:no-repeat;background-size:1.5em 1.5em;padding-right:2.5rem;-webkit-print-color-adjust:exact;print-color-adjust:exact}:root{--background:0 0% 100%;--foreground:222.2 84% 4.9%;--muted:210 40% 96.1%;--muted-foreground:215.4 16.3% 46.9%;--popover:0 0% 100%;--popover-foreground:222.2 84% 4.9%;--card:0 0% 100%;--card-foreground:222.2 84% 4.9%;--border:214.3 31.8% 91.4%;--input:214.3 31.8% 91.4%;--primary:222.2 47.4% 11.2%;--primary-foreground:210 40% 98%;--secondary:210 40% 96.1%;--secondary-foreground:222.2 47.4% 11.2%;--accent:210 40% 96.1%;--accent-foreground:222.2 47.4% 11.2%;--destructive:0 72.2% 50.6%;--destructive-foreground:210 40% 98%;--ring:222.2 84% 4.9%;--radius:0.5rem}*{border-color:hsl(var(--border) / var(--tw-border-opacity))}::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / 0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }.sr-only{width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.pointer-events-none{pointer-events:none}.relative{position:relative}.inset-y-0{top:0;bottom:0}.left-0{left:0}.right-0{right:0}.z-50{z-index:50}.-mb-2{margin-bottom:-.5rem}.mr-1{margin-right:.25rem}.mt-4{margin-top:1rem}.flex{display:flex}.inline-flex{display:inline-flex}.hidden{display:none}.h-10{height:2.5rem}.h-5{height:1.25rem}.max-h-60{max-height:15rem}.w-5{width:1.25rem}.w-6{width:1.5rem}.w-8{width:2rem}.w-full{width:100%}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr));grid-template-columns:1fr}.items-center{align-items:center}.gap-x-4{-moz-column-gap:1rem;column-gap:1rem;row-gap:1rem}.rounded-md{border-radius:calc(var(--radius) - 2px)}.rounded-xl{border-radius:.75rem}.border{border-width:1px}.border-gray-300{border-color:rgb(209 213 219 / var(--tw-border-opacity))}.bg-gray-100{--tw-bg-opacity:1;background-color:rgb(243 244 246 / var(--tw-bg-opacity))}.bg-indigo-500,.hover\:bg-indigo-500:hover{--tw-bg-opacity:1;background-color:rgb(99 102 241 / var(--tw-bg-opacity))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}.px-1{padding-left:.25rem;padding-right:.25rem}.px-4{padding-left:1rem;padding-right:1rem}.py-0{padding-top:0;padding-bottom:0}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\.5{padding-top:.375rem;padding-bottom:.375rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-2\.5{padding-top:.625rem;padding-bottom:.625rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.pl-10{padding-left:2.5rem}.pl-2{padding-left:.5rem}.pl-3{padding-left:.75rem}.pl-4{padding-left:1rem}.pr-1\.5{padding-right:.375rem}.pr-20{padding-right:5rem}.pr-7{padding-right:1.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.text-gray-500{color:rgb(107 114 128 / var(--tw-text-opacity))}.text-gray-900{color:rgb(17 24 39 / var(--tw-text-opacity))}.text-red-700{color:rgb(185 28 28 / var(--tw-text-opacity))}.text-white{color:rgb(255 255 255 / var(--tw-text-opacity))}.shadow-lg{--tw-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1),0 4px 6px -4px rgb(0 0 0 / 0.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.focus\:ring-1:focus,.focus\:ring-2:focus,.ring-1{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus\:ring-1:focus,.ring-1{--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.ring-black{--tw-ring-opacity:1;--tw-ring-color:rgb(0 0 0 / var(--tw-ring-opacity))}.focus\:outline-none:focus{outline:transparent solid 2px;outline-offset:2px}.focus\:ring-2:focus{--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.focus\:ring-inset:focus{--tw-ring-inset:inset}@media (min-width:640px){.sm\:text-sm{font-size:.875rem;line-height:1.25rem}}@media (min-width:1024px){.lg\:col-span-2{grid-column:span 2/span 2}}@keyframes swipe-out{0%{transform:translateY(calc(var(--lift) * var(--offset) + var(--swipe-amount)));opacity:1}to{transform:translateY(calc(var(--lift) * var(--offset) + var(--swipe-amount) + var(--lift) * -100%));opacity:0}}.grid{display:grid}@media (min-width:768px){.lg\:grid-cols-6{grid-template-columns:repeat(6,1fr)}.lg\:col-span-6{grid-column-start:span 6}.lg\:col-span-4{grid-column-start:span 4}.lg\:col-span-2{grid-column-start:span 2}}.my-10{margin-top:2.5rem;margin-bottom:2.5rem} .justify-center {justify-content: center;} .hover\:text-white:hover{color:rgb(255 255 255 / var(--tw-text-opacity))}
</style>
