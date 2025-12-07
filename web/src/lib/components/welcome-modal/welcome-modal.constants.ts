import type { WelcomeOption } from './welcome-modal.types';

export const WELCOME_OPTIONS: WelcomeOption[] = [

    {
        choice: 'basic-intro',
        title: '🧭 Basic Intro',
        level: 'Beginner',
        description: 'A quick tour to get you oriented with the graph, positions, and transitions.'
    },
    {
        choice: 'beginners-12-week',
        title: '📘 12-Week Beginners Curriculum',
        level: 'Intermediate',
        description:
            'A structured plan introducing fundamentals over twelve weeks with steady progression.'
    },
    {
        choice: 'mg-adcc-2019',
        title: '🥋 Marcelo Garcia ADCC 2019 Sequence',
        level: 'Advanced',
        description:
            'Explore high-level sequences inspired by Marcelo Garcia’s ADCC 2019 performances.'
    }
];


