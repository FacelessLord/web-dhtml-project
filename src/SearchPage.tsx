import React, {useState} from "react";
import {
  Button,
  Card, CardActions, CardContent,
  CardHeader, CardMedia, Collapse, Container, createStyles,
  Grid, IconButton, makeStyles,
  TextField, Theme, Typography
} from "@material-ui/core";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import MomentUtils from "@date-io/moment";
import moment, {Moment} from "moment";
import {Host, Restaurant} from "./common";
import {Link} from "react-router-dom";
import "./restaurant_card.css"
import {red} from "@material-ui/core/colors";
import {ExpandMore, LoopRounded} from "@material-ui/icons";
import {TableCard} from "./TableCard";

interface SearchPageProps {
  setSearchResults: (r: Restaurant[]) => void;
}

class SearchPageState {
  startTime: Moment = moment();
  endTime: Moment = moment().add(1, "hour");
  startDate: Moment = moment();
  seatsCount: number = 2;
  restaurants: Restaurant[] = [];
  state: "await" | "loading" | "loaded" | "errored" = "await"
}

export const DATEFORMAT = "HH:mm DD.MM.yyyy";

export class SearchPage extends React.Component<SearchPageProps, SearchPageState> {
  state: SearchPageState = new SearchPageState();

  componentDidMount() {
  }

  copyDateToDate(a: Moment, target: Moment) {
    return target.year(a.year()).month(a.month()).date(a.date())
  }


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
              value={this.state.startDate}
              onChange={(datetime: MaterialUiPickersDate) => {
                console.log("2q2r")
                if (datetime) {
                  this.setState({startDate: datetime})
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
                value={this.state.startTime}
                onChange={(startTime: MaterialUiPickersDate) => {
                  if (startTime)
                    if (startTime.isAfter(this.state.endTime)) {
                      this.setState({startTime, endTime: startTime.clone().add(30, 'minutes')})
                    } else
                      this.setState({startTime})
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
                value={this.state.endTime}
                onChange={(endTime: MaterialUiPickersDate) => {
                  if (endTime)
                    if (endTime.isBefore(this.state.startTime))
                      this.setState({endTime, startTime: endTime.clone().add(-30, 'minutes')})
                    else
                      this.setState({endTime})
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
              const startDatetime = this.state.startDate.clone().hour(this.state.startTime.hour()).minute(this.state.startTime.minute())
              const endDatetime = this.state.startDate.clone().hour(this.state.endTime.hour()).minute(this.state.endTime.minute())
              if (startDatetime.isAfter(endDatetime))
                endDatetime.add(1, "hour")

              this.setState({state: "loading"})
              fetch(Host + `/search?startDatetime=${startDatetime.format(DATEFORMAT)}` +
                `&endDatetime=${endDatetime.format(DATEFORMAT)}&` +
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
      <Container className={"restaurantInfo"}>
        <CardHeader
          className={"restaurantHeader"}
          title={props.restaurant.restaurantName}
          subheader={`${props.restaurant.tables.length} ${formatSuitableTables(props.restaurant.tables.length)}`}
        />
        <CardActions disableSpacing>
          <IconButton
            className={"expandButton " + classes.expand + (expanded ? (" " + classes.expandOpen) : "")}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more">
            <ExpandMore/>
          </IconButton>
        </CardActions>
      </Container>
    </Grid>
    <Collapse in={expanded}>
      <CardContent className={"restaurantTables"}>
        {props.restaurant.tables.map(t => <TableCard table={t} restaurant={props.restaurant}/>)}
      </CardContent>
    </Collapse>
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
