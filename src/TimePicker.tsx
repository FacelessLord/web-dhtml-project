import React from "react";
import {List, ListItem, ListItemText, Menu, MenuItem} from "@material-ui/core";

export class Time {
  hour: number;
  minute: number;

  constructor(datetime: Date) {
    this.hour = datetime.getHours();
    this.minute = datetime.getMinutes();
  }
}

interface TimePickerProps {
  value: Time;
  setValue: (t: Time) => void;
}

class TimePickerState {
  hourAnchor: HTMLElement | null = null;
  minuteAnchor: HTMLElement | null = null;
}

export class TimePicker extends React.Component<TimePickerProps, TimePickerState> {
  state = new TimePickerState();
  hours: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  handleClickHourItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({hourAnchor: event.currentTarget});
  };
  handleClickMinuteItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({minuteAnchor: event.currentTarget});
  };

  handleMenuItemClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, hour: number, minute: number) => {
    this.props.setValue({hour, minute})
    this.setState({hourAnchor: null, minuteAnchor: null})
  };

  handleClose = () => {
    this.setState({hourAnchor: null, minuteAnchor: null})
  };

  render() {
    return <div>
      <div className={"row"}>
        <span onClick={this.handleClickHourItem.bind(this)}>
          {this.props.value.hour}
        </span>:<span onClick={this.handleClickHourItem.bind(this)}>
      {this.props.value.minute}
        </span>
      </div>
      <Menu
        id="lock-menu"
        anchorEl={this.state.hourAnchor}
        keepMounted
        open={Boolean(this.state.hourAnchor)}
        onClose={this.handleClose.bind(this)}
      >
        {this.hours.map((hour, index) => (
          <MenuItem
            key={hour}
            disabled={index === 0}
            selected={index === this.props.value.hour}
            onClick={(event) => this.handleMenuItemClick(event, hour, this.props.value.minute)}
          >
            {hour}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        id="lock-menu"
        anchorEl={this.state.minuteAnchor}
        keepMounted
        open={Boolean(this.state.minuteAnchor)}
        onClose={this.handleClose.bind(this)}
      >
        {this.hours.map((minute, index) => (
          <MenuItem
            key={minute}
            disabled={index === 0}
            selected={index === this.props.value.minute}
            onClick={(event) => this.handleMenuItemClick(event, this.props.value.hour, minute)}
          >
            {minute}
          </MenuItem>
        ))}
      </Menu>
    </div>
  }
}