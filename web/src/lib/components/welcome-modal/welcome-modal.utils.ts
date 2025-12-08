import type { WelcomeChoice, WelcomeLevel } from './welcome-modal.types';

export function badgeColorFor(level: WelcomeLevel): 'green' | 'amber' | 'red' {
    if (level === 'Beginner') return 'green';
    if (level === 'Intermediate') return 'amber';
    return 'red';
}

export function isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

export function buildWelcomeHref(choice: WelcomeChoice): string {
    if (choice === 'basic-intro') {
        const params = new URLSearchParams({ file: '1' });
        return `/graph?${params.toString()}`;
    }
    if (choice === 'beginners-12-week') {
        const params = new URLSearchParams();
        params.set('file', '2');
        params.set('groupTag', 'week');
        params.append('tag', 'week 1');
        return `/graph?${params.toString()}`;
    }
    return '#';
}


