import React, { Component } from "react";
import "./loaddatasets.css";

class LoadDataSets extends Component {
  downloadProgress = (data) => {
    var len = data.length;
    var count = 0;
    for (var i = 0; i < len; i++) {
      if (data[i] === 0) count++;
    }
    count = len - count;
    return count;
  };

  render() {
    var { data } = this.props;
    var count = this.downloadProgress(data);

    return (
      <div className="loaddatasets">
        {count < data.length && (
          <div className="linegraph-file">
            {count} of {data.length} files in memory.
            {/*<button className="read-button" onClick={() => downloadData()}>
                Preload full dataset
          </button>*/}
          </div>
        )}
      </div>
    );
  }
}

export default LoadDataSets;
