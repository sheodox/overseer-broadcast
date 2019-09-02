import React from 'react';

class Archive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            size: 0
        }
    }
    async componentDidMount() {
        const info = await req('info/archives');
        this.setState(info);
    }
    createList() {
        return this.state.list.map((archive) => {
            return <tr key={archive.file}>
                <td><a href={'/archive/' + archive.file}>{archive.file}</a></td>
                <td>{getPrettyBytes(archive.size)}</td>
            </tr>
        })
    }
    render() {
        return <section>
            <p>{this.state.list.length} files, {getPrettyBytes(this.state.size)} total</p>
            <table id='archive-list'>
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    {this.createList()}
                </tbody>
            </table>
        </section>
    }
}

export default Archive
