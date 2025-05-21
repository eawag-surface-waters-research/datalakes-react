import React, { Component } from 'react';
import GitlabLogin from './gitlablogin';
import RenkuLogin from './renkulogin';

class User extends Component {
    render() { 
        var url = window.location.href;
        document.title = "Identities - Datalakes";
         return ( 
            <div>
                <div className="user">
                    <h1>Identities</h1>
                    <h3>To access some Datalakes advanced features, please identify yourself using the account(s) where the dataset(s) of interest are hosted.</h3>
                    <RenkuLogin />
                    <GitlabLogin />
                </div>
            </div>
        );
    }
}
 
export default User;