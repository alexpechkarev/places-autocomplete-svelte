<script>
	// @ts-nocheck

	import PlaceAutocomplete from './../lib/PlaceAutocomplete.svelte';
	import { browser } from '$app/environment';

	// Full address as string
	let formattedAddress = '';
	// Formatted address object
	let formattedAddressObj = {
		street_number: '',
		street: '',
		town: '',
		county: '',
		country_iso2: '',
		postcode: ''
	};
	/**
	 * @type {never[]}
	 * fullResponse - Unformatted response from Google Places API
	 */
	let fullResponse = [];
	// Google Maps API key
	let PUBLIC_GOOGLE_MAPS_API_KEY = '--YOUR_API_KEY--';

	// Countries - optional, if not provided defaults to GB
	let countries = [
		{ name: 'United Kingdom', region: 'GB' },
		{ name: 'United States', region: 'US' },
		{ name: 'Switzerland', region: 'CH' },
		{ name: 'Greece', region: 'GR' },
		{ name: 'Russia', region: 'RU' },
		{ name: 'Japan', region: 'JP' }
	];
	// Error message
	let placesError = '';
	// Error handler function
	let onError = (error) => {
		placesError = error;
	};

	// Display response in tabs
	const tabs = [
		{ name: 'Formatted Resposne', id: 1 },
		{ name: 'Unformatted Response', id: 2 },
		{ name: 'Formatted Address', id: 3 }
	];
	let selectedTab = tabs.find((tab) => tab.id === 1).id;
