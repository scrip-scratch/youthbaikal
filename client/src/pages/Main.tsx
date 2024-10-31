import { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { serverApi } from "../api/ServerApi";
import { MainContainer } from "../components/MainContainer";
import { CloseIcon } from "../components/icons/CloseIcon";
import { CheckIcon } from "../components/icons/CheckIcon";
import { QrIcon } from "../components/icons/QrIcon";
import QrModal from "../components/QrModal";
import { EditIcon } from "../components/icons/EditIcon";
import EditModal from "../components/EditModal";
import { getDateFormat } from "../utils/getDateFormat";

export interface Participant {
  user_id: string;
  user_name: string;
  user_phone: string;
  first_time: boolean;
  paid: boolean;
  enter_date: string;
}

export const Main = () => {
  const [pending, setPending] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantToQr, setParticipantToQr] = useState<Participant | null>(
    null
  );
  const [participantToEdit, setParticipantToEdit] =
    useState<Participant | null>(null);
  const [qrModal, setQrModal] = useState<boolean>(true);
  const [editModal, setEditModal] = useState<boolean>(true);

  const navigate = useNavigate();

  const getParticipants = async () => {
    setPending(true);
    const response = await serverApi.getParticipants();
    if (response && response.status === 200) {
      setParticipants(response.data.participants);
    }
    setPending(false);
  };

  const checkToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await serverApi.validateToken(token);
    if (response.data.success === false) {
      navigate("/login");
      localStorage.removeItem("token");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const updatePaticipant = async (params: {
    userId: string;
    paid: boolean;
  }) => {
    setEditModal(false);
    setPending(true);
    await serverApi.updateParticipant(params);
    getParticipants();
  };

  useEffect(() => {
    checkToken();
    getParticipants();
  }, []);

  if (pending) {
    return (
      <MainContainer>
        <Spinner variant="secondary" />
      </MainContainer>
    );
  }

  return (
    <Container className="d-flex flex-column p-2" style={{ minWidth: 920 }}>
      <div className="d-flex">
        <p
          role="button"
          className="text-muted text-decoration-underline ms-auto"
          onClick={handleLogout}
        >
          Выйти
        </p>
      </div>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Первый раз</th>
            <th>Оплата</th>
            <th>Дата входа</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant, index) => {
            return (
              <tr key={`participant-${index}`}>
                <td>{index}</td>
                <td>{participant.user_name}</td>
                <td>{participant.user_phone}</td>
                <td>
                  {participant.first_time ? (
                    <CheckIcon size={25} />
                  ) : (
                    <CloseIcon size={25} />
                  )}
                </td>
                <td>
                  {participant.paid ? (
                    <CheckIcon size={25} />
                  ) : (
                    <CloseIcon size={25} />
                  )}
                </td>
                <td>
                  {participant.enter_date
                    ? getDateFormat(participant.enter_date)
                    : "-"}
                </td>
                <td>
                  <div className="d-flex">
                    <div
                      role="button"
                      className="me-2"
                      onClick={() => {
                        setParticipantToQr(participant);
                        setQrModal(true);
                      }}
                    >
                      <QrIcon size={25} />
                    </div>
                    <div
                      role="button"
                      onClick={() => {
                        setParticipantToEdit(participant);
                        setEditModal(true);
                      }}
                    >
                      <EditIcon size={25} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {participantToQr && (
        <QrModal
          show={qrModal}
          onHide={() => setQrModal(false)}
          participant={participantToQr}
        />
      )}
      {participantToEdit && (
        <EditModal
          show={editModal}
          onHide={() => setEditModal(false)}
          participant={participantToEdit}
          onSubmit={updatePaticipant}
        />
      )}
    </Container>
  );
};
