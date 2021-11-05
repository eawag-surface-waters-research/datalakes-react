import React, { Component } from "react";
import file from "./img/file.svg";
import folder from "./img/folder.svg";
import "./fileselector.css";

class Folder extends Component {
  state = {
    open: this.props.open ? true : false,
  };

  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  render() {
    var { name, children } = this.props;
    var { open } = this.state;
    var split = name.split("/");
    var outname = split[split.length - 1];
    return (
      <div className="folder">
        <div>
          <div className="dropdown" onClick={this.toggle}>
            {open ? "\u25BC" : "\u25BA"}
          </div>
          <img src={folder} alt="folder" />
          {outname}
        </div>
        {open && <div>{children}</div>}
      </div>
    );
  }
}

class File extends Component {
  state = {};
  render() {
    var { name, data, onChange } = this.props;
    var split = name.split("/");
    var outname = split[split.length - 1];
    var checked = data.includes(name);
    return (
      <div className="file">
        <input
          type="checkbox"
          className="file-checkbox"
          id={name}
          title={checked ? "Remove file" : "Include file"}
          onChange={onChange}
          checked={checked}
        />
        <img src={file} alt="file" />
        {outname}
      </div>
    );
  }
}

class FileSelector extends Component {
  state = {};

  longestArray = (arr) => {
    var len = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].length > len) len = arr[i].length;
    }
    return len;
  };

  updateArray = (event) => {
    var { accompanyingdata, handleAccompanyingData } = this.props;
    var id = event.target.id;
    if (accompanyingdata.includes(id)) {
      accompanyingdata = accompanyingdata.filter((ad) => ad !== id);
    } else {
      accompanyingdata.push(id);
    }
    handleAccompanyingData(accompanyingdata);
  };

  getChildren = (name, files) => {
    var { accompanyingdata } = this.props;
    var nameLength = name.split("/").length;
    var shortFiles = files.map((f) => {
      var split = f.split("/");
      var type = "folder";
      if (split.length === nameLength + 1) {
        type = "file";
      }
      return [split.slice(0, nameLength + 1).join("/"), type];
    });
    var children = shortFiles.filter((f) => f[0].includes(name));
    var set = new Set(children.map(JSON.stringify));
    var uniqueChildren = Array.from(set).map(JSON.parse);
    var out = [];
    for (var i = 0; i < uniqueChildren.length; i++) {
      if (uniqueChildren[i][1] === "file") {
        out.push(
          <File
            key={uniqueChildren[i][0]}
            name={uniqueChildren[i][0]}
            data={accompanyingdata}
            onChange={this.updateArray}
          />
        );
      } else {
        out.push(
          <Folder
            key={uniqueChildren[i][0]}
            name={uniqueChildren[i][0]}
            children={this.getChildren(uniqueChildren[i][0], files)}
          />
        );
      }
    }
    return out;
  };

  render() {
    var { allFiles } = this.props;
    allFiles = JSON.parse(JSON.stringify(allFiles));
    var files = allFiles.map((af) => af.split("/"));
    var tree;
    if (files.length > 0) {
      var firstFolder = files[0].slice(0, 3).join("/");
      tree = (
        <Folder
          name={firstFolder}
          children={this.getChildren(firstFolder, allFiles)}
          open={true}
        />
      );
    } else {
      tree = null;
    }

    return (
      <div className="fileselector" title="Select files">
        {tree}
      </div>
    );
  }
}

export default FileSelector;
