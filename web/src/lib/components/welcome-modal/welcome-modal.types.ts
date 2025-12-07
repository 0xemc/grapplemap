export type WelcomeChoice = 'beginners-12-week' | 'mg-adcc-2019' | 'basic-intro';

export type WelcomeLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type WelcomeOption = {
    choice: WelcomeChoice;
    title: string;
    level: WelcomeLevel;
    description: string;
};


