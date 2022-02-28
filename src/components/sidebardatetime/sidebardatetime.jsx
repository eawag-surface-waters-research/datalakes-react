import React, { Component } from "react";
import "./sidebardatetime.css";

class SidebarDatetime extends Component {
  render() {
    var { datetime, depth } = this.props;
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
        <table>
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
        <div></div>
        <div className="time">
          {datetime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} @ {depth}m
        </div>
        
      </div>
    );
  }
}

export default SidebarDatetime;
