import React, { Component } from "react";
import ProgressBar from "./progressbar";
import axios from "axios";
import { apiUrl } from "../../../src/config.json";
import "./publish.css";
import Loading from "../../components/loading/loading";

class SelectRepo extends React.Component {
  render() {
    var { prevStep, nextStep, loading, repositories, repo, onChangeRepo } =
      this.props;
    if (loading || repositories === undefined) {
      return <Loading />;
    } else {
      var options = [];
      for (var i = 0; i < repositories.length; i++) {
        options.push(
          <option key={i} value={i}>
            {repositories[i].ssh}
          </option>
        );
      }
      return (
        <div className="selectrepo">
          Select the repository from the dropdown that you wish to publish.
          <div className="dropdown">
            <select onChange={onChangeRepo} value={repo}>
              {options}
            </select>
          </div>
          <div className="buttonnav">
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next </button>
          </div>
        </div>
      );
    }
  }
}

class SelectArchive extends React.Component {
  render() {
    var { prevStep, nextStep, archives, archive, onChangeArchive } = this.props;
    var options = [];
    for (var i = 0; i < archives.length; i++) {
      options.push(
        <option key={i} value={i}>
          {archives[i]}
        </option>
      );
    }
    return (
      <div className="selectrepo">
        Select the archive to which you want to publish.
        <div className="dropdown">
          <select onChange={onChangeArchive} value={archive}>
            {options}
          </select>
        </div>
        <div className="buttonnav">
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next </button>
        </div>
      </div>
    );
  }
}

class MetadataReview extends React.Component {
  render() {
    var { prevStep, nextStep, metadata, onChangeMetadata } = this.props;
    return (
      <div className="metadatareview">
        <div className="metadataform">
          <table>
            <tbody>
              <tr>
                <td>Title</td>
                <td>
                  <input
                    value={metadata.title}
                    onChange={(e) => onChangeMetadata("title", e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="buttonnav">
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next </button>
        </div>
      </div>
    );
  }
}

class PublishData extends React.Component {
  render() {
    var { prevStep, nextStep, loading, archive, metadata, error } = this.props;

    var table = [];
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== "") {
        table.push(
          <tr>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        );
      }
    }
    return (
      <div className="publishdata">
        <p>
          Publish dataset <b>{metadata.title}</b> to archive <b>{archive}</b>
        </p>
        <p>
          <b>Metadata Summary</b>
        </p>
        <table>
          <tbody>{table}</tbody>
        </table>
        <p>
          You will be automatically redirected to the archived data in Eric
          Internal (Eawag network required for access). Datasets may not be
          immediatly availble as they require time to upload. If you have
          selected to make this a public resource (ERIC Open) you request
          requires approval and you will be notified when your dataset has
          recieved a DOI and been made public.
        </p>
        <p>
          Once published, changes to ERIC Internal packages can be made by
          request to datalakes-svc@eawag.ch
        </p>
        {error !== "" && <div className="errormessage">{error}</div>}
        {loading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <div className="buttonnav">
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Publish </button>
          </div>
        )}
      </div>
    );
  }
}

class Publish extends Component {
  state = {
    step: 1,
    allowedStep: [1, 0, 0, 0],
    loading: true,
    repo: "19",
    archives: [
      "ERIC Internal- Eawag Research Data (Only Eawag)",
      "ERIC OPEN - Eawag Research Data (Public)",
    ],
    archive: 0,
    error: "",
    metadata: {
      repo_name: "",
      namespace: "",
      repo_views: [],
      repo_view_names: [],
      _ckan_phase: "dataset_new_1",
      pkg_name: "",
      publicationlink: "",
      open_data: "true",
      embargo: "",
      title: "",
      "author-1": "",
      "author-2": "",
      "author-3": "",
      notes: "",
      tags_string: "",
      variables: [],
      substances: "",
      substances_generic: "",
      taxa: "",
      taxa_generic: "",
      systems: "",
      "timerange-1": "",
      spatial: "",
      geographic_name: "",
      owner_org: "dc50d0f2-da37-4a76-bb9b-806b841a2d59",
      private: "True",
      status: "complete",
      review_level: "general",
      reviewed_by: "datalakes-svc",
      maintainer: "datalakes-svc",
      usage_contact: "datalakes-svc",
      "notes-2": "",
      has_part: "",
      is_part_of: "",
      id_external: "",
      save: "",
    },
  };

  processSSH = (ssh) => {
    //git@renkulab.io:lexplore/thetis.git
    if (ssh.includes("renkulab.io")) {
      var parts = ssh.split(":")[1].split(".git")[0].split("/");
      return { repo_name: parts[1], namespace: parts[0] };
    } else {
      throw new Error("ProcessSSH only defined for renkulab");
    }
  };

  onChangeArchive = (event) => {
    this.setState({ archive: event.target.value });
  };

