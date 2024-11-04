import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { CreateParticipantDto } from "../api/ServerApi";

export default function CreateModal(props: {
  show: boolean;
  onHide: () => void;
  onSubmit: (dto: CreateParticipantDto) => void;
}) {
  const [firstTime, setFirstTime] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [paid, setPaid] = useState<boolean>(false);

  const handleSumbit = () => {
    if (!username) {
      setUsernameError(true);
      return;
    }
    if (!phone) {
      setPhoneError(true);
    }
    props.onHide();
    props.onSubmit({
      user_name: username,
      user_phone: phone,
      first_time: firstTime,
      paid: paid,
    });
  };

  useEffect(() => {
    setFirstTime(false);
    setUsername("");
    setPhone("");
  }, [props.show]);

  return (
    <Modal centered show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Добавить участника</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Имя</Form.Label>
            <Form.Control
              className="w-100"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(false);
              }}
              isInvalid={usernameError}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Телефон</Form.Label>
            <Form.Control
              className="w-100"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError(false);
              }}
              isInvalid={phoneError}
            />
          </Form.Group>
          <Form.Check
            label="Первый раз"
            checked={firstTime}
            onChange={() => setFirstTime(!firstTime)}
          />
          <Form.Check
            className="mt-3"
            label="Оплачено"
            checked={paid}
            onChange={() => setPaid(!paid)}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSumbit}>Сохранить</Button>
      </Modal.Footer>
    </Modal>
  );
}