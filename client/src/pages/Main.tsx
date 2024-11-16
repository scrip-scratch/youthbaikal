import { useEffect, useState } from "react";
import { Container, Form, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { CreateParticipantDto, serverApi } from "../api/ServerApi";
import { MainContainer } from "../components/MainContainer";
import { CloseIcon } from "../components/icons/CloseIcon";
import { CheckIcon } from "../components/icons/CheckIcon";
import { QrIcon } from "../components/icons/QrIcon";
import QrModal from "../components/QrModal";
import { EditIcon } from "../components/icons/EditIcon";
import EditModal from "../components/EditModal";
import { getDateFormat } from "../utils/getDateFormat";
import CreateModal from "../components/CreateModal";

export interface Participant {
  user_id: string;
  user_name: string;
  user_phone: string;
  first_time: boolean;
  spices: string;
  paid: boolean;
  payment_amount: number;
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
  const [editModal, setEditModal] = useState<boolean>(false);
  const [createModal, setCreateModal] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const navigate = useNavigate();

  const getParticipants = async () => {
    setPending(true);
    const response = await serverApi.getParticipants();
    if (response && response.status === 200) {
      console.log(response.data.participants); // TODO: DELETE DEV LOG
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
    data: CreateParticipantDto;
  }) => {
    setPending(true);
    await serverApi.updateParticipant(params);
    getParticipants();
  };

  const createPaticipant = async (params: CreateParticipantDto) => {
    setPending(true);
    await serverApi.createUser(params);
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

  const filteredParticipants = search
    ? participants.filter((i) =>
        i.user_name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      )
    : participants;

  return (
    <Container className="d-flex flex-column p-2" style={{ minWidth: 1024 }}>
      <div className="d-flex">
        <p
          role="button"
          className="text-muted text-decoration-underline"
          onClick={() => setCreateModal(true)}
        >
          Добавить участника
        </p>
        <p
          role="button"
          className="text-muted text-decoration-underline ms-auto"
          onClick={handleLogout}
        >
          Выйти
        </p>
      </div>
      <Form.Group className="mt-3 mb-5">
        <Form.Control
          placeholder="Поиск..."
          className="w-100"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Form.Group>
      <div className="d-flex justify-content-between mb-3">
        <div>Всего участников: {filteredParticipants.length}</div>
        <div>
          Оплачено / Общая сумма:{" "}
          {filteredParticipants
            .filter((participant) => participant.paid)
            .reduce((acc, participant) => {
              return acc + participant.payment_amount;
            }, 0)}
          {" / "}
          {filteredParticipants.reduce((acc, participant) => {
            return acc + participant.payment_amount;
          }, 0)}
        </div>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Первый раз</th>
            <th>Оплата</th>
            <th>Сумма</th>
            <th>Обед</th>
            <th>Дата входа</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredParticipants
            .sort((a, b) => {
              return (b.paid === true ? 1 : 0) - (a.paid === true ? 1 : 0);
            })
            .map((participant, index) => {
              return (
                <tr key={`participant-${index}`}>
                  <td>
                    <Link
                      to={`/participant/${participant.user_id}`}
                      className="text-dark"
                    >
                      {participant.user_name}
                    </Link>
                  </td>
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
                  <td>{participant.payment_amount}</td>
                  <td style={{ maxWidth: 200 }}>{participant.spices}</td>
                  <td>
                    {participant.enter_date
                      ? getDateFormat(participant.enter_date)
                      : "-"}
                  </td>
                  <td>
                    <div className="d-flex">
                      <div
                        role="button"
                        className="me-4"
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
      <CreateModal
        show={createModal}
        onHide={() => setCreateModal(false)}
        onSubmit={createPaticipant}
      />
    </Container>
  );
};
