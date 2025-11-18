import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Participant } from "../pages/Main";
import { CreateParticipantDto, serverApi } from "../api/ServerApi";

export default function EditModal(props: {
  show: boolean;
  onHide: () => void;
  participant: Participant;
  onSubmit: (params: { userId: string; data: CreateParticipantDto }) => void;
}) {
  const [paid, setPaid] = useState<boolean>(false);
  const [firstTime, setFirstTime] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [church, setChurch] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [letterDate, setLetterDate] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSumbit = async () => {
    if (!username) {
      setUsernameError(true);
      return;
    }
    if (!phone) {
      setPhoneError(true);
      return;
    }

    setUploading(true);

    // Сначала загружаем файл, если он выбран
    if (selectedFile) {
      const uploadResponse = await serverApi.uploadBill(
        props.participant.user_id,
        selectedFile
      );
      if (!uploadResponse || uploadResponse.status !== 200) {
        setUploading(false);
        return;
      }
    }

    // Затем обновляем остальные данные
    props.onSubmit({
      userId: props.participant.user_id,
      data: {
        user_name: username,
        user_phone: phone,
        first_time: firstTime,
        paid: paid,
        city: city,
        church: church,
        email: email,
        promo_code: promoCode,
        promo_discount: promoDiscount,
        payment_amount: paymentAmount,
        payment_date: paymentDate,
        letter_date: letterDate,
        // Преобразуем дату из YYYY-MM-DD в DD-MM-YYYY для сохранения
        birth_date: birthDate
          ? (() => {
              const [year, month, day] = birthDate.split("-");
              return `${day}-${month}-${year}`;
            })()
          : "",
      },
    });

    setUploading(false);
    props.onHide();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  useEffect(() => {
    setPaid(props.participant.paid);
    setFirstTime(props.participant.first_time);
    setUsername(props.participant.user_name);
    setPhone(props.participant.user_phone);
    setCity(props.participant.city);
    setChurch(props.participant.church);
    setEmail(props.participant.email);
    setPromoCode(props.participant.promo_code);
    setPromoDiscount(props.participant.promo_discount);
    setPaymentAmount(props.participant.payment_amount);
    setPaymentDate(props.participant.payment_date || "");
    setLetterDate(props.participant.letter_date || "");
    // Преобразуем дату рождения из формата DD-MM-YYYY в YYYY-MM-DD для input type="date"
    const formatBirthDateForInput = (dateStr: string): string => {
      if (!dateStr) return "";
      // Проверяем формат DD-MM-YYYY
      const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
      const match = dateStr.match(ddmmyyyyPattern);
      if (match) {
        const day = match[1];
        const month = match[2];
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
      // Если уже в формате YYYY-MM-DD или ISO, возвращаем как есть (только дату)
      if (dateStr.includes("T")) {
        return dateStr.split("T")[0];
      }
      return dateStr;
    };
    setBirthDate(formatBirthDateForInput(props.participant.birth_date || ""));
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show]);

  return (
    <Modal
      centered
      show={props.show}
      onHide={props.onHide}
      size="lg"
      backdrop="static"
    >
      <Modal.Header
        closeButton
        style={{
          background: "#f05a39",
          color: "white",
          borderBottom: "none",
        }}
      >
        <Modal.Title style={{ fontWeight: 600 }}>
          Редактировать участника
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{ padding: "1.5rem", maxHeight: "70vh", overflowY: "auto" }}
      >
        <Form>
          {/* Личная информация */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body className="p-3">
              <h6
                className="mb-3"
                style={{ fontWeight: 600, color: "#495057" }}
              >
                👤 Личная информация
              </h6>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Имя <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setUsernameError(false);
                      }}
                      isInvalid={usernameError}
                      placeholder="Введите имя"
                    />
                    {usernameError && (
                      <Form.Text className="text-danger">
                        Поле обязательно для заполнения
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Телефон <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setPhoneError(false);
                      }}
                      isInvalid={phoneError}
                      placeholder="+7 (999) 123-45-67"
                    />
                    {phoneError && (
                      <Form.Text className="text-danger">
                        Поле обязательно для заполнения
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Дата рождения
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Почта
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Местоположение */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body className="p-3">
              <h6
                className="mb-3"
                style={{ fontWeight: 600, color: "#495057" }}
              >
                📍 Местоположение
              </h6>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Город
                    </Form.Label>
                    <Form.Control
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Введите город"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Церковь
                    </Form.Label>
                    <Form.Control
                      value={church}
                      onChange={(e) => setChurch(e.target.value)}
                      placeholder="Введите церковь"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Оплата и промокоды */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body className="p-3">
              <h6
                className="mb-3"
                style={{ fontWeight: 600, color: "#495057" }}
              >
                💰 Оплата и промокоды
              </h6>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Промокод
                    </Form.Label>
                    <Form.Control
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Введите промокод"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Скидка (₽)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(+e.target.value)}
                      placeholder="0"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      К оплате (₽)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(+e.target.value)}
                      placeholder="0"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="mb-2" style={{ fontWeight: 500 }}>
                    Статус
                  </Form.Label>
                  <div className="d-flex flex-column gap-2">
                    <Form.Check
                      type="switch"
                      id="paid-switch"
                      label={
                        <span>
                          Оплачено{" "}
                          {paid && (
                            <Badge bg="success" className="ms-2">
                              ✓
                            </Badge>
                          )}
                        </span>
                      }
                      checked={paid}
                      onChange={() => setPaid(!paid)}
                    />
                    <Form.Check
                      type="switch"
                      id="first-time-switch"
                      label={
                        <span>
                          Первый раз{" "}
                          {firstTime && (
                            <Badge bg="info" className="ms-2">
                              ✓
                            </Badge>
                          )}
                        </span>
                      }
                      checked={firstTime}
                      onChange={() => setFirstTime(!firstTime)}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Даты */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body className="p-3">
              <h6
                className="mb-3"
                style={{ fontWeight: 600, color: "#495057" }}
              >
                📅 Даты
              </h6>
              <Row className="g-3">
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Дата оплаты
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        paymentDate
                          ? paymentDate.includes("T")
                            ? paymentDate.split("T")[0]
                            : paymentDate
                          : ""
                      }
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label className="mb-1" style={{ fontWeight: 500 }}>
                      Дата письма
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        letterDate
                          ? letterDate.includes("T")
                            ? letterDate.split("T")[0]
                            : letterDate
                          : ""
                      }
                      onChange={(e) => setLetterDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Чек */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body className="p-3">
              <h6
                className="mb-3"
                style={{ fontWeight: 600, color: "#495057" }}
              >
                📄 Чек
              </h6>
              <Form.Group>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <Badge bg="info" className="me-2">
                      Новый файл
                    </Badge>
                    <span className="text-muted small">
                      {selectedFile.name}
                    </span>
                  </div>
                )}
                {props.participant.billFile && !selectedFile && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <Badge bg="secondary" className="me-2">
                      Текущий
                    </Badge>
                    <span className="text-muted small">
                      {props.participant.billFile}
                    </span>
                  </div>
                )}
                {uploading && (
                  <div className="mt-2 d-flex align-items-center">
                    <Spinner size="sm" variant="secondary" className="me-2" />
                    <span className="text-muted small">Загрузка файла...</span>
                  </div>
                )}
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>
      </Modal.Body>
      <Modal.Footer
        style={{ borderTop: "1px solid #dee2e6", padding: "1rem 1.5rem" }}
      >
        <Button variant="secondary" onClick={props.onHide} disabled={uploading}>
          Отмена
        </Button>
        <Button
          variant="primary"
          onClick={handleSumbit}
          disabled={uploading}
          className="shadow-sm"
          style={{ minWidth: "120px" }}
        >
          {uploading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
