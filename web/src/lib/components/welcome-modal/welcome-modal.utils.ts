import type { WelcomeLevel } from './welcome-modal.types';

export function badgeColorFor(level: WelcomeLevel): 'green' | 'amber' | 'red' {
    if (level === 'Beginner') return 'green';
    if (level === 'Intermediate') return 'amber';
    return 'red';
}

export function isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
}


