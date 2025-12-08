import type { WelcomeOption } from './welcome-modal.types';

export const WELCOME_OPTIONS: WelcomeOption[] = [

    {
        choice: 'basic-intro',
        title: '🧭 Basic Intro',
        level: 'Beginner',
        description: 'A basic sequence to get you oriented with how the graph works.'
    },
    {
        choice: 'beginners-12-week',
        title: '📘 12-Week Beginners Curriculum',
        level: 'Intermediate',
        description:
            'A structured plan introducing fundamentals over twelve weeks.'
    },
    {
        choice: 'mg-adcc-2011',
        title: '🥋 Marcelo Garcia ADCC 2011 (TBC)',
        level: 'Advanced',
        disabled: true,
        description:
            `An analysis of Marcelo's 2011 ADCC run.`
    }
];


