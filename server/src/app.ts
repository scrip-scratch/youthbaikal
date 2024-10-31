import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Participant } from "./entity/Participant";
import http from "http";
import https from "https";
import fs from "fs";
const privateKey = fs.readFileSync("./cert/ssl_key.pem");
const certificate = fs.readFileSync("./cert/ssl_cert.pem");
const credentials = { key: privateKey, cert: certificate };

const app = express();
const port = process.env.PORT || 5050;

const secretToken = "746785a1-fdad-45cb-9f38-81e182e2c532";
const login = "youth";
const password = "youth";

app.use(cors());
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "10mb" }));

// const AppDataSource = new DataSource({
//   type: "mysql",
//   port: 8889,
//   username: "root",
//   database: "youth",
//   entities: [Participant],
//   host: "localhost",
//   password: "root",
//   connectTimeout: 100000,
//   synchronize: true,
// });
const AppDataSource = new DataSource({
  type: "mysql",
  port: 3306,
  username: "youth25",
  database: "youth25",
  entities: [Participant],
  host: "localhost",
  password: "zR5mC6wS7i",
  connectTimeout: 100000,
  synchronize: false,
});

AppDataSource.initialize()
  .then(async (connection) => {
    console.log("Соединение с базой данных установлено");

    const participantRepository = connection.getRepository(Participant);

    app.post("/validate", async (req, res) => {
      res.json({
        success: secretToken === req.body.token,
      });
    });

    app.post("/auth", async (req, res) => {
      if (req.body.login === login && req.body.password === password) {
        res.json({
          success: true,
          token: secretToken,
        });
      } else {
        res.json({
          success: false,
        });
      }
    });

    app.get("/participants", async (req, res) => {
      const participants = await participantRepository.find();
      res.json({ participants: participants });
    });

    app.get("/participants/:id", async (req, res) => {
      const participant = await participantRepository.findOneBy({
        user_id: req.params.id,
      });
      if (participant === null) {
        res.status(404).json({ success: false });
        return;
      }
      res.json({
        participant: participant,
        success: true,
      });
    });

    app.post("/participants/create", async (req, res) => {
      const participant = participantRepository.create({
        user_id: uuidv4(),
        user_name: req.body.user_name,
        first_time: req.body.first_time,
        paid: false,
        enter_date: "",
      });
      const response = await participantRepository.save(participant);
      res.json(response);
    });

    app.put("/participants/update/:id", async (req, res) => {
      const { paid, token } = req.body;

      if (token !== secretToken) {
        res.status(401).json({ message: "Нет прав на редактирование" });
        return;
      }

      try {
        const participant = await participantRepository.findOne({
          where: { user_id: req.params.id },
        });

        if (!participant) {
          res.status(404).json({ message: "Пользователь не найдена" });
          return;
        }
        participant.paid = paid;

        const updatedUser = await participantRepository.save(participant);
        res.status(200).json(updatedUser);
      } catch (error) {
        console.error("Ошибка при обновлении группы:", error);
        res
          .status(500)
          .json({ message: "Ошибка при обновлении группы", error });
      }
    });

    app.put("/participants/admit/:id", async (req, res) => {
      const { datetime, token } = req.body;

      if (token !== secretToken) {
        res.status(401).json({ message: "Нет прав на редактирование" });
        return;
      }

      try {
        const participant = await participantRepository.findOne({
          where: { user_id: req.params.id },
        });

        if (!participant) {
          res.status(404).json({ message: "Пользователь не найдена" });
          return;
        }
        participant.enter_date = datetime;

        const updatedUser = await participantRepository.save(participant);
        res.status(200).json(updatedUser);
      } catch (error) {
        console.error("Ошибка при обновлении группы:", error);
        res
          .status(500)
          .json({ message: "Ошибка при обновлении группы", error });
      }
    });

    // app.listen(port, () => {
    //   console.log(`Сервер запущен на порту ${port}`);
    // });

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port, () => console.log(`https on ${port}`));
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
