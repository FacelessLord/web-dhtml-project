from datetime import datetime
from typing import List
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy

mail = Mail()
db = SQLAlchemy()
default_sender = ''
DATEFORMAT = ''
HOSTNAME = ''


def load(app, dateformat, hostname):
    global default_sender, DATEFORMAT, HOSTNAME
    mail.init_app(app)
    db.init_app(app)
    default_sender = app.config["ADMINS"][0]
    DATEFORMAT = dateformat
    HOSTNAME = hostname


def send_plaintext_message(subject: str, recipients: List[str], text: str):
    msg = Message(subject, recipients=recipients, sender=default_sender)
    msg.body = text
    mail.send(msg)


def send_html_message(subject: str, recipients: List[str], html: str):
    msg = Message(subject, recipients=recipients, sender=default_sender)
    msg.html = html
    mail.send(msg)


with open("confirmation_template.html", "rt") as f:
    confirmation_template = "".join(f.readlines())


def send_confirmation_code(recipient: str, code: int, booking_id: int, start_time: datetime, end_time: datetime,
                           table_number: int, restaurant_name: str):
    send_html_message("Подтверждение брони", [recipient],
                      confirmation_template.format(table_number, restaurant_name, start_time.strftime(DATEFORMAT),
                                                   end_time.strftime(DATEFORMAT), code))
