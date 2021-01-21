import React from "react";
import {Button, CardHeader, Grid, TextField} from "@material-ui/core";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import MomentUtils from "@date-io/moment";
import moment, {Moment} from "moment";

class SearchPageState {
  startDatetime: Moment = moment();
  endDatetime: Moment = moment().add(1, "hour");
  seatsCount: number = 2;
}

export class SearchPage extends React.Component<{}, SearchPageState> {
  state: SearchPageState = new SearchPageState();

  componentDidMount() {
  }

  copyDateToDate(a: Moment, target: Moment) {
    return target.year(a.year()).month(a.month()).date(a.date())
  }

  DATEFORMAT = "HH:mm DD.MM.yyyy";

  render() {
    return <div className={"background"}>
      <div className={"form"}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container justify="center" direction={"column"}>
            <h1>Поиск ресторана</h1>
            <p>Введите необходимые данные и мы найдём для вас подходящий ресторан</p>
            <KeyboardDatePicker
              margin="normal"
              id="date-picker-dialog"
              label="Дата"
              format="DD.MM.yyyy"
              value={this.state.startDatetime}
              onChange={(datetime: MaterialUiPickersDate) => {
                console.log("2q2r")
                if (datetime) {
                  const newStart = this.copyDateToDate(datetime, this.state.startDatetime)
                  console.log(newStart)
                  const newEnd = this.copyDateToDate(datetime, this.state.endDatetime)

                  this.setState({startDatetime: newStart, endDatetime: newEnd})
                }
              }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <Grid container justify="space-around">
              <KeyboardTimePicker
                margin="normal"
                id="time-picker"
                label="Время начала"
                format={"HH:mm"}
                ampm={false}
                value={this.state.startDatetime}
                onChange={(startDatetime: MaterialUiPickersDate) => {
                  if (startDatetime) this.setState({startDatetime})
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}/>
              <KeyboardTimePicker
                margin="normal"
                id="time-picker"
                label="Время окончания"
                format={"HH:mm"}
                ampm={false}
                value={this.state.endDatetime}
                onChange={(endDatetime: MaterialUiPickersDate) => {
                  if (endDatetime && endDatetime.isAfter(this.state.startDatetime))
                    this.setState({endDatetime})
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}
              /></Grid>
            <TextField
              margin="normal"
              id="seat-count"
              label="Количество мест"
              type="number"
              value={this.state.seatsCount}
              onChange={e => this.setState({seatsCount: +e.target.value})}
              InputLabelProps={{
                shrink: true,
              }}/>
            <Button variant="contained" color="primary" onClick={e => {
              console.log(this.state.startDatetime.format(this.DATEFORMAT))
              fetch(`http://127.0.0.1:5000/search?startDatetime=${this.state.startDatetime.format(this.DATEFORMAT)}` +
                `&endDatetime=${this.state.endDatetime.format(this.DATEFORMAT)}&` +
                `seatsCount=${this.state.seatsCount}`)
            }}>
              Искать
            </Button>
          </Grid>
        </MuiPickersUtilsProvider>
      </div>
    </div>
  }
}