from datetime import datetime

from finq import FINQ


def datetime_segment_day_intersections(start_time: datetime, end_time: datetime):
    def f(b):
        datetimes = {b.booking_start_datetime.day, b.booking_end_datetime.day}
        return start_time.day in datetimes or end_time.day in datetimes

    return f


def datetime_segment_intersection(start_time: datetime, end_time: datetime, start_time_b: datetime,
                                  end_time_b: datetime):
    half_width = (end_time - start_time) / 2
    center = start_time + half_width

    ab_half_width = (end_time_b - start_time_b) / 2
    ab_center = start_time_b + ab_half_width
    return (half_width + ab_half_width) - abs(ab_center - center)


def booking_intersects_others(table, start_time, end_time) -> bool:
    return FINQ(table.bookings) \
        .filter(datetime_segment_day_intersections(start_time, end_time)) \
        .filter(lambda b: datetime_segment_intersection(start_time, end_time, b.booking_start_datetime,
                                                        b.booking_end_datetime) > 0).any()
