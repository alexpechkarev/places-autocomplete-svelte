<script lang="ts">
	import { browser } from '$app/environment';
	import { initialiseGMaps, setGMapsContext } from '$lib/gmaps.js';
	import '../app.css';
	let { children } = $props();


	setGMapsContext();
	 // 2. If we are in the browser, trigger the asynchronous loading process.
    // This will update the stores that all components are subscribed to.
    if (browser) {
        initialiseGMaps({
			key: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY,
			v: 'weekly'
		}).catch((error: any) => {
			// Error is already logged and set in the store by initialiseGMaps
			// You can add additional global error handling here if needed.
			console.error('Error initializing Google Maps in +layout.svelte:', error);
        });
    }


</script>



{@render children()}
