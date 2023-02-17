import React, { Component } from "react";
import axios from "axios";
import FileExplorer from "../../components/fileexplorer/fileexplorer";

class Files extends Component {
  state = {
    file_tree: [],
  };
  async componentDidMount() {
    const { data } = await axios.get(
      "https://eawag-data.s3.eu-central-1.amazonaws.com/renkulab.io/lexplore/idronaut-automatic-profiler/filelist.json"
    );

    let paths = data.files;

    let file_tree = [];
    let level = { file_tree };

    paths.forEach((path) => {
      let arr = path.k.split("/");
      arr.reduce((r, name, i, a) => {
        if (!r[name]) {
          r[name] = { file_tree: [] };
          r.file_tree.push({
            name,
            size: i === arr.length - 1 ? path.s : 0,
            children: r[name].file_tree,
          });
        }

        return r[name];
      }, level);
    });
    this.setState({ file_tree });
  }
  render() {
    document.title = "File Explorer - Datalakes";
    const { file_tree } = this.state;
    return (
      <div style={{ height: "600px" }}>
        <FileExplorer
          file_tree={file_tree}
          prefix={
            "https://eawag-data.s3.eu-central-1.amazonaws.com/renkulab.io/lexplore/idronaut-automatic-profiler/data"
          }
        />
      </div>
    );
  }
}
export default Files;
