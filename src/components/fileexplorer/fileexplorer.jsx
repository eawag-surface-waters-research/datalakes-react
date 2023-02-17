import React, { Component } from "react";
import folder from "./img/folder.svg";
import download from "../../img/download.svg";
import "./fileexplorer.css";

class Header extends Component {
  transformSize = (size) => {
    if (size < 1000) {
      return `${Math.round(size)} B`;
    } else if (size < 1000000) {
      return `${Math.round((size / 1000) * 10) / 10} kB`;
    }
    if (size < 1000000000) {
      return `${Math.round((size / 1000000) * 10) / 10} MB`;
    } else {
      return `${Math.round((size / 1000000000) * 10) / 10} GB`;
    }
  };
  render() {
    var { dir, headerClick, selected, size } = this.props;
    return (
      <div className="file-explorer-header-inner">
        <div
          className="file-explorer-header-inner-object home"
          onClick={() => headerClick("")}
        >
          data
        </div>
        {dir.map((d, i) => (
          <React.Fragment key={`header_${d}_${i}`}>
            /
            <div
              className="file-explorer-header-inner-object"
              onClick={() => headerClick(d)}
            >
              {d}
            </div>
          </React.Fragment>
        ))}
        <div className="file-explorer-header-inner-selected">
          Download {selected.length} selected files ({this.transformSize(size)})
        </div>
      </div>
    );
  }
}

class ListView extends Component {
  transformSize = (size) => {
    if (size < 1000) {
      return `${Math.round(size)} B`;
    } else if (size < 1000000) {
      return `${Math.round((size / 1000) * 10) / 10} kB`;
    }
    if (size < 1000000000) {
      return `${Math.round((size / 1000000) * 10) / 10} MB`;
    } else {
      return `${Math.round((size / 1000000000) * 10) / 10} GB`;
    }
  };
  render() {
    var { files, objectClick, prefix, dir, selected } = this.props;

    files.sort((a, b) => {
      if (a.children.length === 0 && b.children.length !== 0) {
        return 1;
      } else if (b.children.length === 0 && a.children.length !== 0) {
        return -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
    return (
      <div className="file-explorer-content-list">
        {files.map((f, i) => (
          <div
            className={
              f.children.length > 0
                ? "file-explorer-content-list-object folder"
                : selected.includes(`${dir}/${f.name}`)
                ? "file-explorer-content-list-object selected"
                : "file-explorer-content-list-object"
            }
            title={f.name}
            onClick={() => objectClick(f)}
            key={`list_${f.name}_${i}`}
          >
            <div className="list-object-img">
              {f.children.length > 0 ? (
                <img src={folder} alt="Folder" />
              ) : (
                <a href={`${prefix}/${f.name}`} title="Download file">
                  <img src={download} alt="Download file" />
                </a>
              )}
            </div>
            <div className="list-object-name">{f.name}</div>
            <div className="list-object-size">
              {f.children.length > 0 ? "-" : this.transformSize(f.size)}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

class FileExplorer extends Component {
  state = {
    dir: [],
    selected: [],
    size: 0,
  };
  objectClick = (object) => {
    var { dir, selected, size } = this.state;
    if (object.children.length === 0) {
      let path = `${dir.join("/")}/${object.name}`;
      if (selected.includes(path)) {
        selected = selected.filter((s) => s !== path);
        size = size - object.size;
      } else {
        selected.push(path);
        size = size + object.size;
      }
      this.setState({ selected, size });
    } else {
      dir.push(object.name);
      this.setState({ dir });
    }
  };
  headerClick = (folder) => {
    var { dir } = this.state;
    var new_dir = [];
    if (folder === "") {
      this.setState({ dir: [], selected: [] });
    } else {
      for (let i = 0; i < dir.length; i++) {
        new_dir.push(folder);
        if (dir[i] === folder) {
          break;
        }
      }
      this.setState({ dir: new_dir });
    }
  };
  downloadClick = () => {
    console.log("Download files");
    this.setState({ selected: [], size: 0 });
  };
  render() {
    var { dir, selected, size } = this.state;
    var { prefix } = this.props;

    var files = this.props.file_tree;
    for (let i = 0; i < dir.length; i++) {
      files = files.find((f) => f.name === dir[i]).children;
    }
    return (
      <div className="file-explorer">
        <div className="file-explorer-header">
          <Header
            dir={dir}
            headerClick={this.headerClick}
            downloadClick={this.downloadClick}
            selected={selected}
            size={size}
          />
        </div>
        <div className="file-explorer-content">
          <ListView
            files={files}
            objectClick={this.objectClick}
            prefix={`${prefix}/${dir.join("/")}`}
            dir={dir.join("/")}
            selected={selected}
          />
        </div>
      </div>
    );
  }
}

export default FileExplorer;
