import { useEffect, useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
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
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show]);

  return (
    <Modal centered show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать участника</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Имя</Form.Label>
            <Form.Control
              className="w-100"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(false);
              }}
              isInvalid={usernameError}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Телефон</Form.Label>
            <Form.Control
              className="w-100"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError(false);
              }}
              isInvalid={phoneError}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Город</Form.Label>
            <Form.Control
              className="w-100"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Церковь</Form.Label>
            <Form.Control
              className="w-100"
              value={church}
              onChange={(e) => setChurch(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Почта</Form.Label>
            <Form.Control
              className="w-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Промокод</Form.Label>
            <Form.Control
              className="w-100"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Скидка</Form.Label>
            <Form.Control
              className="w-100"
              value={promoDiscount}
              onChange={(e) => setPromoDiscount(+e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">К оплате</Form.Label>
            <Form.Control
              className="w-100"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(+e.target.value)}
            />
          </Form.Group>
          <Form.Check
            label="Первый раз"
            checked={firstTime}
            onChange={() => setFirstTime(!firstTime)}
          />
          <Form.Check
            className="mt-3"
            label="Оплачено"
            checked={paid}
            onChange={() => setPaid(!paid)}
          />
          <Form.Group className="mt-3">
            <Form.Label className="mb-2">Чек</Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && (
              <div className="mt-2">
                <span className="text-muted small">
                  Выбран файл: {selectedFile.name}
                </span>
              </div>
            )}
            {props.participant.billFile && !selectedFile && (
              <div className="mt-2">
                <span className="text-muted small">
                  Текущий файл: {props.participant.billFile}
                </span>
              </div>
            )}
            {uploading && (
              <div className="mt-2">
                <Spinner size="sm" variant="secondary" />
                <span className="ms-2 text-muted small">Сохранение...</span>
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSumbit} disabled={uploading}>
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
