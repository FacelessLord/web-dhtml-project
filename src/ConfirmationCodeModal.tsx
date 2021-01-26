import {Button, Input, Modal, TextField} from "@material-ui/core";
import React, {useState} from "react";
import './confirm_modal.css'

export function ConfirmationCodeModal({modalState, sendConfirm, closeModal}: {
  modalState: "closed" | "awaitingCode" | "success";
  sendConfirm: (code: number) => void;
  closeModal: () => void;
}) {
  const [value, setValue] = useState<string>("")
  return <Modal
    open={modalState !== "closed"}
    onClose={closeModal}
    aria-labelledby="simple-modal-title"
    aria-describedby="simple-modal-description">
    {modalState === "awaitingCode" ?
      <div className={"modal"}>
        <h4 id="simple-modal-title">Введите код из письма, отправленного на указаный вами
          адрес</h4>
        <TextField className={"codeInput"} label={"Confirmation code"} value={value}
                   onChange={e => setValue(e.target.value.replace(/[^0-9]/, ''))}/>
        <Button variant="contained" color="primary" onClick={() => sendConfirm(+value)}>
          Подтвердить бронь
        </Button>
      </div> :
      <div className={"modal"}>
        <h4 id="simple-modal-title">Столик успешно забронирован</h4>
      </div>}
  </Modal>
}