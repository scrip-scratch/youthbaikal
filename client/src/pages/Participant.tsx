import { useEffect, useState } from "react";
import { Button, Container, Spinner } from "react-bootstrap";
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

  const getParticipant = async () => {
    if (!userId) return;
    setPending(true);
    const response = await serverApi.getSingleParticipant(userId);
    if (response && response.status === 200) {
      setParticipant(response.data.participant);
    }
    setPending(false);
  };

  const navigate = useNavigate();

  useEffect(() => {
    getParticipant();
  }, []);

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
      <h3 className="mb-2">{participant.user_name}</h3>
      <h6 className="text-muted mb-4">{participant.user_phone}</h6>
      <h6 className="d-flex">
        <span className="text-muted">Первый раз:</span>
        <span className="ms-2">
          {participant.first_time ? (
            <CheckIcon size={25} />
          ) : (
            <CloseIcon size={25} />
          )}
        </span>
      </h6>
      <h6 className="d-flex">
        <span className="text-muted">Оплачено:</span>
        <span className="ms-2">
          {participant.paid ? <CheckIcon size={25} /> : <CloseIcon size={25} />}
        </span>
      </h6>
      <h6 className="d-flex">
        <span className="text-muted">Зашел:</span>
        <span className="ms-2">
          {participant.enter_date ? getDateFormat(participant.enter_date) : "-"}
        </span>
      </h6>

      {!participant.enter_date && (
        <Button className="mt-5 w-100 btn" onClick={handleEnter}>
          Записать вход
        </Button>
      )}

      {participant.enter_date && (
        <p className="mt-5">
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
