import React from 'react';
import If from './If';
import lsCache from "./lsCache";

const settings = lsCache('settings');

class Archive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lists: [],
            totalArchives: 0,
            size: 0,
            recordedDates: []
        }
    }
    async componentDidMount() {
        const info = await req('info/archives'),
            broadcasters = await req('info/broadcasts');
        this.setState(Object.assign({
            totalArchives: info.list.length,
            size: info.size
        }, this.sortArchives(info.list, broadcasters.map(b => b.name))));
    }
    sortArchives(list, broadcasterNames) {
        const sortedLists = [],
            recordedDates = new Set();
        broadcasterNames.forEach(broadcaster => {
            const archives = list
                //get only this broadcaster's archives
                .filter(archive => archive.file.indexOf(broadcaster) === 0)
                //parse a date object out of the file name
                .reduce((archivesByDay, archive) => {
                    let ms = archive.file
                        .replace(broadcaster + '-', '')
                        .replace(/\.mp4$/, '');
                    const d = new Date();
                    d.setTime(parseInt(ms, 10));
                    archive.date = d;
                    
                    const dateStr = d.toLocaleDateString();
                    if (!archivesByDay[dateStr]) {
                        archivesByDay[dateStr] = {
                            archives: [archive],
                            date: d
                        };
                    }
                    else {
                        archivesByDay[dateStr].archives.push(archive);
                    }
                    
                    recordedDates.add(dateStr);
                    return archivesByDay;
                }, {});
            //make sure everything is sorted properly within that date
            recordedDates.forEach(date => {
                if (archives[date]) {
                    archives[date].archives = archives[date].archives.sort((a, b) => a.date.getTime() - b.date.getTime());
                }
            });
            sortedLists.push({
                broadcaster,
                dates: archives
        })
        });
        return {recordedDates: Array.from(recordedDates), lists: sortedLists};
    }
    render() {
        if (!this.state.lists.length) {
            //todo loading indicator?
            return null;
        }
        return <section id="archive">
            <p>total size {getPrettyBytes(this.state.size)} in {this.state.totalArchives} archives</p>
            <ArchiveViewer recordedDates={this.state.recordedDates} archives={this.state.lists}/>
        </section>
    }
}

class ArchiveViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedArchive: {},
            selectedDate: this.props.recordedDates[this.props.recordedDates.length - 1]
        };
    }
    selectDay(dateStr) {
        this.setState({
            selectedDate: dateStr
        })
    }    
    view(archive, e) {
        //don't break hash routing
        e.preventDefault();
        
        this.setState({
            selectedArchive: archive
        });
        
        //scroll up to the top
        window.scrollTo(0, 0);
    }
    render() {
        const dateSelector = this.props.recordedDates.map((dateStr) => {
            return <button onClick={this.selectDay.bind(this, dateStr)} key={dateStr} disabled={dateStr === this.state.selectedDate}>{dateStr}</button>
        });
        
        const recordingLists = this.props.archives.map(list => {
            const dayList = list.dates[this.state.selectedDate];
            if (!dayList) {
                return null;
            }
            const totalSize = dayList.archives.reduce((sum, {size}) => {return sum + size}, 0);
            return <div key={list.broadcaster} className="archive-list">
                <h2>{list.broadcaster}</h2>
                <p>{getPrettyBytes(totalSize)} total</p>
                <ul>
                    {dayList.archives.map((archive) => {
                        const anchorStyles = {
                            backgroundImage: `url(thumbnail/${archive.file})`
                        };
                        return <li key={archive.file}>
                            <a className="archive-select-link" style={anchorStyles} href='#' onClick={this.view.bind(this, archive)}>
                                <span className="archive-time">{archive.date.toLocaleTimeString()}</span>
                                <span className="archive-size">{getPrettyBytes(archive.size)}</span>
                            </a>
                        </li>;
                    })}
                </ul>
            </div>
        });
        
        const videoSrc = 'archive/' + this.state.selectedArchive.file;
        return <section>
            <If renderWhen={!!this.state.selectedArchive.file}>
                <video controls src={videoSrc} />
                <div className="video-info">
                    <h2>{(this.state.selectedArchive.date || new Date()).toLocaleString()}</h2>
                    <p>{this.state.selectedArchive.file}</p>
                    {!settings.touchpadMode && <p><a download={this.state.selectedArchive.file + '.mp4'} href={videoSrc}>download ({getPrettyBytes(this.state.selectedArchive.size)})</a></p>}
                </div>
            </If>
            <div className="date-selector">
                {dateSelector}
            </div>
            <div className="archive-selector">
                {recordingLists}
            </div>
        </section>
    }

}

export default Archive
