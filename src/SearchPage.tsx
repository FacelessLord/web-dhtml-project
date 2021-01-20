import React from "react";
import {Button, CardHeader, Grid, TextField} from "@material-ui/core";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import MomentUtils from "@date-io/moment";
import moment, {Moment} from "moment";

class SearchPageState {
  datetime: Moment = moment();
  seatsCount: number = 2;
}

export class SearchPage extends React.Component<{}, SearchPageState> {
  state: SearchPageState = new SearchPageState();

  componentDidMount() {
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
              value={this.state.datetime}
              onChange={(datetime: MaterialUiPickersDate) => {
                if (datetime) this.setState({datetime})
              }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <KeyboardTimePicker
              margin="normal"
              id="time-picker"
              label="Время"
              format={"HH:mm"}
              ampm={false}
              value={this.state.datetime}
              onChange={(datetime: MaterialUiPickersDate) => {
                if (datetime) this.setState({datetime})
              }}
              KeyboardButtonProps={{
                'aria-label': 'change time',
              }}
            />
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