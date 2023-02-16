import React, { Component } from "react";
import { FullFileBrowser } from "chonky";
import axios from "axios";

class FileExplorer extends Component {
  state = {
    files: [null, null, null],
  };
  async componentDidMount() {
    const { data } = await axios.get(this.props.filelist);
    const files = [];
    

    /**console.log(data);

    for (let i = 0; i < data.files.length; i++) {
      files.push({
        id: data.files[i].k,
        name: data.files[i].k.slice(
          data.files[i].k.lastIndexOf("/") + 1,
          data.files[i].k.length
        ),
        size: data.files[i].s,
      });
    }
    for (let i = 0; i < data.folders.length; i++) {
      files.push({
        id: data.folders[i],
        name: data.folders[i].slice(
          data.folders[i].lastIndexOf("/") + 1,
          data.folders[i].length
        ),
        isDir: true,
      });
    }**/
    this.setState({ files });
  }
  render() {
    return <FullFileBrowser files={this.state.files} />;
  }
}

export default FileExplorer;
