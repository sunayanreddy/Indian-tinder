export interface User {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    preferences: {
        ageRange: [number, number];
        gender: 'male' | 'female' | 'other';
    };
}

export interface Match {
    id: string;
    userId1: string;
    userId2: string;
    createdAt: Date;
}

export interface SwipeAction {
    userId: string;
    action: 'like' | 'dislike';
}