import {Host, Restaurant, Table} from "./common";
import React, {useState} from "react";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  Container, createStyles,
  Grid,
  IconButton, makeStyles, Theme
} from "@material-ui/core";
import {ExpandMore} from "@material-ui/icons";
import {TableCard} from "./TableCard";
import {red} from "@material-ui/core/colors";
import {Moment} from "moment";

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
  bookTable: (restaurant: Restaurant, table: Table, startTime: Moment, endTime: Moment, email: string) => void;
}

export function RestaurantCard(props: RestaurantCardProps) {
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
        {props.restaurant.tables.map((t, i) => <TableCard key={i} table={t} restaurant={props.restaurant}
                                                          bookTable={props.bookTable}/>)}
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
