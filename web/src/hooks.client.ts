import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
import type { ServerInit } from '@sveltejs/kit';
import posthog from 'posthog-js';

export const init: ServerInit = async () => {
	posthog.init(PUBLIC_POSTHOG_KEY, {
		api_host: 'https://us.i.posthog.com',
		defaults: '2025-05-24',
		person_profiles: 'always' // or 'always' to create profiles for anonymous users as well
	});
};
