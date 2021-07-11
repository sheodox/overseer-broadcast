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
    broadcasterCache.broadcasters.push(broadcaster);
}