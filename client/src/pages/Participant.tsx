import { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { CreateParticipantDto, serverApi } from "../api/ServerApi";
import YouthLogo from "../assets/youth-logo.png";
import { CheckIcon } from "../components/icons/CheckIcon";
import { CloseIcon } from "../components/icons/CloseIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { MainContainer } from "../components/MainContainer";
import { getDateFormat } from "../utils/getDateFormat";
import { calculateAge } from "../utils/calculateAge";
import { Participant } from "./Main";
import EditModal from "../components/EditModal";

export const ParticipantPage = () => {
  const { userId } = useParams();
  const [pending, setPending] = useState<boolean>(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const getParticipant = useCallback(async () => {
    if (!userId) return;
    setPending(true);
    const response = await serverApi.getSingleParticipant(userId);
    if (response && response.status === 200) {
      setParticipant(response.data.participant);
    }
    setPending(false);
  }, [userId]);

  useEffect(() => {
    getParticipant();
  }, [getParticipant]);

  const handleEnter = async () => {
    if (!userId) return;
    setPending(true);
    await serverApi.admitParticipant({
      userId: userId,
      datetime: String(new Date()),
    });
    getParticipant();
  };

  const handleCancelEnter = async () => {
    if (!userId) return;
    setPending(true);
    await serverApi.admitParticipant({
      userId: userId,
      datetime: "",
    });
    getParticipant();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!userId || !event.target.files || event.target.files.length === 0)
      return;

    const file = event.target.files[0];
    setUploading(true);

    const response = await serverApi.uploadBill(userId, file);
    if (response && response.status === 200) {
      await getParticipant();
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadBill = async () => {
    if (!userId || !participant?.billFile) return;

    const response = await serverApi.downloadBill(userId);
    if (response && response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", participant.billFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleUpdateParticipant = async (params: {
    userId: string;
    data: CreateParticipantDto;
  }) => {
    setPending(true);
    await serverApi.updateParticipant(params);
    await getParticipant();
  };

  if (pending) {
    return (
      <MainContainer>
        <Spinner variant="secondary" />
      </MainContainer>
    );
  }

  if (!participant) {
    return (
      <MainContainer>
        <h3>Участник не найден</h3>
      </MainContainer>
    );
  }

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div
      className="d-flex align-items-center py-2 border-bottom"
      style={{ minHeight: 40 }}
    >
      <div
        className="text-muted"
        style={{ minWidth: 180, fontSize: "0.95rem" }}
      >
        {label}
      </div>
      <div
        className="d-flex align-items-center gap-2"
        style={{ fontSize: "1rem" }}
      >
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );

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
                onClick={() => navigate("/")}
                className="shadow-sm"
              >
                ← На главную
              </Button>
              <Button
                variant="outline-light"
                onClick={() => setEditModal(true)}
                className="d-flex align-items-center gap-2"
              >
                <EditIcon size={20} />
                Редактировать
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Participant Info Card */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
            <div>
              <h2 className="mb-2" style={{ fontWeight: 600 }}>
                {participant.user_name || "-"}
              </h2>
              {participant.user_phone && (
                <div className="text-muted mb-1" style={{ fontSize: "1rem" }}>
                  📞 {participant.user_phone}
                </div>
              )}
              {participant.email && (
                <div className="text-muted mb-2" style={{ fontSize: "1rem" }}>
                  ✉️ {participant.email}
                </div>
              )}
            </div>
            <Badge
              bg={participant.paid ? "success" : "danger"}
              className="px-3 py-2"
              style={{ fontSize: "0.95rem" }}
            >
              {participant.paid ? "Оплачено" : "Не оплачено"}
            </Badge>
          </div>

          <div className="mt-3">
            <InfoRow
              label="Возраст"
              value={
                participant.birth_date
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
                  : "-"
              }
            />
            <InfoRow label="Город" value={participant.city || "-"} />
            <InfoRow label="Церковь" value={participant.church || "-"} />
            <InfoRow
              label="Промокод"
              value={
                participant.promo_discount ? (
                  <Badge bg="warning" text="dark" className="px-2 py-1">
                    {participant.promo_code}
                  </Badge>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              label="Скидка"
              value={
                participant.promo_discount ? participant.promo_discount : "-"
              }
            />
            <InfoRow
              label="К оплате"
              value={
                participant.payment_amount ? (
                  <span className="fw-semibold" style={{ color: "#28a745" }}>
                    {participant.payment_amount} ₽
                  </span>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              label="Первый раз"
              value=""
              icon={
                participant.first_time ? (
                  <CheckIcon size={20} />
                ) : (
                  <CloseIcon size={20} />
                )
              }
            />
            <InfoRow
              label="Дата оплаты"
              value={
                participant.payment_date ? (
                  <Badge bg="success" className="px-2 py-1">
                    {getDateFormat(participant.payment_date)}
                  </Badge>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              label="Дата письма"
              value={
                participant.letter_date ? (
                  <Badge bg="primary" className="px-2 py-1">
                    {getDateFormat(participant.letter_date)}
                  </Badge>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              label="Дата входа"
              value={
                participant.enter_date ? (
                  <Badge bg="secondary" className="px-2 py-1">
                    {getDateFormat(participant.enter_date)}
                  </Badge>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              label="Чек"
              value=""
              icon={
                participant.billFile ? (
                  <CheckIcon size={20} />
                ) : (
                  <CloseIcon size={20} />
                )
              }
            />
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col xs={12} md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h6 mb-3" style={{ fontWeight: 600 }}>
                Чек
              </Card.Title>
              <Form.Group>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Form.Group>
              {participant.billFile && (
                <div className="mt-3">
                  <div className="text-muted small mb-2">
                    Файл: {participant.billFile}
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleDownloadBill}
                    disabled={uploading}
                    className="w-100 shadow-sm"
                  >
                    Скачать чек
                  </Button>
                </div>
              )}
              {uploading && (
                <div className="mt-2 text-center">
                  <Spinner size="sm" variant="secondary" />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h6 mb-3" style={{ fontWeight: 600 }}>
                Действия
              </Card.Title>
              {!participant.enter_date ? (
                <Button
                  className="w-100 shadow-sm"
                  variant="success"
                  onClick={handleEnter}
                >
                  Записать вход
                </Button>
              ) : (
                <div>
                  <div className="text-success mb-3 d-flex align-items-center">
                    <CheckIcon size={20} />
                    <span className="ms-2">Участник уже вошел</span>
                  </div>
                  <Button
                    variant="outline-secondary"
                    className="w-100 shadow-sm"
                    onClick={handleCancelEnter}
                  >
                    Отменить вход
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {participant && (
        <EditModal
          show={editModal}
          onHide={() => setEditModal(false)}
          participant={participant}
          onSubmit={handleUpdateParticipant}
        />
      )}
    </Container>
  );
};
