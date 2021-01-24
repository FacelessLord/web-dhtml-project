import re
from datetime import time, datetime, timedelta
from typing import List, Union, Tuple, Optional

from finq import FINQ
from flask_sqlalchemy import SQLAlchemy

from formatting import random_code

from constants import Errors

from utils import booking_intersects_others, datetime_segment_intersection

db = SQLAlchemy()
booking_timeout = timedelta(minutes=10)


class Booking(db.Model):
    __tablename__ = "bookings"
    id = db.Column(db.Integer, primary_key=True)
    booking_start_datetime = db.Column(db.DateTime, default=datetime.today())
    booking_end_datetime = db.Column(db.DateTime, default=time(hour=2))
    table_id = db.Column(db.ForeignKey('tables.id'), default=-1)
    email = db.Column(db.VARCHAR(255))
    confirmed = db.Column(db.Boolean, default=False)
    # if not confirmed in 5-10 minutes, it'll be cancelled
    booking_start_time = db.Column(db.DateTime, default=datetime.now())
    confirmation_code = db.Column(db.Integer, default=random_code(6))


class Table(db.Model):
    __tablename__ = "tables"
    id = db.Column(db.Integer, primary_key=True)
    seat_count = db.Column(db.Integer, default=4)
    table_number = db.Column(db.Integer)
    bookings = db.relationship("Booking", backref="table", cascade="all,delete-orphan")
    restaurant_id = db.Column(db.ForeignKey('restaurants.id'), default=-1)


class Restaurant(db.Model):
    __tablename__ = "restaurants"
    id = db.Column(db.Integer, primary_key=True)
    workday_start = db.Column(db.Time)
    workday_end = db.Column(db.Time)
    restaurant_name = db.Column(db.VARCHAR(80))
    tables = db.relationship("Table", backref="restaurant", cascade="all,delete-orphan")


def load(app):
    db.init_app(app)
    db.create_all(app=app)


def create_restaurant(workday_start: time, workday_end: time, name: str) -> None:
    restaurant = Restaurant(workday_start=workday_start, workday_end=workday_end, restaurant_name=name)
    db.session.add(restaurant)


def create_table(seat_count: int, restaurant_id: int) -> None:
    table = Table(seat_count=seat_count, restaurant_id=restaurant_id)
    db.session.add(table)


email_re = re.compile("^\\w+@\\w+(.\\w+)$")


def email_valid(email: str) -> bool:
    return not not email_re.fullmatch(email)


def pre_book_table(start_time: datetime, end_time: datetime, email: str, table_id: int) -> \
        Tuple[bool, Union[int, Errors], int]:
    if start_time > end_time:
        start_time, end_time = end_time, start_time

    if email_valid(email):
        table = get_table(table_id)
        if not booking_intersects_others(table, start_time, end_time):
            booking = Booking(booking_start_datetime=start_time, booking_end_datetime=end_time,
                              email=email, table_id=table_id)
            db.session.add(booking)
            db.session.commit()
            return True, booking.confirmation_code, booking.id
        return False, Errors.BookingDateTimeIntersection, -1
    return False, Errors.IncorrectEmail, -1


def confirm_booking(booking_id: int, code: int) -> Optional[Errors]:
    booking = db.session.query(Booking).get(booking_id)
    if booking:
        if booking.confirmation_code == code:
            if not booking.confirmed:
                booking.confirmed = True
                db.session.commit()
                return
            return Errors.AlreadyConfirmed
        return Errors.WrongConfirmationCode
    return Errors.NoBooking


def get_table_from_number_and_restaurant(table_number: int, restaurant_id: int) -> Table:
    return db.session.query(Table) \
        .filter(Table.restaurant_id == restaurant_id) \
        .filter(Table.table_number == table_number)[0]


def clear_timed_out_bookings():
    now = datetime.now()
    db.session.query(Booking) \
        .filter(not Booking.confirmed
                or (now - Booking.booking_start_time) > booking_timeout
                or Booking.booking_end_datetime < now) \
        .delete()


def get_restaurant(id: int):
    return db.session.query(Restaurant).get(id)


def get_table(id: int):
    return db.session.query(Table).get(id)


def get_restaurants() -> List[Restaurant]:
    return db.session.query(Restaurant)


def get_tables() -> List[Table]:
    return db.session.query(Table)


def get_booking(id: int) -> Booking:
    return db.session.query(Booking).get(id)


def search_tables(start_moment: datetime, end_moment: datetime, seat_count: int, tolerance=timedelta(minutes=30)) \
        -> FINQ[Table]:
    # if existing booking intersects with search more than in 30 minutes, then this table is dropped
    return FINQ(db.session.query(Table)) \
        .filter(lambda t: t.seat_count >= seat_count) \
        .filter(lambda t: FINQ(t.bookings)
                .filter(lambda b: datetime_segment_intersection(start_moment, end_moment, b.booking_start_datetime,
                                                                b.booking_end_datetime) > tolerance)
                .none())
