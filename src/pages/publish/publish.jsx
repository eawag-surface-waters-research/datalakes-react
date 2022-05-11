import React, { Component } from "react";
import ProgressBar from "./progressbar";
import Select from "react-select";
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
  onChangeMetadataWrapper = (e) => {
    this.props.onChangeMetadata(e.target.id, e.target.value);
  };

  onChangeMinDate = (e) => {
    var { metadata, onChangeMetadata } = this.props;
    onChangeMetadata(
      "timerange-1",
      e.target.value + " TO " + metadata["timerange-1"].split(" TO ")[1]
    );
  };

  onChangeMaxDate = (e) => {
    var { metadata, onChangeMetadata } = this.props;
    onChangeMetadata(
      "timerange-1",
      metadata["timerange-1"].split(" TO ")[0] + " TO " + e.target.value
    );
  };

  render() {
    var {
      prevStep,
      nextStep,
      metadata,
      onChangeMetadata,
      addAuthor,
      variables,
      onChangeVariables,
      error,
      variable_options,
    } = this.props;

    var times = metadata["timerange-1"].split(" TO ");
    var minDate = times[0];
    var maxDate = times[1];

    var authors = [];
    for (var i = 1; i < 100; i++) {
      if ("author-" + i in metadata) {
        authors.push(
          <tr key={"author-" + i}>
            <th>Author-{i}</th>
            <td>
              <input
                type="text"
                value={metadata["author-" + i]}
                id={"author-" + i}
                onChange={this.onChangeMetadataWrapper}
                placeholder="Person <person@eawag.ch>"
              />
            </td>
            <td>
              Main authors for the dataset.{" "}
              <div className="addauthor" onClick={addAuthor}>
                Add author.
              </div>
            </td>
          </tr>
        );
      } else {
        break;
      }
    }

    var r = (
      <div className="required" title="This field is required">
        *
      </div>
    );

    return (
      <div className="metadatareview">
        <div className="metadataform">
          <table>
            <tbody>
              <tr>
                <th style={{ width: "15%" }}>{r}Title</th>
                <td style={{ width: "40%" }}>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => onChangeMetadata("title", e.target.value)}
                  />
                </td>
                <td style={{ width: "40%" }}>
                  Descriptive title for the dataset.
                </td>
              </tr>
              {authors}
              <tr>
                <th>{r}Abstract</th>
                <td>
                  <textarea
                    value={metadata.notes}
                    onChange={(e) => onChangeMetadata("notes", e.target.value)}
                    placeholder="A description of the package."
                  />
                </td>
                <td>
                  A brief narrative summary of the content of the package that
                  could also include a summary of the intentions with which the
                  package was developed. In case you are creating a publication
                  data package, i.e., a package that supplies data for a
                  specific publication, copying & pasting the publication's
                  abstract here is a good start.
                </td>
              </tr>
              <tr>
                <th>{r}Timerange</th>
                <td>
                  <p>
                    From:{" "}
                    <input
                      type="date"
                      defaultValue={minDate}
                      onChange={this.onChangeMinDate}
                    />
                  </p>
                  <p>
                    To:{"    "}
                    <input
                      type="date"
                      defaultValue={maxDate}
                      onChange={this.onChangeMaxDate}
                    />
                  </p>
                </td>
                <td>
                  Denote the timerange(s) to which the data in the package
                  relates, i.e. when the state of the system under consideration
                  was examined. Usually that would be the time(s) at which
                  field-measurements were made or samples were taken.
                </td>
              </tr>
              <tr>
                <th>{r}Keywords</th>
                <td>
                  <input
                    type="text"
                    value={metadata.tags_string}
                    onChange={(e) =>
                      onChangeMetadata("tags_string", e.target.value)
                    }
                    placeholder="Datalakes, ADCP, Lexplore"
                  />
                </td>
                <td>
                  <p>Comma seperated values.</p>Just like the keywords of a
                  scientific publication. In case you are creating a publication
                  data package, i.e., a package the supplies data for a specific
                  publication, you should copy & paste the publication's
                  keywords here.
                </td>
              </tr>
              <tr>
                <th>{r}Variables</th>
                <td>
                  <Select
                    isMulti
                    name="variables"
                    value={metadata.variables.map((v) => {
                      return { value: v, label: v };
                    })}
                    options={variable_options.map((v) => {
                      return { value: v, label: v };
                    })}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={onChangeVariables}
                  />
                </td>
                <td>
                  <p>
                    Select variables from the dropdown. Below is a list from the
                    datasets.
                  </p>
                  {variables.map((v) => (
                    <div key={v.name}>
                      {v.name} ({v.unit})
                    </div>
                  ))}
                  <p>
                    If variables are missing please email rdm@eawag.ch to
                    request they be added.
                  </p>
                </td>
              </tr>
              <tr>
                <th>Substances (scientific names)</th>
                <td>
                  <textarea
                    value={metadata.substances}
                    onChange={(e) =>
                      onChangeMetadata("substances", e.target.value)
                    }
                    placeholder="ethanol (InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3)"
                  />
                </td>
                <td>
                  <p>One value per line.</p>
                  List the chemical substances (molecules, ions, elements) that
                  are the subject of this package. Substances should be denoted
                  by an established name and their IUPAC International Chemical
                  Identifier (InChI) in parentheses like so: ethanol
                  (InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3)
                </td>
              </tr>
              <tr>
                <th>Substances (generic terms)</th>
                <td>
                  <textarea
                    value={metadata.substances_generic}
                    onChange={(e) =>
                      onChangeMetadata("substances_generic", e.target.value)
                    }
                    placeholder="herbicide&#10;metabolites&#10;nutrients&#10;organic matter&#10;microplastics"
                  />
                </td>
                <td>
                  <p>One value per line.</p>
                  List umbrella terms and commonly understood descriptions of
                  substances and substance classes which are the subject of this
                  package.
                </td>
              </tr>
              <tr>
                <th>Taxa (scientific names)</th>
                <td>
                  <textarea
                    value={metadata.taxa}
                    onChange={(e) => onChangeMetadata("taxa", e.target.value)}
                    placeholder="Dictyosphaerium libertatis&#10;Nodularia moravica&#10;Phodopus sungorus&#10;Solanum tuberosum"
                  />
                </td>
                <td>
                  <p>One value per line.</p>
                  List the taxonomic names that are the subject of this package,
                  e.g. the species, genera, and/or families. Taxa should be
                  denoted by the accepted scientific name.
                </td>
              </tr>
              <tr>
                <th>Organisms (generic terms)</th>
                <td>
                  <textarea
                    value={metadata.taxa_generic}
                    onChange={(e) =>
                      onChangeMetadata("taxa_generic", e.target.value)
                    }
                    placeholder="fish&#10;algae&#10;invertebrates&#10;beetles"
                  />
                </td>
                <td>
                  <p>One value per line.</p>
                  List umbrella terms and commonly understood descriptions of
                  organisms and groups of organisms which are the subject of
                  this package.
                </td>
              </tr>
              <tr>
                <th>Systems</th>
                <td>
                  <textarea
                    value={metadata.systems}
                    onChange={(e) =>
                      onChangeMetadata("systems", e.target.value)
                    }
                    placeholder="river&#10;lake&#10;sewage system&#10;metropolitan area&#10;lab"
                  />
                </td>
                <td>
                  <p>One value per line.</p>A generally understandable answer to
                  the question: "Where or in which medium did the measurements
                  or observations take place?"
                </td>
              </tr>
              <tr>
                <th>{r}Geographic Name(s)</th>
                <td>
                  <textarea
                    value={metadata.geographic_name}
                    onChange={(e) =>
                      onChangeMetadata("geographic_name", e.target.value)
                    }
                    placeholder="Greifensee&#10;River Rhine&#10;Kampala Uganda"
                  />
                </td>
                <td>
                  <p>One value per line.</p>
                  List geographical names that have a relation to the data in
                  this package.
                </td>
              </tr>
              <tr>
                <th>Notes</th>
                <td>
                  <textarea
                    value={metadata["notes-2"]}
                    onChange={(e) =>
                      onChangeMetadata("notes-2", e.target.value)
                    }
                    placeholder="Additional notes for data users, the Eawag data-manager, or yourself."
                  />
                </td>
                <td></td>
              </tr>

              <tr>
                <th>{r}Reviewer</th>
                <td>
                  <input
                    type="text"
                    value={metadata.reviewed_by}
                    onChange={(e) =>
                      onChangeMetadata("reviewed_by", e.target.value)
                    }
                    placeholder="bouffada"
                  />
                </td>
                <td>
                  <p>Eawag username.</p> The person who has reviewed the
                  dataset.
                </td>
              </tr>
              <tr>
                <th>{r}Curator</th>
                <td>
                  <input
                    type="text"
                    value={metadata.maintainer}
                    onChange={(e) =>
                      onChangeMetadata("maintainer", e.target.value)
                    }
                    placeholder="bouffada"
                  />
                </td>
                <td>
                  <p>Eawag username.</p> The Curator is the person responsible
                  for completeness, quality-control and maintenance of meta-data
                  and resources in the package.
                </td>
              </tr>
              <tr>
                <th>{r}Usage Contact</th>
                <td>
                  <input
                    type="text"
                    value={metadata.usage_contact}
                    onChange={(e) =>
                      onChangeMetadata("usage_contact", e.target.value)
                    }
                    placeholder="bouffada"
                  />
                </td>
                <td>
                  <p>Eawag username.</p> The person who has to be contacted
                  before the data in this package can be used. This is usually
                  the PI or research group leader.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {error !== "" && (
          <div className="errormessage">
            <p>Metadata incomplete. See below for details.</p>
            <p className="message">{error}</p>
          </div>
        )}
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
    return (
      <div className="publishdata">
        <p>
          Publish dataset <b>{metadata.title}</b> to archive <b>{archive}</b>
        </p>
        <p>
          It is important that your git repository contains a README.md file and
          conforms to the guidance found{" "}
          <a href="https://opendata.eawag.ch/guides/eaw_research_data_publishing_guide/eaw_research_data_publishing_guide.html#documentation-scientific-metadata">
            here.
          </a>
        </p>
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
          request to datalakes@eawag.ch.
        </p>
        {error !== "" && (
          <div className="errormessage">
            <p>Error adding dataset to archive. See below for details.</p>
            <p>{error}</p>
          </div>
        )}
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
    repo: "16",
    archives: [
      "ERIC Internal- Eawag Research Data (Only Eawag)",
      "ERIC OPEN - Eawag Research Data (Public)",
      "Zenodo - CERN's Open Data Archive",
    ],
    archive: 0,
    error: "",
    variables: [],
    variable_options: [],
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
      reviewed_by: "bouffada",
      maintainer: "datalakes-svc",
      usage_contact: "bouffada",
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

  addAuthor = () => {
    var { metadata } = this.state;
    for (var i = 1; i < 100; i++) {
      if (!("author-" + i in metadata)) {
        metadata["author-" + i] = "";
        break;
      }
    }
    this.setState({ metadata });
  };

  onChangeVariables = (event) => {
    var { metadata } = this.state;
    metadata["variables"] = event.map((e) => e.value);
    this.setState({ metadata });
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
    var person = selectiontables.persons.filter((p) => p.id === author_id)[0];
    return person.name + " <" + person.email + ">";
  };

  validateSelectRepo = () => {
    const {
      step,
      repo,
      datasets,
      datasetparameters,
      repositories,
      metadata,
      selectiontables,
    } = this.state;
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
    var mindatetime = [];
    var maxdatetime = [];
    var ids = [];
    var git = selected_datasets[0].datasourcelink.split("/-/blob")[0];
    var datalakes_links = [];

    for (var ds of selected_datasets) {
      ids.push(ds.id);
      mindatetime.push(new Date(ds.mindatetime));
      maxdatetime.push(new Date(ds.maxdatetime));
      repo_views.push(ds.id);
      repo_view_names.push(ds.title);
      authors.push(ds.persons_id);
      datalakes_links.push(
        "https://www.datalakes-eawag.ch/datadetail/" + ds.id
      );
      if (ds.lakes !== 56) {
        lakes.push(ds.lakes_id);
      }
      if (ds.latitude !== -9999) {
        latlng.push(
          parseFloat(ds.latitude).toFixed(3) +
            "," +
            parseFloat(ds.longitude).toFixed(3)
        );
      }
    }

    var maxDate = new Date(Math.max.apply(null, maxdatetime));
    var minDate = new Date(Math.min.apply(null, mindatetime));
    var timerange =
      minDate.toISOString().substring(0, 10) +
      " TO " +
      maxDate.toISOString().substring(0, 10);
    authors = [...new Set(authors)];
    latlng = [...new Set(latlng)];
    latlng = latlng.map((l) => [
      parseFloat(l.split(",")[1]),
      parseFloat(l.split(",")[0]),
    ]);
    var spatial = {
      type: "MultiPoint",
      coordinates: latlng,
    };
    lakes = [...new Set(lakes)];
    lakes = lakes
      .map((l) => selectiontables.lakes.filter((ll) => l === ll.id)[0].name)
      .join(", ");

    for (var i = 0; i < authors.length; i++) {
      var person = this.getPerson(selectiontables, authors[i]);
      metadata["author-" + (i + 1)] = person;
    }

    var variables = [
      ...new Set(
        datasetparameters
          .filter((dp) => ids.includes(dp.datasets_id))
          .map((dp) => dp.parameters_id)
      ),
    ]
      .map((v) => selectiontables.parameters.find((p) => p.id === v))
      .filter((sp) => sp.id > 4);

    var notes =
      "Variables contained in this dataset: " +
      variables.map((v) => `${v.name} (${v.unit})`).join(", ") +
      ". Live data can be accessed at the git repository [" +
      git +
      "] or on Datalakes at the following links: " +
      datalakes_links.join(", ");

    metadata["tags_string"] =
      "Datalakes, " + variables.map((v) => v.name).join(", ");
    metadata["notes-2"] = notes;
    metadata["spatial"] = spatial;
    metadata["timerange-1"] = timerange;
    metadata["repo_name"] = repo_name;
    metadata["namespace"] = namespace;
    metadata["repo_views"] = repo_views;
    metadata["repo_view_names"] = repo_view_names;
    metadata["title"] = this.cfl(repo_name.replaceAll("-", " "));
    metadata["geographic_name"] = lakes;

    this.setState({
      allowedStep: [1, 2, 0, 0],
      step: step + 1,
      metadata,
      variables,
    });
  };

  validateSelectArchive = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 3, 0], step: step + 1 });
  };

  validateMetadataReview = () => {
    var { step, metadata, error } = this.state;
    var required = [
      "title",
      "author-1",
      "notes",
      "tags_string",
      "reviewed_by",
      "maintainer",
      "usage_contact",
    ];
    var forward = true;
    if (metadata.variables.length < 1) {
      forward = false;
      error = "At least one variable must be defined.";
    } else {
      for (var r of required) {
        if (metadata[r] === "") {
          forward = false;
          error = "Not all required fields completed.";
          break;
        }
      }
    }
    if (forward) {
      this.setState({ allowedStep: [1, 2, 3, 4], step: step + 1, error: "" });
    } else {
      this.setState({ error });
    }
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
    var { metadata, archive } = this.state;
    console.log(archive);
    try {
      if (archive < 2) {
        var { data: link } = await axios.post(
          "https://api.meteolakes.ch/api/eric",
          metadata
        );
      } else if (parseInt(archive) === 2) {
        var { data: link } = await axios.post(
          apiUrl + "/publish/zenodo",
          metadata
        );
      } else {
        console.error("Underfined archive function.");
        link = "";
      }
      this.setState({
        loading: false,
      });
      //window.location.href = link;
    } catch (error) {
      console.error(error.response);
      this.setState({
        loading: false,
        error: JSON.stringify(error.response.data),
      });
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
    var { data: repositories } = await axios.get(apiUrl + "/repositories");
    var { data: datasets } = await axios.get(apiUrl + "/datasets");
    var { data: eric } = await axios.get(
      "https://raw.githubusercontent.com/eawag-rdm/ckanext-eaw_schema/master/ckanext/eaw_schema/eaw_schema_dataset.json"
    );
    var variable_options = eric.dataset_fields
      .find((df) => df.modal_text === "variables_help")
      .choices.map((c) => c.value);

    var active_repos = [
      ...new Set(datasets.map((d) => d.repositories_id)),
    ].filter((d) => d > 0);
    repositories = repositories.filter((r) => active_repos.includes(r.id));
    var { data: datasetparameters } = await axios.get(
      apiUrl + "/datasetparameters"
    );
    this.setState({
      repositories,
      datasets,
      datasetparameters,
      selectiontables,
      variable_options,
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
      variables,
      variable_options,
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
              addAuthor={this.addAuthor}
              variables={variables}
              variable_options={variable_options}
              onChangeVariables={this.onChangeVariables}
              error={error}
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
