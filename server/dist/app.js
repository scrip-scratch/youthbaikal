"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Participant_1 = require("./entity/Participant");
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const privateKey = fs_1.default.readFileSync("./cert/ssl_key.pem");
const certificate = fs_1.default.readFileSync("./cert/ssl_cert.pem");
const credentials = { key: privateKey, cert: certificate };
const app = (0, express_1.default)();
const port = process.env.PORT || 5050;
const secretToken = "746785a1-fdad-45cb-9f38-81e182e2c532";
const login = "adminyouth";
const password = "fs4ZTp";
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
}));
app.use(body_parser_1.default.json({ limit: "10mb" }));
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
const AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    port: 3306,
    username: "youth25",
    database: "youth25",
    entities: [Participant_1.Participant],
    host: "localhost",
    password: "zR5mC6wS7i",
    connectTimeout: 100000,
    synchronize: true,
});
AppDataSource.initialize()
    .then(async (connection) => {
    console.log("Соединение с базой данных установлено");
    const participantRepository = connection.getRepository(Participant_1.Participant);
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
        }
        else {
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
            user_id: (0, uuid_1.v4)(),
            user_name: req.body.user_name,
            first_time: req.body.first_time,
            user_phone: req.body.user_phone,
            paid: req.body.paid,
            spices: req.body.spices,
            payment_amount: req.body.payment_amount,
            enter_date: "",
        });
        const response = await participantRepository.save(participant);
        res.json(response);
    });
    // {
    //   body: {
    //     Name: 'test',
    //     Surname: 'test',
    //     Date: '01-01-1970',
    //     Pol: 'Мужской',
    //     Phone: '+7 (999) 999-99-99',
    //     Email: 'test@test.ru',
    //     'Сity': 'test',
    //     'Сhurch': 'test',
    //     Resettlement: 'Нет',
    //     First: 'Нет',
    //     'Сontact': 'Telegram',
    //     spices: 'На 31 января — Боул, пирожное и чай (370₽); На 31 января — Сэндвич, пирожное и чай (280₽); На 1 февраля — Сэндвич, пирожное и чай (280₽)',
    //     payment: '{"sys":"none","systranid":"0","orderid":"1118197065","products":["Участие ЮС Байкал 2025=1000","На 31 января  Боул, пирожное и чай 370=370","На 1 февраля  Сэндвич, пирожное и чай 280=280","На 31 января  Сэндвич, пирожное и чай 280=280"],"amount":"1930"}',
    //     formid: 'form818317054',
    //     formname: 'Cart'
    //   },
    //   success: true
    // }
    app.post("/tilda/participants/create", async (req, res) => {
        const participant = participantRepository.create({
            user_id: (0, uuid_1.v4)(),
            user_name: req.body.Name + " " + req.body.Surname,
            first_time: req.body.First !== "Нет",
            user_phone: req.body.Phone,
            paid: false,
            spices: req.body.spices,
            payment_amount: +JSON.parse(req.body.payment).amount,
            enter_date: "",
        });
        const response = await participantRepository.save(participant);
        res.json(response);
    });
    app.put("/participants/update/:id", async (req, res) => {
        const { paid, user_name, user_phone, first_time, token, spices, payment_amount, } = req.body;
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
            participant.user_name = user_name;
            participant.user_phone = user_phone;
            participant.first_time = first_time;
            participant.spices = spices;
            participant.payment_amount = payment_amount;
            const updatedUser = await participantRepository.save(participant);
            res.status(200).json(updatedUser);
        }
        catch (error) {
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
        }
        catch (error) {
            console.error("Ошибка при обновлении группы:", error);
            res
                .status(500)
                .json({ message: "Ошибка при обновлении группы", error });
        }
    });
    // app.listen(port, () => {
    //   console.log(`Сервер запущен на порту ${port}`);
    // });
    const httpsServer = https_1.default.createServer(credentials, app);
    httpsServer.listen(port, () => console.log(`https on ${port}`));
})
    .catch((err) => {
    console.error("Error during Data Source initialization", err);
});
