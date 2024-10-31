import Modal from "react-bootstrap/Modal";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { Participant } from "../pages/Main";

export default function QrModal(props: {
  show: boolean;
  onHide: () => void;
  participant: Participant;
}) {
  return (
    <Modal centered show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <QRCodeGenerator
          userId={props.participant.user_id}
          userName={props.participant.user_name}
        />
      </Modal.Body>
    </Modal>
  );
}
