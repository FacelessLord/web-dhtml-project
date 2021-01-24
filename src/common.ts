import moment, {Moment} from "moment";

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

export const Host = "http://127.0.0.1:5000"