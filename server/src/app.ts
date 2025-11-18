import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Participant } from "./entity/Participant";
const privateKey = fs.readFileSync("./cert/ssl_key.pem");
const certificate = fs.readFileSync("./cert/ssl_cert.pem");
const credentials = { key: privateKey, cert: certificate };

const app = express();
const port = process.env.PORT || 5050;

const secretToken = "746785a1-fdad-45cb-9f38-81e182e2c532";
const login = "adminyouth";
const password = "fs4ZTp";

app.use(cors());
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    createParentPath: true,
  })
);

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
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [Participant],
});

AppDataSource.initialize()
  .then(async (connection) => {
    console.log("Соединение с базой данных установлено");

    const participantRepository = connection.getRepository(Participant);

    app.get("/test", async (req, res) => {
      res.json({
        success: true,
      });
    });

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
      // Генерируем номер участника
      const allParticipants = await participantRepository.find();
      const maxNumber = allParticipants.reduce((max, p) => {
        return Math.max(max, p.participant_number || 0);
      }, 0);
      const participantNumber = maxNumber + 1;

      const participant = participantRepository.create({
        user_id: uuidv4(),
        user_name: req.body.user_name,
        first_time: req.body.first_time,
        user_phone: req.body.user_phone,
        birth_date: req.body.birth_date,
        city: req.body.city,
        church: req.body.church,
        email: req.body.email,
        paid: req.body.paid,
        payment_amount: req.body.payment_amount,
        enter_date: "",
        promo_code: req.body.promo_code,
        promo_discount: req.body.promo_discount,
        participant_number: participantNumber,
        created_at: new Date().toISOString(),
      });
      const response = await participantRepository.save(participant);
      res.json({ success: true, participant: response });
    });

    // {
    //   Name: 'ТЕСТИ',
    //   Surname: 'ТЕСТИ',
    //   Date: '08-11-2025',
    //   Pol: 'Мужской',
    //   Phone: '+7 (995) 045-11-49',
    //   Email: 'jimivom891@hh7f.com',
    //   'Сity': '123123',
    //   'Сhurch': '12412',
    //   First: 'Нет',
    //   Resettlement: 'Нет',
    //   'Сontact': 'Telegram',
    //   payment: '{
    //     "sys":"none",
    //     "systranid":"0",
    //     "orderid":"1487047237",
    //     "products":["Участие ЮС Байкал 2026=1000"],
    //     "promocode":"МХЛ50",
    //     "discountvalue":"50%",
    //     "discount":"500",
    //     "subtotal":"1000",
    //     "amount":"500"
    //   }',
    //   formid: 'form1510234761',
    //   formname: 'Cart'
    // }

    // ФИО
    // Дата рождения
    // Город
    // Церковь
    // Почта
    // Промокод
    // Скидка
    // Цена
    // Оплата - есть / нет
    // Чек - можно прикрепить pdf или фото
    // Дата оплаты - вписывается в ручную

    app.post("/tilda/participants/create", async (req, res) => {
      try {
        console.log(req.body);
        let paymentData = req.body.payment;

        // 🧩 Универсальный парсер: поддержка и строки, и объектов
        if (typeof paymentData === "string") {
          try {
            // Если строка содержит HTML-коды кавычек — заменяем
            paymentData = JSON.parse(paymentData.replace(/&quot;/g, '"'));
          } catch (err) {
            console.warn("⚠️ Невозможно распарсить payment:", req.body.payment);
            paymentData = {};
          }
        } else if (typeof paymentData !== "object" || paymentData === null) {
          paymentData = {};
        }

        const userName = `${req.body.Name || ""} ${
          req.body.Surname || ""
        }`.trim();
        const userPhone = req.body.Phone || "";

        // Проверяем, есть ли просроченная заявка с таким же именем и телефоном
        const existingParticipants = await participantRepository.find({
          where: [{ user_name: userName, user_phone: userPhone }],
        });

        let existingParticipant = null;
        if (existingParticipants.length > 0) {
          // Проверяем, есть ли просроченная заявка (не оплачена в течение 3 дней)
          for (const p of existingParticipants) {
            if (!p.paid && !p.payment_date) {
              const createdAt = p.created_at ? new Date(p.created_at) : null;
              if (createdAt) {
                const daysDiff =
                  (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                if (daysDiff > 3) {
                  existingParticipant = p;
                  break;
                }
              } else {
                // Если нет created_at, считаем просроченной
                existingParticipant = p;
                break;
              }
            }
          }
        }

        // Генерируем номер участника
        const allParticipants = await participantRepository.find();
        const maxNumber = allParticipants.reduce((max, p) => {
          return Math.max(max, p.participant_number || 0);
        }, 0);
        const participantNumber = maxNumber + 1;

        if (existingParticipant) {
          // Обновляем существующую просроченную заявку
          existingParticipant.user_name = userName;
          existingParticipant.first_time = req.body.First !== "Нет";
          existingParticipant.user_phone = userPhone;
          existingParticipant.birth_date = req.body.Date || "";
          existingParticipant.city = req.body.City || "";
          existingParticipant.church = req.body.Church || "";
          existingParticipant.email = req.body.Email || "";
          existingParticipant.payment_amount = Number(paymentData.amount) || 0;
          existingParticipant.promo_code = paymentData.promocode || "";
          existingParticipant.promo_discount =
            Number(paymentData.discount) || 0;
          existingParticipant.paid = false;
          existingParticipant.payment_date = "";
          existingParticipant.created_at = new Date().toISOString();

          const response = await participantRepository.save(
            existingParticipant
          );
          res.json(response);
        } else {
          // Создаем нового участника
          const participant = participantRepository.create({
            user_id: uuidv4(),
            user_name: userName,
            first_time: req.body.First !== "Нет",
            user_phone: userPhone,
            birth_date: req.body.Date || "",
            paid: false,
            city: req.body.City || "",
            church: req.body.Church || "",
            email: req.body.Email || "",
            payment_amount: Number(paymentData.amount) || 0,
            enter_date: "",
            promo_code: paymentData.promocode || "",
            promo_discount: Number(paymentData.discount) || 0,
            participant_number: participantNumber,
            created_at: new Date().toISOString(),
          });

          const response = await participantRepository.save(participant);
          res.json(response);
        }
      } catch (error) {
        console.error("❌ Ошибка при создании участника:", error);
        res.status(500).json({
          message: "Ошибка при создании участника",
          error: (error as Error).message,
        });
      }
    });

    app.put("/participants/update/:id", async (req, res) => {
      const {
        paid,
        user_name,
        user_phone,
        birth_date,
        first_time,
        token,
        city,
        church,
        email,
        payment_amount,
        promo_code,
        promo_discount,
        payment_date,
        letter_date,
      } = req.body;

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
        participant.birth_date = birth_date;
        participant.first_time = first_time;
        participant.city = city;
        participant.church = church;
        participant.email = email;
        participant.payment_amount = payment_amount;
        participant.promo_code = promo_code;
        participant.promo_discount = promo_discount;
        if (payment_date !== undefined) {
          participant.payment_date = payment_date;
        }
        if (letter_date !== undefined) {
          participant.letter_date = letter_date;
        }

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

    app.delete("/participants/delete/:id", async (req, res) => {
      const { token } = req.body;

      if (token !== secretToken) {
        res.status(401).json({ message: "Нет прав на удаление" });
        return;
      }

      try {
        const participant = await participantRepository.findOne({
          where: { user_id: req.params.id },
        });

        if (!participant) {
          res.status(404).json({ message: "Пользователь не найден" });
          return;
        }

        await participantRepository.remove(participant);
        res.status(200).json({ success: true, message: "Пользователь удален" });
      } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        res
          .status(500)
          .json({ message: "Ошибка при удалении пользователя", error });
      }
    });

    app.post("/participants/upload-bill/:id", async (req, res) => {
      const { token } = req.body;
      const { id } = req.params;

      if (token !== secretToken) {
        res.status(401).json({ message: "Нет прав на загрузку чека" });
        return;
      }

      try {
        const participant = await participantRepository.findOne({
          where: { user_id: id },
        });

        if (!participant) {
          res.status(404).json({ message: "Пользователь не найден" });
          return;
        }

        // проверяем, пришёл ли файл
        if (!req.files || !req.files.bill) {
          res.status(400).json({ message: "Файл не загружен" });
          return;
        }

        // Получаем файл
        const bill = req.files.bill as fileUpload.UploadedFile;

        // Генерируем уникальное имя файла, например, по user_id и дате
        const fileExt = bill.name.split(".").pop();
        const fileName = `bill_${id}_${Date.now()}.${fileExt}`;
        const billsDir = path.join(__dirname, "..", "bills");
        const filePath = path.join(billsDir, fileName);

        // создаём директорию, если её нет
        if (!fs.existsSync(billsDir)) {
          fs.mkdirSync(billsDir, { recursive: true });
        }

        // Удаляем старый файл, если он существует
        if (participant.billFile) {
          const oldFilePath = path.join(billsDir, participant.billFile);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Сохраняем файл на диск
        await bill.mv(filePath);

        // Обновляем название файла в базе
        participant.billFile = fileName;
        await participantRepository.save(participant);

        res
          .status(200)
          .json({ success: true, message: "Чек загружен", fileName });
      } catch (error) {
        console.error("Ошибка при загрузке чека:", error);
        res.status(500).json({ message: "Ошибка при загрузке чека", error });
      }
    });

    app.get("/participants/download-bill/:id", async (req, res) => {
      const { id } = req.params;
      const { token } = req.query;

      if (token !== secretToken) {
        res.status(401).json({ message: "Нет прав на скачивание чека" });
        return;
      }

      try {
        const participant = await participantRepository.findOne({
          where: { user_id: id },
        });

        if (!participant) {
          res.status(404).json({ message: "Пользователь не найден" });
          return;
        }

        if (!participant.billFile) {
          res.status(404).json({ message: "Чек не найден" });
          return;
        }

        const billsDir = path.join(__dirname, "..", "bills");
        const filePath = path.join(billsDir, participant.billFile);

        if (!fs.existsSync(filePath)) {
          res.status(404).json({ message: "Файл чека не найден на сервере" });
          return;
        }

        res.download(filePath, participant.billFile, (err) => {
          if (err) {
            console.error("Ошибка при скачивании чека:", err);
            res.status(500).json({ message: "Ошибка при скачивании чека" });
          }
        });
      } catch (error) {
        console.error("Ошибка при скачивании чека:", error);
        res.status(500).json({ message: "Ошибка при скачивании чека", error });
      }
    });

    // app.listen(port, () => {
    //   console.log(`Сервер запущен на порту ${port}`);
    // });
    app.listen(port, () => console.log(`http on ${port}`));

    // const httpsServer = https.createServer(credentials, app);
    // httpsServer.listen(port, () => console.log(`https on ${port}`));
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
