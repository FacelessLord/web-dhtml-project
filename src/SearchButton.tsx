import {Moment} from "moment";
import {Host, Restaurant} from "./common";
import {Button} from "@material-ui/core";
import React from "react";
import {DATEFORMAT, SearchPageState} from "./SearchPage";

interface SearchButtonProps {
  startDate: Moment;
  startTime: Moment;
  endTime: Moment;
  seatsCount: number;
  searchAll: boolean;
  restaurants: Restaurant[];
  setState: (v: Pick<SearchPageState, "restaurants" | "state">) => void;
}

export function SearchButton(props: SearchButtonProps) {
  return <Button variant="contained" color="primary" onClick={e => {
    const startDatetime = props.startDate.clone().hour(props.startTime.hour()).minute(props.startTime.minute())
    const endDatetime = props.startDate.clone().hour(props.endTime.hour()).minute(props.endTime.minute())
    if (startDatetime.isAfter(endDatetime))
      endDatetime.add(1, "hour")

    props.setState({state: "loading", restaurants: props.restaurants})
    fetch(Host + `/search?startDatetime=${startDatetime.format(DATEFORMAT)}` +
      `&endDatetime=${endDatetime.format(DATEFORMAT)}&` +
      `seatsCount=${props.seatsCount}&` +
      `searchAll=${props.searchAll}`)
      .then(t => t.json())
      .then(result => props.setState({restaurants: result.restaurants, state: "loaded"}))
      .then(() => document.getElementById("resultAnchor")
        ?.scrollIntoView({block: "start", behavior: "smooth"}))
      .catch(e => props.setState({state: "errored", restaurants: props.restaurants}))
  }}>
    Искать
  </Button>;
}