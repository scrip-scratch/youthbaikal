import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { useRoutes } from "./routes/routes";

function App() {
  const routes = useRoutes();

  return <>{routes}</>;
}

export default App;
