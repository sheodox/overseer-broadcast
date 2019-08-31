const config = require('./config'),
    fs = require('fs'),
    child_process = require('child_process'),
    request = require('request');

class StreamArchiver {
    constructor(ip, camName) {
        this.ip = ip;
        this.camName = camName;
        this.streamSegmentMax = 20;
        this.streamSegmentCurrent = 0;
        this.mkdir(`./video/segments-${this.camName}`)
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
        const d = new Date(),
            pad = num => num < 10 ? '0' + num : num,
            dateStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
            hour = d.getHours();
        let hourStr = hour > 13 ? hour - 12 : hour;
        hourStr += hour >= 12 ? 'pm' : 'am';
        return `./video/archive-${this.camName}-${dateStr}-${hourStr}.mp4`
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
}

const archivers = {};
config.getBroadcasters().forEach(b => {
    archivers[b.ip] = new StreamArchiver(b.ip, b.name);
});

module.exports = archivers;
