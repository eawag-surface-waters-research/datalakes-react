import React, { Component } from "react";
import "./sidebardatetime.css";

class SidebarDatetime extends Component {
  render() {
    var { datetime, depth, showDateModal, showTimeDepthModal } = this.props;
    var months = [
      "Jan ",
      "Feb ",
      "Mar ",
      "Apr ",
      "May ",
      "Jun ",
      "Jul ",
      "Aug ",
      "Sept ",
      "Oct ",
      "Nov ",
      "Dec ",
    ];
    return (
      <div className="siderbar-datetime">
        <table onClick={showDateModal} title="Edit date">
          <tbody>
            <tr>
              <td className="day" rowSpan={2}>
                {datetime.getDate()}
              </td>
              <td className="month">{months[datetime.getMonth()]}</td>
            </tr>
            <tr>
              <td className="year">{datetime.getFullYear()}</td>
            </tr>
          </tbody>
        </table>
        <div className="time" onClick={showTimeDepthModal} title="Edit time and depth">
          {datetime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          @ {depth}m
        </div>
      </div>
    );
  }
}

export default SidebarDatetime;
