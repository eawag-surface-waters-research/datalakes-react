import React, { Component } from "react";
import FileExplorer from "../../components/fileexplorer/fileexplorer";

class Files extends Component {
  render() {
    document.title = "File Explorer - Datalakes";
    return (
      <div style={{height: "600px"}}>
        <FileExplorer
          filelist={
            "https://eawag-data.s3.eu-central-1.amazonaws.com/renkulab.io/lexplore/idronaut-automatic-profiler/filelist.json"
          }
        />
      </div>
    );
  }
}
export default Files;
