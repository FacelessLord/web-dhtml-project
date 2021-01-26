import React, {useState} from 'react';
import './App.css';
import {BrowserRouter, Switch, Route, Link} from "react-router-dom";
import {SearchPage} from "./SearchPage";
import {Restaurant} from "./common";

class App extends React.Component<{},Restaurant[]> {
  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route path={"/"}>
              <SearchPage/>
            </Route>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