</script>

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

	<div class="my-2">
		<PlaceAutocomplete
			{onError}
			bind:PUBLIC_GOOGLE_MAPS_API_KEY
			bind:formattedAddress
			bind:formattedAddressObj
			bind:fullResponse
			bind:countries
		/>

		<img src="google_on_white_hdpi.png" alt="powered by Google" class="-mt-4" />
	</div>

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
							<!-- svelte-ignore a11y-invalid-attribute -->
							<a
								href="#"
								on:click|preventDefault={() => (selectedTab = tab.id)}
								class="w-1/4 border-b-2 px-1 py-4 text-center text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-gray-700"
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

		<!-- Formatted response -->
		{#if selectedTab === 1}
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
						on:click={() =>
							(formattedAddressObj = {
								street_number: '',
								street: '',
								town: '',
								county: '',
								country_iso2: '',
								postcode: ''
							})}
						class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
						class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
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
						class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
					/>
				</div>
				<!-- Town -->
				<div class="mt-2">
					<label for="town" class="block text-sm font-medium leading-6 text-gray-900">Town</label>
					<input
						type="text"
						id="town"
						bind:value={formattedAddressObj.town}
						class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
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
						class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
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
						class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
					/>
				</div>
				<!-- Country -->
				<div class="mt-2">
					<label for="country_iso2" class="block text-sm font-medium leading-6 text-gray-900"
						>Country</label
					>
					<select
						id="country_iso2"
						class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
						bind:value={formattedAddressObj.country_iso2}
					>
						{#each countries as country}
							<option value={country.region}>{country.name}</option>
						{/each}
					</select>
				</div>

				<div class="lg:col-span-2">
					<p class="my-2 text-sm leading-6 text-gray-600">
						The <a
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
						</a>
						method fetches additional place details (like phone number, website, opening hours, etc.)
						for the selected address. You can then use the
						<code class="bg-gray-100 px-2 rounded-md">formattedAddressObj</code> property to conveniently
						access individual address components.
					</p>
					<ul
						role="list"
						class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl font-mono"
					>
						<li
							class="relative block lg:flex justify-between gap-x-6 px-4 py-4 hover:bg-gray-50 sm:px-6"
						>
							<div class="flex min-w-0 gap-x-4">
								<div class="min-w-0 flex-auto">
									<p class="text-sm text-blue-800">formattedAddressObj.street_number</p>
								</div>
							</div>
							<div class="flex items-center justify-between gap-x-4 lg:hidden">
								<p class="text-sm leading-6 text-gray-900">-</p>
							</div>
							<div class="flex shrink-0 items-center gap-x-4">
								<div class="flex flex-col items-end">
									<p class="text-sm text-blue-800">addressComponents.street_number</p>
								</div>
							</div>
						</li>
						<li
							class="relative block lg:flex justify-between gap-x-6 px-4 py-4 hover:bg-gray-50 sm:px-6"
						>
							<div class="flex min-w-0 gap-x-4">
								<div class="min-w-0 flex-auto">
									<p class="text-sm text-blue-800">formattedAddressObj.street</p>
								</div>
							</div>
							<div class="flex items-center justify-between gap-x-4">
								<p class="text-sm leading-6 text-gray-900 lg:hidden">-</p>
							</div>
							<div class="flex shrink-0 items-center gap-x-4">
								<div class="flex flex-col items-end">
									<p class="text-sm text-blue-800">addressComponents.route</p>
								</div>
							</div>
						</li>
						<li
							class="relative block lg:flex justify-between gap-x-6 px-4 py-4 hover:bg-gray-50 sm:px-6"
						>
							<div class="flex min-w-0 gap-x-4">
								<div class="min-w-0 flex-auto">
									<p class="text-sm text-blue-800">formattedAddressObj.town</p>
								</div>
							</div>
							<div class="flex items-center justify-between gap-x-4">
								<p class="text-sm leading-6 text-gray-900 lg:hidden">-</p>
							</div>
							<div class="flex shrink-0 items-center gap-x-4">
								<div class="flex flex-col items-end">
									<p class="text-sm text-blue-800">addressComponents.postal_town</p>
								</div>
							</div>
						</li>

						<li
							class="relative block lg:flex justify-between gap-x-6 px-4 py-4 hover:bg-gray-50 sm:px-6"
						>
							<div class="flex min-w-0 gap-x-4">
								<div class="min-w-0 flex-auto">
									<p class="text-sm text-blue-800">formattedAddressObj.county</p>
								</div>
							</div>
							<div class="flex items-center justify-between gap-x-4 sm:hidden">
								<p class="text-sm leading-6 text-gray-900 lg:hidden">-</p>
							</div>
							<div class="flex shrink-0 items-center gap-x-4">
								<div class="flex flex-col items-end">
									<p class="text-sm text-blue-800">addressComponents.administrative_area_level_2</p>
								</div>
							</div>
						</li>

						<li
							class="relative block lg:flex justify-between gap-x-6 px-4 py-4 hover:bg-gray-50 sm:px-6"
						>
							<div class="flex min-w-0 gap-x-4">
								<div class="min-w-0 flex-auto">
									<p class="text-sm text-blue-800">formattedAddressObj.country_iso2</p>
								</div>
							</div>
							<div class="flex items-center justify-between gap-x-4">
								<p class="text-sm leading-6 text-gray-900 lg:hidden">-</p>
							</div>
							<div class="flex shrink-0 items-center gap-x-4">
								<div class="flex flex-col items-end">
									<p class="text-sm text-blue-800">addressComponents.country</p>
								</div>
							</div>
						</li>

						<li
							class="relative block lg:flex justify-between gap-x-6 px-4 py-4 hover:bg-gray-50 sm:px-6"
						>
							<div class="flex min-w-0 gap-x-4">
								<div class="min-w-0 flex-auto">
									<p class="text-sm text-blue-800">formattedAddressObj.postcode</p>
								</div>
							</div>
							<div class="flex items-center justify-between gap-x-4">
								<p class="text-sm leading-6 text-gray-900 lg:hidden">-</p>
							</div>
							<div class="flex shrink-0 items-center gap-x-4">
								<div class="flex flex-col items-end">
									<p class="text-sm text-blue-800">addressComponents.postal_code</p>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		{/if}

		<!-- Unformatted response -->
		{#if selectedTab === 2}
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
				</div>
				<div class="mt-8 flow-root">
					<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
								<table class="min-w-full divide-y divide-gray-300">
									<thead class="bg-gray-50">
										<tr>
											<th
												scope="col"
												class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
												>Long Text</th
											>
											<th
												scope="col"
												class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
												>Short Text</th
											>
											<th
												scope="col"
												class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Types</th
											>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-200 bg-white">
										{#each Object.entries(fullResponse) as [key, v]}
											<tr>
												<td
													class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
												>
													{fullResponse[key]?.longText}
												</td>
												<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
													{fullResponse[key]?.shortText}
												</td>
												<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
													{fullResponse[key]?.types}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Formatted Address string -->
		{#if selectedTab === 3}
			<div class="grid grid-cols-1 gap-4 mt-10">
				<div>
					<div class="sm:flex sm:items-center">
						<div class="sm:flex-auto">
							<h1 class="text-base font-semibold leading-6 text-gray-900">Formatted address</h1>
							<div class="text-sm leading-6 text-gray-600 flex items-center">
								The the business name and address
								<a
									href="https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#PlacePrediction"
									target="_blank"
									><code class="bg-gray-100 px-2 rounded-md"
										>PlacePrediction.text
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
								</a>
							</div>
						</div>
					</div>
				</div>

				<div class="bg-gray-900 rounded-md p-4">
					<p class="text-gray-100 font-mono">{formattedAddress}</p>
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
