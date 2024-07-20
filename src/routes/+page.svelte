<script>
	import PlaceAutocomplete from './../lib/PlaceAutocomplete.svelte';

	let address = {
		building_name_number: '',
		street: '',
		town: '',
		county: '',
		country_iso2: '',
		postcode: ''
	};
	/**
	 * @type {never[]}
	 */
	let fullResponse = [];
	let PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyC0Qi8V6cMNhilPtnHWim0lcUOwsWKFG08';
	let countries = [
		{ name: 'United Kingdom', region: 'GB' },
		{ name: 'United States', region: 'US' },
		{ name: 'Switzerland', region: 'CH' },
		{ name: 'Greece', region: 'GR' },
		{ name: 'Russia', region: 'RU' },
		{ name: 'Japan', region: 'JP' }
	];
</script>

<PlaceAutocomplete bind:address bind:fullResponse bind:PUBLIC_GOOGLE_MAPS_API_KEY bind:countries />

{#if Object.values(address).filter((value) => value).length > 0}
	<button
		on:click={() =>
			(address = {
				building_name_number: '',
				street: '',
				town: '',
				county: '',
				country_iso2: '',
				postcode: ''
			})}>Clear</button
	>

	<ul>
		{#each Object.entries(address) as [key, value]}
			{#if value}
				<li>{key}: {value}</li>
			{/if}
		{/each}
	</ul>

	{JSON.stringify(fullResponse)}
{/if}
