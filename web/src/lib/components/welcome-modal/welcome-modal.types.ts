export type WelcomeChoice = 'beginners-12-week' | 'lachlan-marcelo' | 'basic-intro';

export type WelcomeLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type WelcomeOption = {
    choice: WelcomeChoice;
    title: string;
    level: WelcomeLevel;
    description: string;
    disabled?: boolean;
};


