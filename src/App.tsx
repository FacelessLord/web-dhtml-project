import React from 'react';
import './App.css';
import {BrowserRouter, Switch, Route, Link} from "react-router-dom";
import {SearchPage} from "./SearchPage";

function App() {
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

export default App;
