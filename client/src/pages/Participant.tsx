import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Container, Form, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { serverApi } from "../api/ServerApi";
import { CheckIcon } from "../components/icons/CheckIcon";
import { CloseIcon } from "../components/icons/CloseIcon";
import { MainContainer } from "../components/MainContainer";
import { getDateFormat } from "../utils/getDateFormat";
import { Participant } from "./Main";

export const ParticipantPage = () => {
  const { userId } = useParams();
  const [pending, setPending] = useState<boolean>(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
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

  return (
    <Container className="d-flex flex-column p-4">
      <div className="d-flex">
        <p
          role="button"
          className="text-muted text-decoration-underline"
          onClick={() => navigate("/")}
        >
          На главную
        </p>
      </div>
      <h6
        className="text-muted mb-2"
        style={{ fontSize: 12 }}
      >{`#${participant.user_id}`}</h6>
      <h3 className="mb-4">{participant.user_name}</h3>

      <div className="mb-3">
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Телефон:
          </span>
          <span>{participant.user_phone || "-"}</span>
        </h6>
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Почта:
          </span>
          <span>{participant.email || "-"}</span>
        </h6>
        {participant.birth_date && (
          <h6 className="d-flex mb-2">
            <span className="text-muted" style={{ minWidth: 150 }}>
              Дата рождения:
            </span>
            <span>{getDateFormat(participant.birth_date)}</span>
          </h6>
        )}
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Город:
          </span>
          <span>{participant.city || "-"}</span>
        </h6>
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Церковь:
          </span>
          <span>{participant.church || "-"}</span>
        </h6>
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Промокод:
          </span>
          <span>{participant.promo_code || "-"}</span>
        </h6>
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Скидка:
          </span>
          <span>{participant.promo_discount || "-"}</span>
        </h6>
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            К оплате:
          </span>
          <span>{participant.payment_amount || "-"}</span>
        </h6>
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Первый раз:
          </span>
          <span>
            {participant.first_time ? (
              <CheckIcon size={25} />
            ) : (
              <CloseIcon size={25} />
            )}
          </span>
        </h6>
        <h6 className="d-flex mb-2">
          <span className="text-muted" style={{ minWidth: 150 }}>
            Оплачено:
          </span>
          <span>
            {participant.paid ? (
              <CheckIcon size={25} />
            ) : (
              <CloseIcon size={25} />
            )}
          </span>
        </h6>
        {participant.payment_date && (
          <h6 className="d-flex mb-2">
            <span className="text-muted" style={{ minWidth: 150 }}>
              Дата оплаты:
            </span>
            <span>{getDateFormat(participant.payment_date)}</span>
          </h6>
        )}
        {participant.enter_date && (
          <h6 className="d-flex mb-2">
            <span className="text-muted" style={{ minWidth: 150 }}>
              Дата входа:
            </span>
            <span>{getDateFormat(participant.enter_date)}</span>
          </h6>
        )}
      </div>

      <div className="mt-4 mb-3">
        <h6 className="text-muted mb-3">Чек:</h6>
        <div className="d-flex flex-column gap-2">
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
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">
                Загружен: {participant.billFile}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleDownloadBill}
                disabled={uploading}
              >
                Скачать чек
              </Button>
            </div>
          )}
          {uploading && <Spinner size="sm" variant="secondary" />}
        </div>
      </div>

      {!participant.enter_date && (
        <Button className="mt-3 w-100 btn" onClick={handleEnter}>
          Записать вход
        </Button>
      )}

      {participant.enter_date && (
        <p className="mt-3">
          Участник уже вошел и использовал QR-код.{" "}
          <span
            role="button"
            onClick={handleCancelEnter}
            className="text-decoration-underline text-muted"
          >
            Отменить вход?
          </span>
        </p>
      )}
    </Container>
  );
};
