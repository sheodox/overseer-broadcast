import {Cache} from "./cache";

export interface BroadcasterConfig {
    name: string;
    id: string;
}

const broadcasterCache = Cache('broadcast');
export const getBroadcasters = () => {
    if (!broadcasterCache.broadcasters) {
        broadcasterCache.broadcasters = [];
    }

    return broadcasterCache.broadcasters as BroadcasterConfig[];
};

export const addBroadcaster = (broadcaster: BroadcasterConfig) => {
    // use an assignment so this automatically saves, otherwise
    // the broadcaster will disappear between restarts
    broadcasterCache.broadcasters = [
        ...broadcasterCache.broadcasters,
        broadcaster
    ];
}