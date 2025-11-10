import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { CreateParticipantDto } from "../api/ServerApi";

export default function CreateModal(props: {
  show: boolean;
  onHide: () => void;
  onSubmit: (dto: CreateParticipantDto) => void;
}) {
  const [firstTime, setFirstTime] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [church, setChurch] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [paid, setPaid] = useState<boolean>(false);

  const handleSumbit = () => {
    if (!username) {
      setUsernameError(true);
      return;
    }
    if (!phone) {
      setPhoneError(true);
    }
    props.onHide();
    props.onSubmit({
      user_name: username,
      user_phone: phone,
      first_time: firstTime,
      paid: paid,
      city: city,
      church: church,
      email: email,
      promo_code: promoCode,
      promo_discount: promoDiscount,
      payment_amount: isNaN(paymentAmount) ? 0 : paymentAmount,
    });
  };

  useEffect(() => {
    setFirstTime(false);
    setUsername("");
    setPhone("");
    setCity("");
    setChurch("");
    setEmail("");
    setPromoCode("");
    setPromoDiscount(0);
  }, [props.show]);

  return (
    <Modal centered show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Добавить участника</Modal.Title>
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSumbit}>Сохранить</Button>
      </Modal.Footer>
    </Modal>
  );
}
