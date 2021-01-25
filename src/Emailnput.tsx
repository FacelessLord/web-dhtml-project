import {FormControl, FormHelperText, TextField} from "@material-ui/core";
import React, {useState} from "react";

const emailRe = /^\w+@\w+(.\w+)*$/

function checkEmailValidity(email: string) {
  console.log(email, emailRe.test(email))
  return emailRe.test(email);
}

export function EmailInput({value, setValue}: { value: string, setValue: React.Dispatch<string> }) {
  const [errored, setErrored] = useState<boolean>(false)

  return <FormControl error={errored}>
    <TextField margin={"normal"} label={"Email"} type={"email"} error={errored}
               aria-describedby="component-email-text"
               value={value}
               onChange={e => setValue(e.target.value)}
               onBlur={() => setErrored(!checkEmailValidity(value))}/>
    <FormHelperText hidden={!errored} id="component-email-text">Введите правильный почтовый адрес</FormHelperText>
  </FormControl>
}