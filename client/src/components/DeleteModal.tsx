import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Participant } from "../pages/Main";

export default function DeleteModal(props: {
  show: boolean;
  onHide: () => void;
  participant: Participant;
  onConfirm: (userId: string) => void;
}) {
  const handleConfirm = () => {
    props.onConfirm(props.participant.user_id);
    props.onHide();
  };

  return (
    <Modal centered show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Подтверждение удаления</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Вы уверены, что хотите удалить участника{" "}
          <strong>{props.participant.user_name}</strong>?
        </p>
        <p className="text-muted">Это действие нельзя отменить.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onHide}>
          Отмена
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Удалить
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

