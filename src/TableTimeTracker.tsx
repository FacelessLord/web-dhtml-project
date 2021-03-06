import moment, {Moment} from "moment";
import {DATEFORMAT} from "./SearchPage";
import {Booking, Restaurant, Table} from "./common";
import React from "react";


interface TableTimeTrackerProps {
  table: Table;
  restaurant: Restaurant;
  bookingStart: Moment | undefined;
  bookingEnd: Moment | undefined;
}

export function TableTimeTracker(props: TableTimeTrackerProps) {
  const restaurant = props.restaurant;

  const workdayEnd = +restaurant.workdayEnd.substring(0, 2);
  const workdayStart = +restaurant.workdayStart.substring(0, 2);
  const table = props.table;

  const hourCount = (workdayEnd - workdayStart + 24) % 24

  const bookingsSorted = table.bookings.sort((a, b) =>
    moment(a.booking_start_datetime, DATEFORMAT).isAfter(moment(b.booking_start_datetime, DATEFORMAT)) ? 1 : (
      moment(a.booking_start_datetime, DATEFORMAT).isBefore(moment(b.booking_start_datetime, DATEFORMAT)) ? -1 : 0))

  return (<div className={"timeTracker"}>
    <HourGrid count={hourCount} startHour={workdayStart}/>
    <TimeGrid count={hourCount} startHour={workdayStart}/>
    <BookingGrid bookings={bookingsSorted} restaurant={restaurant}/>
    {props.bookingStart && props.bookingEnd ?
      <BookingRect bookingStart={props.bookingStart} bookingEnd={props.bookingEnd} restaurant={restaurant}/> : ""}
  </div>)
}

function HourGrid({count, startHour}: { count: number, startHour: number }) {
  const l: JSX.Element[] = [];
  let hour = startHour;
  for (let i = 0; i < count + 1; i++, hour++)
    l.push(<div key={i}>{(hour % 24).toString().padStart(2, '0')}<span className={"small"}>:00</span></div>)
  return <div className={"widegrid"}>
    {l}
  </div>
}

function TimeGrid({count, startHour}: {
  count: number,
  startHour: number
}) {
  const l: JSX.Element[] = [];
  let hour = startHour;
  l.push(<div className={"hour first"}/>)
  for (let i = 1; i < count - 1; i++, hour++)
    l.push(<div key={i} className={"hour"}/>)
  l.push(<div className={"hour last"}/>)


  return <div className={"widegrid"}>
    {l}
  </div>
}

function BookingGrid({bookings, restaurant}: {
  bookings: Booking[],
  restaurant: Restaurant
}) {
  const l: JSX.Element[] = [];
  for (let i = 0; i < bookings.length; i++) {
    l.push(<BookingSegment key={i} restaurant={restaurant} booking={bookings[i]}/>)
  }

  return <div className={"bookinggrid"}>
    {l}
  </div>
}

function BookingSegment({restaurant, booking}: { restaurant: Restaurant, booking: Booking }) {
  const start = moment(booking.booking_start_datetime, DATEFORMAT)
  const end = moment(booking.booking_end_datetime, DATEFORMAT)

  const workdayEndHour = +restaurant.workdayEnd.substring(0, 2);
  const workdayStartHour = +restaurant.workdayStart.substring(0, 2);
  const workdayEndMinute = +restaurant.workdayEnd.substring(3, 5);
  const workdayStartMinute = +restaurant.workdayStart.substring(3, 5);


  const workdayStart = moment().year(start.year()).month(start.month())
    .date(start.date()).hour(workdayStartHour).minute(workdayStartMinute)
  const workdayEnd = moment().year(end.year()).month(end.month())
    .date(end.date()).hour(workdayEndHour).minute(workdayEndMinute)

  const renderStart = start.diff(workdayStart, 'minutes')
  const renderEnd = end.diff(workdayStart, 'minutes')
  const renderWidth = workdayEnd.diff(workdayStart, 'minutes')

  const classes = ["hour", "booking"]

  const offsetStart = 100 * renderStart / (renderWidth);
  const offsetEnd = 100 * renderEnd / (renderWidth);

  if (renderStart <= 0) {
    classes.push("first")
  }
  if (renderEnd >= renderWidth - 1) {
    classes.push("last")
  }

  return <div className={classes.join(" ")}
              style={{
                position: "absolute",
                left: offsetStart + "%",
                width: (offsetEnd - offsetStart) + "%"
              }}/>
}


function BookingRect({restaurant, bookingStart, bookingEnd}: {
  restaurant: Restaurant;
  bookingStart: Moment;
  bookingEnd: Moment;
}) {
  const workdayEndHour = +restaurant.workdayEnd.substring(0, 2);
  const workdayStartHour = +restaurant.workdayStart.substring(0, 2);
  const workdayEndMinute = +restaurant.workdayEnd.substring(3, 5);
  const workdayStartMinute = +restaurant.workdayStart.substring(3, 5);

  const workdayStart = moment().year(bookingStart.year()).month(bookingStart.month())
    .date(bookingStart.date()).hour(workdayStartHour).minute(workdayStartMinute)
  const workdayEnd = moment().year(bookingEnd.year()).month(bookingEnd.month())
    .date(bookingEnd.date()).hour(workdayEndHour).minute(workdayEndMinute)

  const renderStart = bookingStart.diff(workdayStart, 'minutes')
  const renderEnd = bookingEnd.diff(workdayStart, 'minutes')
  const renderWidth = workdayEnd.diff(workdayStart, 'minutes')

  const classes = ["hour", "bookingSelection"]

  const offsetStart = 100 * renderStart / (renderWidth);
  const offsetEnd = 100 * renderEnd / (renderWidth);

  if (renderStart <= 0) {
    classes.push("first")
  }
  if (renderEnd >= renderWidth - 1) {
    classes.push("last")
  }

  return <div className={"bookinggrid"}>
    <div className={classes.join(" ")}
         style={{
           position: "absolute",
           left: offsetStart + "%",
           width: (offsetEnd - offsetStart) + "%"
         }}/>
  </div>
}