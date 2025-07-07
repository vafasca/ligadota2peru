export interface Notification {
    id?: string;
    userId: string;
    title: string;
    message: string;
    description?: string;
    type: 'challenge' | 'system';
    challengeId?: string;
    read: boolean;
    createdAt: Date;
}