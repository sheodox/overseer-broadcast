import fs from 'fs/promises';
import path from 'path';
const configPath = path.join(__dirname, '../../config.json'),
    configObj = require(configPath);

function saveConfig() {
    return fs.writeFile(configPath, JSON.stringify(configObj, null, 4));
}

export interface BroadcasterConfig {
    name: string;
    id: string;
}

interface ArchivesConfig {
    daysToKeep: number;
}

interface WeatherConfig {
    latitude: number;
    longitude: number;
    apiKey: string;
}

export const getBroadcasters = () => {
    return configObj.broadcasters as BroadcasterConfig[];
};

export const getArchiveSettings = () => {
    return configObj.archives as ArchivesConfig;
};

export const addBroadcaster = (broadcaster: BroadcasterConfig) => {
    configObj.broadcasters.push(broadcaster);
    saveConfig();
}