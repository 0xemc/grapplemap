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
        choice: 'lachlan-marcelo',
        title: '🥋 Lachlan Marcelo One FC Analysis',
        level: 'Advanced',
        description:
            `An short analysis of the Lachie Lock at One FC 38`
    }
];


