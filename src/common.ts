import moment, {Moment} from "moment";
import {DATEFORMAT} from "./SearchPage";

export class Booking {
  id: number = 0;
  booking_start_datetime: string = moment() + "";
  booking_end_datetime: string = moment() + "";
}

export class Table {
  tableNumber: number = 0;
  seatCount: number = 0;
  bookings: Booking[] = [];
}

export class Restaurant {
  tables: Table[] = [];
  id: number = 0;
  restaurantName: string = '';
  workdayStart: string = "";
  workdayEnd: string = "";
}

export function abs(a: number): number {
  return a < 0 ? -a : a;
}

export function intersector(start: Moment): (b:Booking) => boolean {
  return (b:Booking) => {
    const a = moment(b.booking_start_datetime, DATEFORMAT)
    const c = moment(b.booking_end_datetime, DATEFORMAT)

    const halfWidth = c.diff(a)
    const center = a.add(halfWidth / 2, 'minute')

    return abs(center.diff(start, "minute")) < halfWidth;
  }
}

export const Host = "http://127.0.0.1:5000"