import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import {KeyboardDatePicker, KeyboardTimePicker} from "@material-ui/pickers";
import React from "react";
import {Moment} from "moment";
import {SearchPageState} from "./SearchPage";
import {TextField} from "@material-ui/core";

export function DatePicker({startDate, setDate}: { startDate: Moment, setDate: (m: Moment) => void }) {
  return <KeyboardDatePicker
    className={"datepicker"}
    margin="normal"
    id="date-picker-dialog"
    label="Дата"
    format="DD.MM.yyyy"
    value={startDate}
    onChange={(datetime: MaterialUiPickersDate) => {
      console.log("2q2r")
      if (datetime) {
        setDate(datetime)
      }
    }}
    KeyboardButtonProps={{
      'aria-label': 'change date',
    }}
  />
}

export function StartTimePicker({startTime, endTime, setState}: {
  startTime: Moment, endTime: Moment, setState: (v: Pick<SearchPageState, "startTime" | "endTime">) => void
}) {
  return <KeyboardTimePicker
    margin="normal"
    id="time-picker"
    label="Время начала"
    format={"HH:mm"}
    ampm={false}
    value={startTime}
    onChange={(startTime: MaterialUiPickersDate) => {
      if (startTime)
        if (startTime.isAfter(endTime)) {
          setState({startTime, endTime: startTime.clone().add(30, 'minutes')})
        } else
          setState({startTime, endTime})
    }}
    KeyboardButtonProps={{
      'aria-label': 'change time',
    }}/>
}

export function EndTimePicker({startTime, endTime, setState}: {
  startTime: Moment, endTime: Moment, setState: (v: Pick<SearchPageState, "startTime" | "endTime">) => void
}) {
  return <KeyboardTimePicker
    margin="normal"
    id="time-picker"
    label="Время окончания"
    format={"HH:mm"}
    ampm={false}
    value={endTime}
    onChange={(endTime: MaterialUiPickersDate) => {
      if (endTime)
        if (endTime.isBefore(startTime))
          setState({endTime, startTime: endTime.clone().add(-30, 'minutes')})
        else
          setState({startTime, endTime})
    }}
    KeyboardButtonProps={{
      'aria-label': 'change time',
    }}/>
}

export function SeatsCountPicker({seatsCount, setState}: {
  seatsCount: number, setState: (v: Pick<SearchPageState, "seatsCount">) => void
}) {
  return <TextField
    margin="normal"
    id="seat-count"
    label="Количество мест"
    type="number"
    value={seatsCount}
    onChange={e => setState({seatsCount: +e.target.value})}
    InputLabelProps={{
      shrink: true,
    }}/>
}