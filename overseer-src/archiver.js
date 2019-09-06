const config = require('./config'),
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    readdir = util.promisify(fs.readdir),
    child_process = require('child_process'),
    request = require('request');

const DAY_MS = 24 * 60 * 60 * 1000;
class StreamArchiver {
    constructor(ip, camName) {
        if (camName === undefined) {
            throw new Error(`must define a camera 'name' for ${ip}`);
        }
        this.ip = ip;
        this.camName = camName;
        this.streamSegmentMax = 20;
        this.streamSegmentCurrent = 0;
        const archiveSettings = config.getArchiveSettings();
        if (!archiveSettings || !archiveSettings.daysToKeep) {
            throw new Error(`must specify 'daysToKeep'`);
        }
        this.archiveKeepMaxMS = config.getArchiveSettings().daysToKeep * DAY_MS;
        this.mkdir(`./video/segments-${this.camName}`);
        this.mkdir('./video/archives');
        this.deleteStaleRecordings();
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
    getCurrentArchiveName() {
        const d = new Date();
        //get a date based on the current hour
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return `./video/archives/${this.camName}-${d.getTime()}.mp4`
    }
    log(msg) {
        console.log(`[archiver - ${this.camName}] - ${msg}`);
    }
    archiveSegments() {
        this.log(`max of ${this.streamSegmentMax} segments reached for ${this.camName}, adding all to the archive`);
        this.streamSegmentCurrent = 0;
        const archive = this.getCurrentArchiveName(),
            start = Date.now();
        const catArgs = [];
        for (let i = 0; i < this.streamSegmentMax; i++) {
            catArgs.push(`-cat ${this.getSegmentFileName(i)}`);
        }
        child_process
            .exec(`MP4Box ${catArgs.join(' ')} ${archive}`, (err, stdout, stderr) => {
                this.log(`concat new segment took ${Date.now() - start}ms`);
                console.log(stdout);
                console.log(stderr);
            })
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
            if (this.streamSegmentCurrent === this.streamSegmentMax) {
                this.archiveSegments();
            }
        });
        r.pipe(writeStream);
    }
    async deleteStaleRecordings() {
        const archives = (await readdir('./video/archives'));

        archives
            .filter(f => f.indexOf(`${this.camName}-`) === 0)
            .forEach(archive => {
                const ms = archive.replace(`${this.camName}-`, '')
                        .replace('.mp4', ''),
                    d = new Date();
                d.setTime(parseInt(ms, 10));
                //set to the beginning of the day, this deletes a full day at a time because delete checks only run daily
                d.setHours(0);
                d.setMinutes(0);
                d.setMilliseconds(0);
                
                if (Date.now() - d.getTime() > this.archiveKeepMaxMS) {
                    this.log(`${archive} - is beyond the keep limit, deleting`);
                    fs.unlink(path.join('./video/archives', archive), err => {
                        if (err) throw err;
                    })
                }
            });

        this.scheduleDeleteCheck();
    }
}

const archivers = {};
config.getBroadcasters().forEach(b => {
    archivers[b.ip] = new StreamArchiver(b.ip, b.name);
});

module.exports = archivers;