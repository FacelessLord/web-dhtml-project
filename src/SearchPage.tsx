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
    return target.day(a.day()).month(a.month()).year(a.year())
  }

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
                if (datetime) {
                  const newStart = this.copyDateToDate(datetime, this.state.startDatetime)
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
              }}
            />
            <Button variant="contained" color="primary">
              Искать
            </Button>
          </Grid>
        </MuiPickersUtilsProvider>
      </div>
    </div>
  }
}