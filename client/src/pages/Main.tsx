import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Form,
  Image,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { CreateParticipantDto, serverApi } from "../api/ServerApi";
import YouthLogo from "../assets/youth-logo.png";
import CreateModal from "../components/CreateModal";
import DeleteModal from "../components/DeleteModal";
import EditModal from "../components/EditModal";
import { MainContainer } from "../components/MainContainer";
import QrModal from "../components/QrModal";
import { CheckIcon } from "../components/icons/CheckIcon";
import { CloseIcon } from "../components/icons/CloseIcon";
import { DeleteIcon } from "../components/icons/DeleteIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { QrIcon } from "../components/icons/QrIcon";
import { calculateAge } from "../utils/calculateAge";
import { getDateOnly } from "../utils/getDateOnly";

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
  letter_date: string;
  participant_number: number;
  created_at: string;
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
  const [sortBy, setSortBy] = useState<"price" | "alphabet" | "default">(
    "default"
  );

  const navigate = useNavigate();

  const getParticipants = async () => {
    setPending(true);
    const response = await serverApi.getParticipants();
    if (response && response.status === 200) {
      setParticipants(response.data.participants);
    }
    setPending(false);
  };

  const checkToken = useCallback(async () => {
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
  }, [navigate]);

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
  }, [checkToken]);

  if (pending) {
    return (
      <MainContainer>
        <Spinner variant="secondary" />
      </MainContainer>
    );
  }

  const filteredParticipants = (
    search
      ? participants.filter((i) =>
          i.user_name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
      : participants
  ).sort((a, b) => {
    if (sortBy === "alphabet") {
      // Сортировка по алфавиту
      return (a.user_name || "").localeCompare(b.user_name || "");
    } else if (sortBy === "price") {
      // Сортировка по цене от большего к меньшему
      return (b.payment_amount || 0) - (a.payment_amount || 0);
    } else {
      // По умолчанию: сначала оплаченные, затем по номеру участника
      const paidSort = (b.paid === true ? 1 : 0) - (a.paid === true ? 1 : 0);
      if (paidSort !== 0) return paidSort;
      return (a.participant_number || 0) - (b.participant_number || 0);
    }
  });

  return (
    <Container
      className="d-flex flex-column p-4"
      style={{ maxWidth: "1400px" }}
    >
      {/* Header */}
      <Card
        className="mb-4 shadow-sm border-0"
        style={{
          background: "#f05a39",
        }}
      >
        <Card.Body className="p-1 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <Image src={YouthLogo} width={75} height={75} />
            <div className="d-flex gap-2">
              <Button
                variant="light"
                onClick={() => navigate("/statistics")}
                className="shadow-sm"
              >
                Статистика
              </Button>
              <Button variant="outline-light" onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Stats Card */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center gap-4">
            <div>
              <h4 className="mb-0">{filteredParticipants.length}</h4>
              <small className="opacity-75">Всего участников</small>
            </div>
            <div className="ms-auto">
              <Badge className="px-3 py-2" style={{ fontSize: "0.9rem" }}>
                {participants.filter((p) => p.paid).length} оплачено
              </Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Controls Card */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
            <div className="flex-grow-1">
              <Form.Control
                placeholder="🔍 Поиск по имени..."
                className="w-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: "1rem", padding: "0.75rem" }}
              />
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted" style={{ whiteSpace: "nowrap" }}>
                Сортировка:
              </span>
              <Form.Select
                style={{ width: "auto", minWidth: "180px" }}
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "price" | "alphabet" | "default")
                }
              >
                <option value="default">По умолчанию</option>
                <option value="alphabet">По алфавиту</option>
                <option value="price">По цене</option>
              </Form.Select>
            </div>
            <Button
              variant="primary"
              onClick={() => setCreateModal(true)}
              className="shadow-sm"
              style={{ whiteSpace: "nowrap" }}
            >
              Добавить участника
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Table Card */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div style={{ overflowX: "auto" }}>
            <Table hover responsive className="mb-0">
              <thead style={{ background: "#f8f9fa" }}>
                <tr>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    №
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Имя
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Возраст
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Город
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Церковь
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Цена
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                      textAlign: "center",
                    }}
                  >
                    Оплачено
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Дата оплаты
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                      textAlign: "center",
                    }}
                  >
                    Чек
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Дата письма
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      borderBottom: "2px solid #dee2e6",
                      textAlign: "center",
                    }}
                  >
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant, index) => {
                  return (
                    <tr
                      key={`participant-${index}`}
                      style={{
                        transition: "background-color 0.2s",
                        borderBottom:
                          index < filteredParticipants.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        <Badge bg="secondary" className="px-2 py-1">
                          {participant.participant_number || index + 1}
                        </Badge>
                      </td>
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        <Link
                          to={`/participant/${participant.user_id}`}
                          className="text-decoration-none fw-semibold"
                          style={{ color: "#495057" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#667eea")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#495057")
                          }
                        >
                          {participant.user_name}
                        </Link>
                      </td>
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        {participant.birth_date
                          ? (() => {
                              const age = calculateAge(participant.birth_date);
                              return age !== null ? (
                                <Badge bg="info" className="px-2 py-1">
                                  {age} лет
                                </Badge>
                              ) : (
                                "-"
                              );
                            })()
                          : "-"}
                      </td>
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        {participant.city || (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        {participant.church || (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        {participant.payment_amount ? (
                          <span
                            className="fw-semibold"
                            style={{ color: "#28a745", whiteSpace: "nowrap" }}
                          >
                            {participant.payment_amount} ₽
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {participant.paid ? (
                          <CheckIcon size={24} />
                        ) : (
                          <CloseIcon size={24} />
                        )}
                      </td>
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        {participant.payment_date ? (
                          <Badge bg="success" className="px-2 py-1">
                            {getDateOnly(participant.payment_date)}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {participant.billFile ? (
                          <CheckIcon size={24} />
                        ) : (
                          <CloseIcon size={24} />
                        )}
                      </td>
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        {participant.letter_date ? (
                          <Badge bg="primary" className="px-2 py-1">
                            {getDateOnly(participant.letter_date)}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        <div className="d-flex justify-content-center gap-2">
                          <div
                            role="button"
                            onClick={() => {
                              setParticipantToQr(participant);
                              setQrModal(true);
                            }}
                            style={{
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              transition: "background-color 0.2s",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e9ecef")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title="QR код"
                          >
                            <QrIcon size={20} />
                          </div>
                          <div
                            role="button"
                            onClick={() => {
                              setParticipantToEdit(participant);
                              setEditModal(true);
                            }}
                            style={{
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              transition: "background-color 0.2s",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e9ecef")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title="Редактировать"
                          >
                            <EditIcon size={20} />
                          </div>
                          <div
                            role="button"
                            onClick={() => {
                              setParticipantToDelete(participant);
                              setDeleteModal(true);
                            }}
                            style={{
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              transition: "background-color 0.2s",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#fee")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title="Удалить"
                          >
                            <DeleteIcon size={20} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
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
