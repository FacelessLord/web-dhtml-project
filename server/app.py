import os
from datetime import datetime

from flask import Flask, request, make_response
from json import JSONDecoder
from controllers import DatabaseController
from finq import FINQ, Identity

from constants import Fields, Errors, quote_fields
from controllers import MailController
from finq_extensions import extract_key
from controllers import ImageController
from utils import datetime_segment_day_intersections

app = Flask(__name__)
app.config.from_object('config')
DATEFORMAT = '%H:%M %d.%m.%Y'
HOSTNAME = os.environ.get('HOSTNAME', '--no-hostname--')

decoder = JSONDecoder()

DatabaseController.load(app)

MailController.load(app, DATEFORMAT, HOSTNAME)


def read_sensible_data():
    with open('./sensible_data.json', 'rt') as sensible_data_stream:
        json = '\n'.join(sensible_data_stream.readlines())

    return decoder.decode(json)


def get_restaurant(restaurant):
    return quote_fields({Fields.Id: restaurant.id,
                         Fields.WorkdayStart: str(restaurant.workday_start),
                         Fields.WorkdayEnd: str(restaurant.workday_end),
                         Fields.RestaurantName: restaurant.restaurant_name})


@app.route("/restaurants", methods=['GET'])
def get_restaurants():
    return FINQ(DatabaseController.get_restaurants()) \
        .map(get_restaurant) \
        .to_dict(lambda d: d[Fields.Id.value], Identity)


def get_table(table):
    return quote_fields(
        {Fields.Id: table.id,
         Fields.SeatCount: table.seat_count,
         Fields.TableNumber: table.table_number,
         Fields.RestaurantId: table.restaurant_id})


def get_table_with_bookings(table, start: datetime, end: datetime):
    return quote_fields(
        {Fields.Id: table.id,
         Fields.SeatCount: table.seat_count,
         Fields.TableNumber: table.table_number,
         Fields.RestaurantId: table.restaurant_id,
         Fields.Bookings: FINQ(table.bookings)
             .filter(datetime_segment_day_intersections(start, end))
             .map(lambda b: b.id)
             .map(get_booking)
             .to_list()})


@app.route("/tables", methods=['GET'])
def get_tables():
    return FINQ(DatabaseController.get_tables()) \
        .map(get_table) \
        .to_dict(lambda d: d[Fields.Id.value], Identity)


@app.route("/restaurants/<identifier>/tables", methods=['GET'])
def get_tables_at_restaurant(identifier):
    return FINQ(DatabaseController.get_restaurant(identifier).tables) \
        .map(get_table) \
        .to_dict(lambda d: d[Fields.Id.value], Identity)


@app.route("/restaurants/<restaurant_identifier>/tables/<table_number>", methods=['GET'])
def get_table_info(restaurant_identifier, table_number):
    table = DatabaseController.get_table_from_number_and_restaurant(table_number, restaurant_identifier)
    return get_table(table)


@app.route("/restaurants/<restaurant_identifier>/tables/<table_number>/book", methods=['POST'])
def book_table_at_restaurant(restaurant_identifier, table_number):
    restaurant = DatabaseController.get_restaurant(restaurant_identifier)
    table = DatabaseController.get_table_from_number_and_restaurant(table_number, restaurant_identifier)
    book_info = decoder.decode(request.data.decode("utf8"))

    startTime = datetime.strptime(book_info[Fields.BookingStartDatetime.value], DATEFORMAT)
    endTime = datetime.strptime(book_info[Fields.BookingEndDatetime.value], DATEFORMAT)
    email = book_info[Fields.Email.value]

    booked, result, booking_id = DatabaseController.pre_book_table(startTime,
                                                                   endTime,
                                                                   email,
                                                                   table.id)
    if booked:
        MailController.send_confirmation_code(email, result, booking_id, startTime, endTime, table_number,
                                              restaurant.restaurant_name)
        return quote_fields({Fields.Success: True, Fields.BookingId: booking_id})
    else:
        return quote_fields({Fields.Success: False, Fields.Error: str(result)})


