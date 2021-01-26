import React from "react";
import {
  Button,
  Card, Checkbox, FormControlLabel,
  Grid, Modal, Switch, TextField
} from "@material-ui/core";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import MomentUtils from "@date-io/moment";
import moment, {Moment} from "moment";
import {Host, Restaurant, Table} from "./common";
import "./restaurant_card.css"
import {LoopRounded} from "@material-ui/icons";
import {RestaurantCard} from "./RestaurantCard";
import {DatePicker, EndTimePicker, SeatsCountPicker, StartTimePicker} from "./Pickers";
import {SearchButton} from "./SearchButton";
import {ConfirmationCodeModal} from "./ConfirmationCodeModal";

interface SearchPageProps {
}

export class SearchPageState {
  startTime: Moment = moment();
  endTime: Moment = moment().add(1, "hour");
  startDate: Moment = moment();
  seatsCount: number = 2;
  restaurants: Restaurant[] = [];
  state: "await" | "loading" | "loaded" | "errored" = "await"
  searchAll: boolean = false;
  modalState: "closed"|"awaitingCode"|"success" = "closed";
  bookingId: number = 0;
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

  bookTable(restaurant: Restaurant, table: Table, startTime: Moment, endTime: Moment, email: string): void {
    fetch(Host + `/restaurants/${restaurant.id}/tables/${table.tableNumber}/book`, {
      method: "POST", body: JSON.stringify({
        booking_start_datetime: startTime.format(DATEFORMAT),
        booking_end_datetime: endTime.format(DATEFORMAT),
        email: email
      }), mode: "cors"
    })
      .then(t => t.json())
      .then(value => this.setState({bookingId: value.bookingId}))
      .then(() => {
        window.addEventListener("unload", function (e) {
          // Cancel the event
          e.preventDefault()
          return '';
        });
      })
      .then(() => this.setState({modalState: 'awaitingCode'}))
  }

  sendConfirm(code: number): void {
    fetch(Host + `/bookings/${this.state.bookingId}/confirm?code=${code}`, {
      method: "POST"
    }).then(() => this.setState({modalState: 'success'}))
      .then(() => new Promise((resolve => setInterval(resolve, 1000))))
      .then(() => this.setState({modalState: 'closed'}))
  }

  closeModal() {
    this.setState({modalState: 'closed'})
  }

  render() {
    return <div className={"background"}>
      <div className={"form"}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container justify="space-around" direction={"column"}>
            <h1>Поиск ресторана</h1>
            <p>Введите необходимые данные и мы найдём для вас подходящий ресторан</p>
            <DatePicker startDate={this.state.startDate} setDate={datetime => this.setState({startDate: datetime})}/>
            <Grid container wrap={"nowrap"} justify="space-evenly" direction={"row"}>
              <StartTimePicker startTime={this.state.startTime} endTime={this.state.endTime}
                               setState={v => this.setState(v)}/>
              <EndTimePicker startTime={this.state.startTime} endTime={this.state.endTime}
                             setState={v => this.setState(v)}/>
            </Grid>
            <SeatsCountPicker seatsCount={this.state.seatsCount} setState={v => this.setState(v)}/>
            <FormControlLabel
              control={<Switch checked={!this.state.searchAll}
                               color="primary"
                               onChange={() => this.setState({searchAll: !this.state.searchAll})}
                               name="searchAllCheckBox"/>}
              label={this.state.searchAll ? "Искать по всем ресторанам" : "Искать только подходящие рестораны"}/>
            <SearchButton setState={v => this.setState(v)} {...this.state}/>
          </Grid>
          <ConfirmationCodeModal modalState={this.state.modalState} sendConfirm={this.sendConfirm.bind(this)}
                                 closeModal={this.closeModal.bind(this)}/>
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