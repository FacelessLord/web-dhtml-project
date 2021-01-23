import React, {useState} from 'react';
import './App.css';
import {BrowserRouter, Switch, Route, Link} from "react-router-dom";
import {SearchPage} from "./SearchPage";
import {Restaurant} from "./common";

function App() {
  const [searchResults, setSearchResults] = useState<Restaurant[]>([])
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path={"/"}>
            <SearchPage setSearchResults={setSearchResults}/>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
