export interface Hero {
    id: number;
    name: string;
    localizedName: string;
    primaryAttr: 'str' | 'agi' | 'int';
    attackType: 'Melee' | 'Ranged';
    roles: HeroRole[];
    img: string;
    icon: string;
}

export type HeroRole =
    'Carry' |
    'Support' |
    'Nuker' |
    'Disabler' |
    'Jungler' |
    'Durable' |
    'Escape' |
    'Pusher' |
    'Initiator';