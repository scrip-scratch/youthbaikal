import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Participant } from "../pages/Main";

export default function EditModal(props: {
  show: boolean;
  onHide: () => void;
  participant: Participant;
  onSubmit: (params: { userId: string; paid: boolean }) => void;
}) {
  const [paid, setPaid] = useState<boolean>(false);

  useEffect(() => {
    setPaid(props.participant.paid);
  }, [props.show]);

  return (
    <Modal centered show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{props.participant.user_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Check
            type="switch"
            label="Оплачено"
            checked={paid}
            onChange={() => setPaid(!paid)}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() =>
            props.onSubmit({ userId: props.participant.user_id, paid: paid })
          }
        >
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