@app.route("/bookings/<booking_id>", methods=['GET'])
def get_booking(booking_id):
    booking = DatabaseController.get_booking(booking_id)
    if booking:
        return quote_fields({Fields.Id: booking.id,
                             Fields.BookingStartDatetime: booking.booking_start_datetime.strftime(DATEFORMAT),
                             Fields.BookingEndDatetime: booking.booking_end_datetime.strftime(DATEFORMAT),
                             Fields.TableId: booking.table_id,
                             Fields.TableNumber: booking.table.table_number})
    return quote_fields({Fields.Id: booking_id, Fields.Error: Errors.NoBooking})


@app.route("/restaurants/<restaurant_identifier>/tables/<table_number>/bookings", methods=['GET'])
def get_table_bookings(restaurant_identifier, table_number):
    table = DatabaseController.get_table_from_number_and_restaurant(table_number, restaurant_identifier)

    if table:
        return quote_fields(
            {Fields.Success: True,
             Fields.Bookings: FINQ(table.bookings)
                 .map(lambda b: b.id)
                 .map(get_booking)
                 .to_list()})
    else:
        return quote_fields({Fields.Success: False, Fields.Error: Errors.NoTable})


@app.route("/bookings/<booking_id>/confirm", methods=['POST'])
def confirm_booking(booking_id):
    if 'code' in request.args:
        err = DatabaseController.confirm_booking(booking_id, int(request.args['code']))
        if err:
            return quote_fields({Fields.Success: False, Fields.Error: str(err)})
        else:
            return quote_fields({Fields.Success: True, Fields.Booking: get_booking(booking_id)})

    return quote_fields({Fields.Success: False, Fields.Error: Errors.NoConfirmationCode})


def zip_restaurant(rt):
    restaurant, tables = rt
    rdict = get_restaurant(restaurant)
    rdict[Fields.Tables] = tables
    return quote_fields(rdict)


def search_suitable_tables():
    start = datetime.strptime(request.args["startDatetime"], DATEFORMAT)
    end = datetime.strptime(request.args["endDatetime"], DATEFORMAT)
    seat_count = int(request.args["seatsCount"])

    return {Fields.Restaurants.value: DatabaseController.search_tables(start, end, seat_count)
        .group_by(lambda t: t.restaurant_id)
        .map(lambda l: FINQ(l).map(lambda t: (t.restaurant_id, get_table_with_bookings(t, start, end)))
             .self(extract_key))
        .map(lambda kl: (DatabaseController.get_restaurant(kl[0]), kl[1]))
        .map(zip_restaurant)
        .to_list()}


def zip_table(t):
    table, bookings = t
    table_json = get_table(table)
    table_json[Fields.Bookings] = bookings.map(lambda b: b.id).map(get_booking).to_list()
    return quote_fields(table_json)


def search_all_tables():
    start = datetime.strptime(request.args["startDatetime"], DATEFORMAT)
    end = datetime.strptime(request.args["endDatetime"], DATEFORMAT)
    seat_count = int(request.args["seatsCount"])

    return {Fields.Restaurants.value: DatabaseController.search_all_tables(start, end, seat_count)
        .group_by(lambda t: t[0].restaurant_id)
        .map(lambda l: FINQ(l).map(lambda t: (t[0].restaurant_id, zip_table(t)))
             .self(extract_key))
        .map(lambda kl: (DatabaseController.get_restaurant(kl[0]), kl[1]))
        .map(zip_restaurant)
        .to_list()}


@app.route("/search", methods=['GET'])
def search_tables():
    if 'restaurants' not in request.args:
        search_all = request.args["searchAll"] == "true"
        print(search_all)
        if search_all:
            response = make_response(search_all_tables())
        else:
            response = make_response(search_suitable_tables())

        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response

    return ""


@app.route("/static/restaurant/image")
def get_restaurant_image():
    restaurant_id = request.args["restaurant_id"]

    return ImageController.get_image("images/restaurants/", restaurant_id)
