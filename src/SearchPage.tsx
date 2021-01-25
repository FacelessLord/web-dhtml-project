import React from "react";
import {
  Button,
  Card, Checkbox, FormControlLabel,
  Grid, TextField
} from "@material-ui/core";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import MomentUtils from "@date-io/moment";
import moment, {Moment} from "moment";
import {Host, Restaurant, Table} from "./common";
import {Link} from "react-router-dom";
import "./restaurant_card.css"
import {LoopRounded} from "@material-ui/icons";
import {RestaurantCard} from "./RestaurantCard";

interface SearchPageProps {
  setSearchResults: (r: Restaurant[]) => void;
}

class SearchPageState {
  startTime: Moment = moment();
  endTime: Moment = moment().add(1, "hour");
  startDate: Moment = moment();
  seatsCount: number = 2;
  restaurants: Restaurant[] = [];
  state: "await" | "loading" | "loaded" | "errored" = "await"
  searchAll: boolean = false;
}

export const DATEFORMAT = "HH:mm DD.MM.yyyy";

export class SearchPage extends React.Component<SearchPageProps, SearchPageState> {
  state: SearchPageState = new SearchPageState();

  constructor(props: SearchPageProps) {
    super(props);
    this.bookTable = this.bookTable.bind(this)
  }

  componentDidMount() {
  }

  copyDateToDate(a: Moment, target: Moment) {
    return target.year(a.year()).month(a.month()).date(a.date())
  }

  bookTable(restaurant: Restaurant, table: Table, startTime: Moment, endTime: Moment, email:string): void {
    fetch(Host + `/restaurants/${restaurant.id}/tables/${table.tableNumber}/book`, {
      method: "POST", body: JSON.stringify({booking_start_datetime:startTime.format(DATEFORMAT),
      booking_end_datetime:endTime.format(DATEFORMAT),
      email: email}), mode: "cors"
    })
  }

  render() {
    return <div className={"background"}>
      <div className={"form"}>
        <Link id={"resultsLink"} style={{display: "none"}} to={"/results"}>Results</Link>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container justify="space-around" direction={"column"}>
            <h1>Поиск ресторана</h1>
            <p>Введите необходимые данные и мы найдём для вас подходящий ресторан</p>
            <KeyboardDatePicker
              className={"datepicker"}
              margin="normal"
              id="date-picker-dialog"
              label="Дата"
              format="DD.MM.yyyy"
              value={this.state.startDate}
              onChange={(datetime: MaterialUiPickersDate) => {
                console.log("2q2r")
                if (datetime) {
                  this.setState({startDate: datetime})
                }
              }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <Grid container wrap={"nowrap"} justify="space-evenly" direction={"row"}>
              <KeyboardTimePicker
                margin="normal"
                id="time-picker"
                label="Время начала"
                format={"HH:mm"}
                ampm={false}
                value={this.state.startTime}
                onChange={(startTime: MaterialUiPickersDate) => {
                  if (startTime)
                    if (startTime.isAfter(this.state.endTime)) {
                      this.setState({startTime, endTime: startTime.clone().add(30, 'minutes')})
                    } else
                      this.setState({startTime})
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
                value={this.state.endTime}
                onChange={(endTime: MaterialUiPickersDate) => {
                  if (endTime)
                    if (endTime.isBefore(this.state.startTime))
                      this.setState({endTime, startTime: endTime.clone().add(-30, 'minutes')})
                    else
                      this.setState({endTime})
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}/>
            </Grid>
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
            <FormControlLabel
              control={<Checkbox checked={this.state.searchAll}
                                 color="primary"
                                 onChange={() => this.setState({searchAll: !this.state.searchAll})}
                                 name="searchAllCheckBox"/>}
              label={this.state.searchAll ? "Искать по всем ресторанам" : "Искать только подходящие рестораны"}/>
            <Button variant="contained" color="primary" onClick={e => {
              const startDatetime = this.state.startDate.clone().hour(this.state.startTime.hour()).minute(this.state.startTime.minute())
              const endDatetime = this.state.startDate.clone().hour(this.state.endTime.hour()).minute(this.state.endTime.minute())
              if (startDatetime.isAfter(endDatetime))
                endDatetime.add(1, "hour")

              this.setState({state: "loading"})
              fetch(Host + `/search?startDatetime=${startDatetime.format(DATEFORMAT)}` +
                `&endDatetime=${endDatetime.format(DATEFORMAT)}&` +
                `seatsCount=${this.state.seatsCount}&` +
                `searchAll=${this.state.searchAll}`)
                .then(t => t.json())
                .then(result => this.setState({restaurants: result.restaurants, state: "loaded"}))
                .then(() => document.getElementById("resultAnchor")
                  ?.scrollIntoView({block: "start", behavior: "smooth"}))
                .catch(e => this.setState({state: "errored"}))
            }}>
              Искать
            </Button>
          </Grid>
        </MuiPickersUtilsProvider>
      </div>
      <Grid container direction={"column"} className={"restaurantCards"}>
        <div id={"resultAnchor"}/>
        {this.renderSearchResults()}
      </Grid>
    </div>
  }

  renderSearchResults() {
    switch (this.state.state) {
      case "await":
        return ""
      case "loading":
        return (<Card className={"restaurantCardAuxiliary"}><LoopRounded className={"spin loadingIcon"}/></Card>)
      case "loaded":
        return this.state.restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} bookTable={this.bookTable}/>)
      case "errored":
        return (<Card className={"restaurantCardAuxiliary"}>Произошла ошибка при загрузке. Попробуйте через несколько
          минут</Card>)
    }
  }
}