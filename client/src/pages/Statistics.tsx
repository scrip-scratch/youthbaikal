import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Image,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { serverApi } from "../api/ServerApi";
import YouthLogo from "../assets/youth-logo.png";
import { MainContainer } from "../components/MainContainer";
import { Participant } from "./Main";

export const Statistics = () => {
  const [pending, setPending] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const navigate = useNavigate();

  const getParticipants = async () => {
    setPending(true);
    const response = await serverApi.getParticipants();
    if (response && response.status === 200) {
      setParticipants(response.data.participants);
    }
    setPending(false);
  };

  useEffect(() => {
    getParticipants();
  }, []);

  if (pending) {
    return (
      <MainContainer>
        <Spinner variant="secondary" />
      </MainContainer>
    );
  }

  // Подсчет статистики
  const uniqueCities = new Set(
    participants.filter((p) => p.city).map((p) => p.city)
  ).size;

  const uniqueChurches = new Set(
    participants.filter((p) => p.church).map((p) => p.church)
  ).size;

  const totalParticipants = participants.length;

  // Подсчет возраста
  const ages: number[] = [];
  participants.forEach((p) => {
    if (p.birth_date) {
      try {
        const birthDate = new Date(p.birth_date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          ages.push(age - 1);
        } else {
          ages.push(age);
        }
      } catch {
        // Игнорируем некорректные даты
      }
    }
  });

  // const averageAge =
  //   ages.length > 0
  //     ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
  //     : null;

  // Распределение по возрастам
  const ageGroups: { [key: string]: number } = {
    "0-17": 0,
    "18-25": 0,
    "26-35": 0,
    "36-50": 0,
    "50+": 0,
    "Не указано": 0,
  };

  ages.forEach((age) => {
    if (age <= 17) ageGroups["0-17"]++;
    else if (age <= 25) ageGroups["18-25"]++;
    else if (age <= 35) ageGroups["26-35"]++;
    else if (age <= 50) ageGroups["36-50"]++;
    else if (age > 50) ageGroups["50+"]++;
    else ageGroups["Не указано"]++;
  });

  // Распределение по церквям
  const churchDistribution: { [key: string]: number } = {};
  participants.forEach((p) => {
    if (p.church) {
      churchDistribution[p.church] = (churchDistribution[p.church] || 0) + 1;
    }
  });
  const churchEntries = Object.entries(churchDistribution).sort(
    (a, b) => b[1] - a[1]
  );

  // Распределение по городам
  const cityDistribution: { [key: string]: number } = {};
  participants.forEach((p) => {
    if (p.city) {
      cityDistribution[p.city] = (cityDistribution[p.city] || 0) + 1;
    }
  });
  const cityEntries = Object.entries(cityDistribution).sort(
    (a, b) => b[1] - a[1]
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
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h6 mb-2" style={{ fontWeight: 600 }}>
                Всего участников
              </Card.Title>
              <Card.Text
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                {totalParticipants}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h6 mb-2" style={{ fontWeight: 600 }}>
                Количество городов
              </Card.Title>
              <Card.Text
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                {uniqueCities}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h6 mb-2" style={{ fontWeight: 600 }}>
                Количество церквей
              </Card.Title>
              <Card.Text
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                {uniqueChurches}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {ages.length > 0 && (
        <Card className="mt-4 shadow-sm border-0">
          <Card.Body>
            <Card.Title className="h5 mb-3" style={{ fontWeight: 600 }}>
              Распределение по возрастам
            </Card.Title>
            <div className="mt-3">
              {Object.entries(ageGroups).map(([group, count]) => (
                <div key={group} className="mb-2 pb-2 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{group} лет:</span>
                    <Badge bg="primary" className="px-3 py-2">
                      {count}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <Row className="g-3 mt-3">
        <Col xs={12} md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h5 mb-3" style={{ fontWeight: 600 }}>
                Распределение по церквям
              </Card.Title>
              <div className="mt-3">
                {churchEntries.length > 0 ? (
                  churchEntries.map(([church, count]) => (
                    <div key={church} className="mb-2 pb-2 border-bottom">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{church || "Не указано"}</span>
                        <Badge bg="primary" className="px-3 py-2">
                          {count}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">Нет данных</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h5 mb-3" style={{ fontWeight: 600 }}>
                Распределение по городам
              </Card.Title>
              <div className="mt-3">
                {cityEntries.length > 0 ? (
                  cityEntries.map(([city, count]) => (
                    <div key={city} className="mb-2 pb-2 border-bottom">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{city || "Не указано"}</span>
                        <Badge bg="success" className="px-3 py-2">
                          {count}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">Нет данных</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
