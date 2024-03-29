import React, { Component } from 'react';
import './notfound.css';

class NotFound extends Component {
    render() { 
        var url = window.location.href;
        document.title = "Not Found - Datalakes";
         return ( 
            <div className="notfound">
                <div className='number-error'>404</div><h1> Not Found Error.</h1>
                <h3>The requested URL <div className="url">{url}</div> was not found on this server.</h3>
            </div>
        );
    }
}
 
export default NotFound;