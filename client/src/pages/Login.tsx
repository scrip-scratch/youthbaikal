import { useState } from "react";
import { Button, Form, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { serverApi } from "../api/ServerApi";
import YouthLogo from "../assets/youth-logo.jpg";
import { MainContainer } from "../components/MainContainer";

export const Login = () => {
  const [login, setLogin] = useState<string>("");
  const [loginError, setLoginError] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [credentialsError, setCredentialsError] = useState<boolean>(false);
  const [serverError, setServerError] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await serverApi.login({
      login: login,
      password: password,
    });

    if (response.status === 404) {
      setCredentialsError(true);
      setTimeout(() => setCredentialsError(false), 7500);
      return;
    }

    if (response.code === "ERR_NETWORK") {
      setServerError(true);
      setTimeout(() => setServerError(false), 7500);
      return;
    }

    if (response.data.token && response.data.success) {
      localStorage.setItem("token", response.data.token);
      navigate("/");
      return;
    }
  };

  const handleSubmit = () => {
    let errorCounter = 0;
    if (login === "") {
      setLoginError(true);
      errorCounter++;
    }
    if (password === "") {
      setPasswordError(true);
      errorCounter++;
    }

    if (errorCounter > 0) return;

    handleAuth();
  };

  return (
    <MainContainer>
      <Form
        className="d-flex flex-column align-items-center"
        style={{ width: 300 }}
      >
        <div className="d-flex position-relative w-100">
          <Image
            src={YouthLogo}
            width={100}
            height={100}
            style={{ position: "absolute", top: -100, left: 100, opacity: 0.7 }}
          />
        </div>
        <Form.Group className="w-100 mb-2 mt-4">
          <Form.Label className="mb-0">Логин</Form.Label>
          <Form.Control
            value={login}
            onChange={(e) => {
              setLoginError(false);
              setLogin(e.target.value);
            }}
            required
            isInvalid={loginError}
            autoComplete="off"
          />
          <Form.Control.Feedback type="invalid">
            Поле не может быть пустым
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="w-100">
          <Form.Label className="mb-0">Пароль</Form.Label>
          <Form.Control
            type="password"
            value={password}
            isInvalid={passwordError}
            onChange={(e) => {
              setPasswordError(false);
              setPassword(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            required
            autoComplete="off"
          />
          <Form.Control.Feedback type="invalid">
            Поле не может быть пустым
          </Form.Control.Feedback>
        </Form.Group>
        {credentialsError && (
          <div className="alert alert-info mt-3">Неверный логин или пароль</div>
        )}
        {serverError && (
          <div className="alert alert-info mt-3">
            Ошибка на сервере. Попробуйте позже или обратитесь к администратору.
          </div>
        )}
        <Button
          className="mt-5 w-100 btn"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          Войти
        </Button>
      </Form>
    </MainContainer>
  );
};
