import React, { Component } from "react";
import { FullFileBrowser } from "chonky";
import axios from "axios";

class FileExplorer extends Component {
  state = {
    files: [],
  };
  async componentDidMount() {
    const { data } = await axios.get(this.props.filelist);
    const files = data.map((d) => {
      return { id: d.k, name: d.k };
    });
    this.setState({ files });
  }
  render() {
    return <FullFileBrowser files={this.state.files} />;
  }
}

export default FileExplorer;
