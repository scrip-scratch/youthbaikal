import { useEffect, useState } from "react";
import { Button, Container, Form, Spinner, Table } from "react-bootstrap";
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
import { DeleteIcon } from "../components/icons/DeleteIcon";
import DeleteModal from "../components/DeleteModal";

export interface Participant {
  user_id: string;
  user_name: string;
  user_phone: string;
  birth_date: string;
  first_time: boolean;
  city: string;
  church: string;
  email: string;
  promo_code: string;
  promo_discount: number;
  payment_amount: number;
  enter_date: string;
  paid: boolean;
  billFile: string;
  payment_date: string;
}

export const Main = () => {
  const [pending, setPending] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantToQr, setParticipantToQr] = useState<Participant | null>(
    null
  );
  const [participantToEdit, setParticipantToEdit] =
    useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] =
    useState<Participant | null>(null);
  const [qrModal, setQrModal] = useState<boolean>(true);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [createModal, setCreateModal] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

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

  const deleteParticipant = async (userId: string) => {
    setPending(true);
    await serverApi.deleteParticipant(userId);
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
    <Container className="d-flex flex-column p-2">
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
      </div>
      <div style={{ overflowX: "auto" }}>
        <Table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Дата рождения</th>
              <th>Город</th>
              <th>Церковь</th>
              <th>Почта</th>
              <th>Промокод</th>
              <th>Скидка</th>
              <th>Цена</th>
              <th>Оплачено</th>
              <th>Дата оплаты</th>
              <th>Чек</th>
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
                    <td>{participant.user_phone || "-"}</td>
                    <td>
                      {participant.birth_date
                        ? getDateFormat(participant.birth_date)
                        : "-"}
                    </td>
                    <td>{participant.city || "-"}</td>
                    <td>{participant.church || "-"}</td>
                    <td>{participant.email || "-"}</td>
                    <td>{participant.promo_code || "-"}</td>
                    <td>
                      {participant.promo_discount
                        ? participant.promo_discount
                        : "-"}
                    </td>
                    <td>
                      {participant.payment_amount
                        ? participant.payment_amount
                        : "-"}
                    </td>
                    <td>
                      {participant.paid ? (
                        <CheckIcon size={25} />
                      ) : (
                        <CloseIcon size={25} />
                      )}
                    </td>
                    <td>
                      {participant.payment_date
                        ? getDateFormat(participant.payment_date)
                        : "-"}
                    </td>
                    <td>
                      {participant.billFile ? (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={async () => {
                            const response = await serverApi.downloadBill(
                              participant.user_id
                            );
                            if (response && response.data) {
                              const url = window.URL.createObjectURL(
                                new Blob([response.data])
                              );
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute(
                                "download",
                                participant.billFile
                              );
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                            }
                          }}
                        >
                          Скачать чек
                        </Button>
                      ) : (
                        "-"
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
                          className="me-4"
                          onClick={() => {
                            setParticipantToEdit(participant);
                            setEditModal(true);
                          }}
                        >
                          <EditIcon size={25} />
                        </div>
                        <div
                          role="button"
                          onClick={() => {
                            setParticipantToDelete(participant);
                            setDeleteModal(true);
                          }}
                        >
                          <DeleteIcon size={25} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
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
      {participantToDelete && (
        <DeleteModal
          show={deleteModal}
          onHide={() => setDeleteModal(false)}
          participant={participantToDelete}
          onConfirm={deleteParticipant}
        />
      )}
    </Container>
  );
};
