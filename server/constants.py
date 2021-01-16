from enum import Enum


class Errors(Enum):
    Success = 'Success'
    IncorrectEmail = "Incorrect email"
    WrongConfirmationCode = "Wrong confirmation code"
    AlreadyConfirmed = "Booking had already been confirmed"
    NoConfirmationCode = "ConfirmationCode not specified",
    NoBooking = "Booking does not exist"
    BookingDateTimeIntersection = "Booking intersects already existing booking"

    def __str__(self):
        return self.name

    def __le__(self, other):
        return str(self) < str(other)


def quote_value(error):
    if isinstance(error, Errors):
        return str(error)
    return error


def quote_fields(resp: dict):
    new_resp = {}
    for k in resp:
        if isinstance(k, Fields):
            new_resp[str(k)] = quote_value(resp[k])
        else:
            new_resp[k] = quote_value(resp[k])
    return new_resp


class Fields(Enum):
    Success = "success"
    Error = "error"
    ConfirmationCode = "confirmationCode"
    BookingId = "bookingId"
    Booking = "booking"
    Id = "id"
    BookingStartDatetime = "booking_start_datetime"
    BookingEndDatetime = "booking_end_datetime"
    TableId = "table_id"
    TableNumber = "table_number"
    Email = "email"
    RestaurantId = "restaurantId"
    SeatCount = "seatCount"
    WorkdayStart = "workdayStart"
    WorkdayEnd = "workdayEnd"
    RestaurantName = "restaurantName"
    Bookings = "bookings"

    def __str__(self):
        return self.value

    def __le__(self, other):
        return str(self) <= str(other)

    def __ge__(self, other):
        return str(self) >= str(other)

    def __gt__(self, other):
        return str(self) > str(other)

    def __lt__(self, other):
        return str(self) < str(other)
