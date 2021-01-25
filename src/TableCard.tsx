import {Button, Card, Container, Grid, TextField} from "@material-ui/core";
import React, {useState} from "react";
import "./time_tracker.css"
import {TableTimeTracker} from "./TableTimeTracker";
import {intersector, Restaurant, Table} from "./common";
import moment, {Moment} from "moment";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import {Link} from "react-router-dom";
import MomentUtils from "@date-io/moment";
import {EmailInput} from "./Emailnput";


interface TableCardProps {
  table: Table;
  restaurant: Restaurant;
  bookTable: (restaurant: Restaurant, table: Table, startTime: Moment, endTime: Moment, email: string) => void;
}

class TableTimeTrackerState {
  bookingStart: Moment | undefined;
  bookingEnd: Moment | undefined;
  isBooking: boolean = false;
  intersection: boolean = false;
  email: string = '';
}

export function TableCard(props: TableCardProps) {
  const [state, setState] = useState<TableTimeTrackerState>(new TableTimeTrackerState())

  return <Card className={"tableCard"}>
    <div style={{marginBottom: '8px'}}>Столик №{props.table.tableNumber}</div>
    <TableTimeTracker table={props.table} restaurant={props.restaurant} bookingEnd={state.bookingEnd}
                      bookingStart={state.bookingStart}/>
    {state.isBooking ? <OrderForm state={state} setState={setState} props={props}/> :
      <Button className={"alignRight"} variant="contained" color="primary" onClick={e => {

        setState({...state, bookingStart: moment(), bookingEnd: moment(), isBooking: !state.isBooking})
      }}>
        Выбрать время бронирования
      </Button>}
  </Card>
}

function OrderForm({state, setState, props}: {
  state: TableTimeTrackerState, setState: React.Dispatch<TableTimeTrackerState>,
  props: TableCardProps;
}) {
  return <Grid container direction={"column"}>
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Grid container wrap={"nowrap"} justify="space-evenly" direction={"row"}>
        <KeyboardTimePicker
          margin="normal"
          id="time-picker"
          label="Время начала"
          format={"HH:mm"}
          ampm={false}
          value={state.bookingStart}
          onChange={(startTime: MaterialUiPickersDate) => {
            if (startTime) {
              const intersections = props.table.bookings.filter(intersector(startTime)).length

              const workdayStart = +props.restaurant.workdayStart.substring(0, 2)
              const workdayEnd = +props.restaurant.workdayEnd.substring(0, 2)
              const workdayEndMinute = +props.restaurant.workdayEnd.substring(3, 5)

              if (startTime.hour() > workdayEnd || (startTime.hour() === workdayEnd && startTime.minute() > workdayEndMinute)) {
                startTime.hour(workdayEnd).minute(workdayEndMinute - 30)
              }
              if (startTime.hour() < workdayStart) {
                startTime.hour(workdayStart).minute(0)
              }

              if (startTime.isAfter(state.bookingEnd)) {
                setState({
                  ...state,
                  bookingStart: startTime,
                  bookingEnd: startTime.clone().add(30, 'minutes'),
                  intersection: intersections > 0
                })
              } else
                setState({...state, bookingStart: startTime, intersection: intersections > 0})
            }
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
          value={state.bookingEnd}
          onChange={(endTime: MaterialUiPickersDate) => {
            if (endTime) {
              const intersections = props.table.bookings.filter(intersector(endTime)).length

              const workdayStart = +props.restaurant.workdayStart.substring(0, 2)
              const workdayEnd = +props.restaurant.workdayEnd.substring(0, 2)
              const workdayEndMinute = +props.restaurant.workdayEnd.substring(3, 5)

              if (endTime.hour() < workdayStart) {
                endTime.hour(workdayStart).minute(30)
              }
              if (endTime.hour() > workdayEnd || (endTime.hour() === workdayEnd && endTime.minute() > workdayEndMinute)) {
                endTime.hour(workdayEnd).minute(workdayEndMinute)
              }

              if (endTime.isBefore(state.bookingStart))
                setState({
                  ...state,
                  bookingEnd: endTime,
                  bookingStart: endTime.clone().add(-30, 'minutes'),
                  intersection: intersections > 0
                })
              else
                setState({...state, bookingEnd: endTime, intersection: intersections > 0})
            }
          }}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}/>
        <EmailInput value={state.email} setValue={value => setState({...state, email: value})}/>
      </Grid>
    </MuiPickersUtilsProvider>
    <Container>
      <Button className={"alignRight"} variant="contained" color="primary" onClick={e => {
        props.bookTable(props.restaurant, props.table, state.bookingStart as Moment,
          state.bookingEnd as Moment, state.email)
      }}>
        Забронировать
      </Button>
    </Container>
  </Grid>
}