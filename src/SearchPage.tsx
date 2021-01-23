import React, {useState} from "react";
import {
  Button,
  Card,
  CardHeader, CardMedia, createStyles,
  Grid, makeStyles,
  TextField, Theme
} from "@material-ui/core";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import MomentUtils from "@date-io/moment";
import moment, {Moment} from "moment";
import {Host, Restaurant} from "./common";
import {Link} from "react-router-dom";
import "./restaurant_card.css"
import {red} from "@material-ui/core/colors";
import {LoopRounded} from "@material-ui/icons";

interface SearchPageProps {
  setSearchResults: (r: Restaurant[]) => void;
}

class SearchPageState {
  startDatetime: Moment = moment();
  endDatetime: Moment = moment().add(1, "hour");
  seatsCount: number = 2;
  restaurants: Restaurant[] = [];
  state: "await" | "loading" | "loaded" | "errored" = "loading"
}

export class SearchPage extends React.Component<SearchPageProps, SearchPageState> {
  state: SearchPageState = new SearchPageState();

  componentDidMount() {
  }

  copyDateToDate(a: Moment, target: Moment) {
    return target.year(a.year()).month(a.month()).date(a.date())
  }

  DATEFORMAT = "HH:mm DD.MM.yyyy";

  render() {
    return <div className={"background"}>
      <div className={"form"}>
        <Link id={"resultsLink"} style={{display: "none"}} to={"/results"}>Results</Link>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container justify="space-around" direction={"column"}>
            <h1>Поиск ресторана</h1>
            <p>Введите необходимые данные и мы найдём для вас подходящий ресторан</p>
            <KeyboardDatePicker
              className={"datepicker"}
              margin="normal"
              id="date-picker-dialog"
              label="Дата"
              format="DD.MM.yyyy"
              value={this.state.startDatetime}
              onChange={(datetime: MaterialUiPickersDate) => {
                console.log("2q2r")
                if (datetime) {
                  const newStart = this.copyDateToDate(datetime, this.state.startDatetime)
                  console.log(newStart)
                  const newEnd = this.copyDateToDate(datetime, this.state.endDatetime)

                  this.setState({startDatetime: newStart, endDatetime: newEnd})
                }
              }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <Grid container wrap={"nowrap"} justify="space-evenly" direction={"row"}>
              <KeyboardTimePicker
                margin="normal"
                id="time-picker"
                label="Время начала"
                format={"HH:mm"}
                ampm={false}
                value={this.state.startDatetime}
                onChange={(startDatetime: MaterialUiPickersDate) => {
                  if (startDatetime)
                    if (startDatetime.isAfter(this.state.startDatetime))
                      this.setState({startDatetime, endDatetime: startDatetime.clone().add(30, 'minutes')})
                    else
                      this.setState({startDatetime})
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}/>
              <KeyboardTimePicker
                margin="normal"
                id="time-picker"
                label="Время окончания"
                format={"HH:mm"}
                ampm={false}
                value={this.state.endDatetime}
                onChange={(endDatetime: MaterialUiPickersDate) => {
                  if (endDatetime)
                    if (!endDatetime.isAfter(this.state.startDatetime))
                      this.setState({endDatetime, startDatetime: endDatetime.clone().add(-30, 'minutes')})
                    else
                      this.setState({endDatetime})
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}/>
            </Grid>
            <TextField
              margin="normal"
              id="seat-count"
              label="Количество мест"
              type="number"
              value={this.state.seatsCount}
              onChange={e => this.setState({seatsCount: +e.target.value})}
              InputLabelProps={{
                shrink: true,
              }}/>
            <Button variant="contained" color="primary" onClick={e => {
              console.log(this.state.startDatetime.format(this.DATEFORMAT))
              this.setState({state: "loading"})
              fetch(Host + `/search?startDatetime=${this.state.startDatetime.format(this.DATEFORMAT)}` +
                `&endDatetime=${this.state.endDatetime.format(this.DATEFORMAT)}&` +
                `seatsCount=${this.state.seatsCount}`)
                .then(t => t.json())
                .then(result => this.setState({restaurants: result.restaurants, state: "loaded"}))
                .catch(e => this.setState({state: "errored"}))
                .then(() => document.getElementById("resultAnchor")
                  ?.scrollIntoView({block: "start", behavior: "smooth"}))
            }}>
              Искать
            </Button>
          </Grid>
        </MuiPickersUtilsProvider>
      </div>
      <Grid container direction={"column"} className={"restaurantCards"}>
        <div id={"resultAnchor"}/>
        {renderSearchResults(this.state)}
      </Grid>
    </div>
  }
}

function renderSearchResults(state: SearchPageState) {
  switch (state.state) {
    case "await":
      return ""
    case "loading":
      return (<Card className={"restaurantCardAuxiliary"}><LoopRounded className={"spin loadingIcon"}/></Card>)
    case "loaded":
      return state.restaurants.map(r => <RestaurantCard key={r.id} restaurant={r}/>)
    case "errored":
      return (<Card className={"restaurantCardAuxiliary"}>Произошла ошибка при загрузке. Попробуйте через несколько
        минут</Card>)
  }
}


function formatSuitableTables(count: number) {
  const countMod100 = count % 100;
  if (countMod100 % 10 === 1)
    return "подходящий столик"
  if (~[2, 3, 4].indexOf(countMod100 % 10))
    return "подходящих столика"
  return "подходящих столиков"
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function RestaurantCard(props: RestaurantCardProps) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<boolean>(false)

  return (<Card className={"restaurantCard"}>
    <Grid container direction={"row"} wrap={"nowrap"}>
      <CardMedia
        className={"restaurantImage"}
        image={Host + `/static/restaurant/image?restaurant_id=` + props.restaurant.id}
        title="Paella dish"
      />
      <CardHeader
        className={"restaurantInfo"}
        title={props.restaurant.restaurantName}
        subheader={`${props.restaurant.tables.length} ${formatSuitableTables(props.restaurant.tables.length)}`}
      />
    </Grid>
  </Card>)
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 345,
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    avatar: {
      backgroundColor: red[500],
    },
  }),
);
