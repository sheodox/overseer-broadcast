import {writable} from "svelte/store";

export const archiveSize = writable(0);
export const archivesByDay = writable([]);
export const archives = writable([], set => {
    fetch('/relay/archives')
        .then(res => res.json())
        .then(archives => {
            archiveSize.set(archives.size);

            const archiveDayBuckets = [];
            archives.list.forEach(archive => {
                const day = new Date(archive.date).toLocaleDateString();
                let dayOfArchives = archiveDayBuckets.find(({date}) => date === day);

                if (!dayOfArchives) {
                    //keeping 'time' around to make sorting the days in ascending order easy later,
                    //but 'date' is used for collecting archives from the same day
                    dayOfArchives = {date: day, time: day.date, clips: []};
                    archiveDayBuckets.push(dayOfArchives);
                }
                dayOfArchives.clips.push(archive);
            })
            archiveDayBuckets.sort((a, b) => {
                return a.time - b.time;
            })
            set(archives.list);
            archivesByDay.set(archiveDayBuckets)
        })
});

export const getPrettyBytes = (bytes=0) => {
    let size, unit;
    const kb = 1024,
        mb = 1024 * kb,
        gb = 1024 * mb,
        checkUnit = (base, u) => {
            if (bytes / base > 1) {
                size = bytes / base;
                unit = u;
                return true;
            }
        };

    [[gb, 'GB'], [mb, 'MB'], [kb, 'KB']].some(info => checkUnit(...info));
    if (!unit) {
        size = bytes;
        unit = 'Bytes';
    }

    return `${size.toFixed(1)} ${unit}`;
};