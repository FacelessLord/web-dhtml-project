export class Table {
  tableNumber: number = 0;
  seatCount: number = 0;
}

export class Restaurant {
  tables: Table[] = [];
  id: number = 0;
  restaurantName: string = '';
}

export const Host = "http://127.0.0.1:5000"