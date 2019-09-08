const config = require('./config'),
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    readdir = util.promisify(fs.readdir),
    stat = util.promisify(fs.stat),
    child_process = require('child_process'),
    execpromisified = util.promisify(child_process.exec),
    request = require('request');

const exec = async (...args) => {
    try {
        await execpromisified(...args);
    }
    catch(e) {
        console.error(e);
    }
};


const HOUR_MS = 60 * 60 * 1000,
    DAY_MS = 24 * HOUR_MS;

class StreamArchiver {
    constructor(ip, camName) {
        if (camName === undefined) {
            throw new Error(`must define a camera 'name' for ${ip}`);
        }
        this.ip = ip;
        this.camName = camName;
        this.streamSegmentMax = 20;
        this.streamSegmentCurrent = 0;
        this.lastSegmentHour = null;
        const archiveSettings = config.getArchiveSettings();
        if (!archiveSettings || !archiveSettings.daysToKeep) {
            throw new Error(`must specify 'daysToKeep'`);
        }
        this.archiveKeepMaxMS = config.getArchiveSettings().daysToKeep * DAY_MS;
        this.mkdir(`./video/segments-${this.camName}`);
        this.archivePath = './video/archives';
        this.mkdir(this.archivePath);
        this.thumbnailPath = './video/thumbnails';
        this.mkdir('./video/thumbnails');
        this.postInit();
    }
    //anything that is initialization related that needs to be done asynchronously so can't be done in the constructor
    async postInit() {
        await this.deleteStaleRecordings();
        await this.generateMissingThumbnails();
    }
    pathInArchives(file) {
        return path.join(this.archivePath, file);
    }
    pathInThumbnails(file) {
        return path.join(this.thumbnailPath, file);
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
    mkdir(dirPath) {
        try {
            fs.mkdirSync(dirPath);
        }catch(e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }
    }
    getCurrentArchiveName(date) {
        //get a date based on the current hour
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return `${this.camName}-${date.getTime()}`;
    }
    log(msg) {
        console.log(`[archiver - ${this.camName}] - ${msg}`);
    }
    async archiveSegments(archiveReason, archiveDate) {
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
    async fileExists(file) {
        try {
            await stat(file);
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
        const archives = (await readdir(this.archivePath))
            .filter(f => f.indexOf(this.camName) === 0)
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
    async generateThumbnail(fileName) {
        const thumbnailPath = this.pathInThumbnails(fileName + '.png');
        const thumbnailExists = await this.fileExists(thumbnailPath);
        if (!thumbnailExists) {
            this.log(`generating thumbnail for ${fileName}`);
            await exec(`ffmpeg -i ${this.pathInArchives(fileName)}.mp4 -ss 00:00:01.000 -filter:v scale="280:-1" -vframes 1 ${thumbnailPath}`);
            return true;
        }
        return false;
    }
    getSegmentFileName(segmentNumber) {
        return `./video/segments-${this.camName}/segment-${segmentNumber}.mp4`;
    }
    async nextSegment() {
        const segmentFile = this.getSegmentFileName(this.streamSegmentCurrent++),
            writeStream = fs.createWriteStream(segmentFile),
            url = `http://${this.ip}/stream_dashinit.mp4`,
            r = request
                .get(url)
                .on('error', () => {
                    this.log(`error connecting to ${url}`);
                });
        writeStream.on('finish', async () => {
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
                this.archiveSegments(`max of ${this.streamSegmentMax} segments reached for ${this.camName}, adding all to the archive`, new Date());
            }
            this.lastSegmentHour = hour;
        });
        r.pipe(writeStream);
    }
    async deleteStaleRecordings() {
        const cleanDir = async p => {
            const files = await readdir(p);
            files
                .filter(f => f.indexOf(`${this.camName}-`) === 0)
                .forEach(file => {
                    const ms = file.replace(`${this.camName}-`, '')
                            .replace(/\.(mp4|png)$/, ''),
                        d = new Date();
                    d.setTime(parseInt(ms, 10));
                    //set to the beginning of the day, this deletes a full day at a time because delete checks only run daily
                    d.setHours(0);
                    d.setMinutes(0);
                    d.setMilliseconds(0);

                    if (Date.now() - d.getTime() > this.archiveKeepMaxMS) {
                        this.log(`${file} - is from ${d.toLocaleDateString()} which is beyond the keep limit, deleting`);
                        fs.unlink(path.join(p, file), err => {
                            if (err) throw err;
                        })
                    }
                });
        };

        await cleanDir(this.archivePath);
        await cleanDir(this.thumbnailPath);


        this.scheduleDeleteCheck();
    }
}

const archivers = {};
config.getBroadcasters().forEach(b => {
    archivers[b.ip] = new StreamArchiver(b.ip, b.name);
});

module.exports = archivers;
