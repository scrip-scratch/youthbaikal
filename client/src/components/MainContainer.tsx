import { Container } from "react-bootstrap";

export const MainContainer = ({ children }: { children: JSX.Element }) => {
  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      {children}
    </Container>
  );
};