  onChangeRepo = (event) => {
    this.setState({ repo: event.target.value });
  };

  onChangeMetadata = (parameter, value) => {
    var { metadata } = this.state;
    metadata[parameter] = value;
    this.setState({ metadata });
  };

  cfl = (string) => {
    const words = string.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(" ");
  };

  getPerson = (selectiontables, author_id) => {
    return selectiontables.persons.filter((p) => p.id === author_id)[0];
  };

  validateSelectRepo = () => {
    const { step, repo, datasets, repositories, metadata, selectiontables } =
      this.state;
    var repo_id = repositories[repo].id;
    var selected_datasets = datasets.filter(
      (d) => d.repositories_id === repo_id
    );
    var { repo_name, namespace } = this.processSSH(repositories[repo].ssh);
    var repo_views = [];
    var repo_view_names = [];
    var authors = [];
    var latlng = [];
    var lakes = [];
    for (var ds of selected_datasets) {
      repo_views.push(ds.id);
      repo_view_names.push(ds.title);
      authors.push(ds.persons_id);
      if (ds.lakes !== 56) {
        lakes.push(ds.lakes_id);
      }
      if (ds.latitude !== -9999) {
        latlng.push(String(ds.latitude) + "," + String(ds.longitude));
      }
    }
    authors = [...new Set(authors)];
    latlng = [...new Set(latlng)];
    lakes = [...new Set(lakes)];
    lakes = lakes.map(
      (l) => selectiontables.lakes.filter((ll) => l === ll.id)[0].name
    );

    for (var i = 0; i < authors.length; i++) {
      var person = this.getPerson(selectiontables, authors[i]);
      metadata["author-" + (i + 1)] = person.name;
    }

    metadata["repo_name"] = repo_name;
    metadata["namespace"] = namespace;
    metadata["repo_views"] = repo_views;
    metadata["repo_view_names"] = repo_view_names;
    metadata["title"] = this.cfl(repo_name.replaceAll("-", " "));
    metadata["geographic_name"] = lakes;

    this.setState({ allowedStep: [1, 2, 0, 0], step: step + 1, metadata });
  };

  validateSelectArchive = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 3, 0], step: step + 1 });
  };

  validateMetadataReview = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 3, 4], step: step + 1 });
  };

  publishData = async () => {
    this.setState(
      {
        error: "",
        loading: true,
      },
      this.afterLoading
    );
  };

  afterLoading = async () => {
    var { metadata } = this.state;
    try {
      var { data: link } = await axios.post(
        "https://api.meteolakes.ch/api/eric",
        metadata
      );
      window.location.href = link;
    } catch (error) {
      console.error(error.response);
      this.setState({ loading: false, error: error.message });
    }
  };

  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1,
    });
  };

  setStep = (step) => {
    if (step !== 0) {
      this.setState({ step });
    }
  };

  async componentDidMount() {
    const { data: selectiontables } = await axios.get(
      apiUrl + "/selectiontables"
    );
    const { data: repositories } = await axios.get(apiUrl + "/repositories");
    var { data: datasets } = await axios.get(apiUrl + "/datasets");
    var { data: parameters } = await axios.get(apiUrl + "/datasetparameters");
    this.setState({
      repositories,
      datasets,
      parameters,
      selectiontables,
      loading: false,
    });
  }

  render() {
    document.title = "Publish - Datalakes";
    var {
      step,
      allowedStep,
      loading,
      repo,
      repositories,
      archives,
      archive,
      metadata,
      error,
    } = this.state;
    switch (step) {
      default:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <SelectRepo
              loading={loading}
              nextStep={this.validateSelectRepo}
              prevStep={this.prevStep}
              repositories={repositories}
              repo={repo}
              onChangeRepo={this.onChangeRepo}
            />
          </React.Fragment>
        );
      case 1:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <SelectRepo
              loading={loading}
              nextStep={this.validateSelectRepo}
              prevStep={this.prevStep}
              repositories={repositories}
              repo={repo}
              onChangeRepo={this.onChangeRepo}
            />
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <SelectArchive
              nextStep={this.validateSelectArchive}
              prevStep={this.prevStep}
              archives={archives}
              archive={archive}
              onChangeArchive={this.onChangeArchive}
            />
          </React.Fragment>
        );
      case 3:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <MetadataReview
              nextStep={this.validateMetadataReview}
              prevStep={this.prevStep}
              metadata={metadata}
              onChangeMetadata={this.onChangeMetadata}
            />
          </React.Fragment>
        );
      case 4:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <PublishData
              nextStep={this.publishData}
              prevStep={this.prevStep}
              loading={loading}
              metadata={metadata}
              archive={archives[archive]}
              error={error}
            />
          </React.Fragment>
        );
    }
  }
}

export default Publish;
