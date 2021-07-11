import {getArchiveSettings, getBroadcasters} from "./config";
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import {exec as childProcessExec} from "child_process";
import {promisify} from "util";

const execpromisified = promisify(childProcessExec);

const exec = async (args: string) => {
    try {
        await execpromisified(args);
    }
    catch(e) {
        console.error(e);
    }
};

const HOUR_MS = 60 * 60 * 1000,
    DAY_MS = 24 * HOUR_MS,
    ARCHIVE_PATH = './video/archives',
    THUMBNAIL_PATH = './video/thumbnails';

class StreamArchiver {
    private readonly id: string;
    private readonly camName: string;
    private readonly streamSegmentMax = 20;
    private readonly archiveKeepMaxMS: number;
    private streamSegmentCurrent = 0;
    private lastSegmentHour: null | number = null;

    constructor(id: string, camName: string) {
        this.id = id;
        this.camName = camName;
        const archiveSettings = getArchiveSettings();
        if (!archiveSettings || !archiveSettings.daysToKeep) {
            throw new Error(`must specify 'daysToKeep'`);
        }

        this.archiveKeepMaxMS = archiveSettings.daysToKeep * DAY_MS;

        this.mkdir(`./video/segments-${this.id}`);
        this.mkdir(ARCHIVE_PATH);
        this.mkdir(THUMBNAIL_PATH);
        this.postInit();
    }
    //anything that is initialization related that needs to be done asynchronously so can't be done in the constructor

    async postInit() {
        await this.deleteStaleRecordings();
        await this.generateMissingThumbnails();
    }
    pathInArchives(file: string) {
        return path.join(ARCHIVE_PATH, file);
    }
    pathInThumbnails(file: string) {
        return path.join(THUMBNAIL_PATH, file);
    }
    scheduleDeleteCheck() {
        //figure out how long until tomorrow at 6AM.
        const d = new Date(Date.now() + DAY_MS);
        d.setHours(6);
        d.setMinutes(0);
        d.setSeconds(0);
        this.log(`scheduling delete check for ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`);
        setTimeout(
            this.deleteStaleRecordings.bind(this),
            d.getTime() - Date.now());
    }
    async mkdir(dirPath: string) {
        try {
            await fs.mkdir(dirPath, {recursive: true});
        }
        catch(e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }
    }
    getCurrentArchiveName(date: Date) {
        //get a date based on the current hour
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return `${this.id}-${date.getTime()}`;
    }
    log(msg: string) {
        console.log(`[archiver - ${this.id}] - ${msg}`);
    }
    async archiveSegments(archiveReason: string, archiveDate: Date) {
        this.log(archiveReason);
        const archiveFile = this.getCurrentArchiveName(archiveDate),
            start = Date.now();
        const catArgs = [];
        for (let i = 0; i < this.streamSegmentCurrent; i++) {
            catArgs.push(`-cat ${this.getSegmentFileName(i)}`);
        }
        this.streamSegmentCurrent = 0;
        try {
            await exec(`MP4Box ${catArgs.join(' ')} ${this.pathInArchives(archiveFile)}.mp4`);
            await this.generateThumbnail(archiveFile);

            this.log(`archiving segments took ${Date.now() - start}ms`);
        }
        catch(e) {
            this.log(`error archiving ${archiveFile}`);
            console.error(e);
        }
    }
    async fileExists(file: string) {
        try {
            await fs.stat(file);
            return true;
        }
        catch(e) {
            if (e.code === 'ENOENT') {
                return false;
            }
            throw e;
        }
    }
    async generateMissingThumbnails() {
        const archives = (await fs.readdir(ARCHIVE_PATH))
            .filter(f => f.indexOf(this.id) === 0)
            .map(f => f.replace(/\.mp4$/, ''));

        this.log(`generating any missing thumbnails`);
        let generated = 0;
        for (let i = 0; i < archives.length; i++) {
            generated += (await this.generateThumbnail(archives[i])) ? 1 : 0;
        }
        this.log(`done generating ${generated} missing thumbnails`);
    }

    /**
     * Generate a matching thumbnail for the specified archive
     * @param fileName
     * @returns {Promise<boolean>} - true if a thumbnail was just generated
     */
    async generateThumbnail(fileName: string) {
        const thumbnailPath = this.pathInThumbnails(fileName + '.png'),
            webpThumbnailPath = this.pathInThumbnails(fileName + '.webp'),
            thumbnailExists = await this.fileExists(thumbnailPath);

        if (!thumbnailExists) {
            this.log(`generating thumbnail for ${fileName}`);
            await exec(`ffmpeg -i ${this.pathInArchives(fileName)}.mp4 -ss 00:00:01.000 -filter:v scale="280:-1" -vframes 1 ${thumbnailPath}`);
            await sharp(
                await fs.readFile(thumbnailPath)
            )
                .toFormat('webp')
                .toFile(webpThumbnailPath)

            return true;
        }
        return false;
    }
    getSegmentFileName(segmentNumber: number) {
        return `./video/segments-${this.id}/segment-${segmentNumber}.mp4`;
    }

    /**
     * Called every time a segment of video has been received.
     * This will store the clip and possibly archive clips if enough have been gathered.
     * @param clip - a video/mp4 buffer
     * @returns {Promise<void>}
     */
    async nextSegment(clip: Buffer) {
        const segmentFile = this.getSegmentFileName(this.streamSegmentCurrent++);
        await fs.writeFile(segmentFile, clip)

        const hour = new Date().getHours();
        //if the hour has changed, we need to archive footage now instead of waiting until the end,
        //otherwise we end up having up to several minutes in the wrong archive
        if (typeof this.lastSegmentHour === 'number' && this.lastSegmentHour !== hour) {
            const d = new Date();
            //add it to the previous hour's archive, don't just set the hour or if the date changes it'll be off by 24 hours
            d.setTime(d.getTime() - HOUR_MS);
            this.archiveSegments(`the hour has changed, archiving all old footage immediately`, d);
        }
        this.log(`received segments ${this.streamSegmentCurrent} / ${this.streamSegmentMax}`);
        if (this.streamSegmentCurrent === this.streamSegmentMax) {
            this.archiveSegments(`max of ${this.streamSegmentMax} segments reached for ${this.id}, adding all to the archive`, new Date());
        }
        this.lastSegmentHour = hour;
    }
    async deleteStaleRecordings() {
        const cleanDir = async (dirPath: string) => {
            const files = (await fs.readdir(dirPath)).filter(f => f.indexOf(`${this.id}-`) === 0);

            return Promise.all(files.map(async file => {
                    const ms = file.replace(`${this.id}-`, '')
                            .replace(/\.(mp4|png)$/, ''),
                        d = new Date();
                    d.setTime(parseInt(ms, 10));
                    //set to the beginning of the day, this deletes a full day at a time because delete checks only run daily
                    d.setHours(0);
                    d.setMinutes(0);
                    d.setMilliseconds(0);

                    if (Date.now() - d.getTime() > this.archiveKeepMaxMS) {
                        this.log(`${file} - is from ${d.toLocaleDateString()} which is beyond the keep limit, deleting`);
                        await fs.unlink(path.join(dirPath, file));
                    }
                })
            );
        };

        await cleanDir(ARCHIVE_PATH);
        await cleanDir(THUMBNAIL_PATH);


        this.scheduleDeleteCheck();
    }
}

const archivers: Record<string, StreamArchiver> = {};
getBroadcasters().forEach(({id, name}) => {
    archivers[id] = new StreamArchiver(id, name);
});

module.exports = archivers;
