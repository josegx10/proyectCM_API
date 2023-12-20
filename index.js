import "dotenv/config";
import express from "express";
import { createPool } from "mysql2/promise";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 4000;
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*const pool = mysql.createPool({
  host: "db4free.net",
  user: "userjose12",
  password: "User1234",
  database: "basepcm",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});*/

const pool = createPool({
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
});

async function buscar(fecha, hora) {
  const [data] = await pool.query(
    `select * from citas where fecha = '${fecha}' && hora = '${hora}'`
  );
  return data.length;
}

app.get("/citas", async (req, res) => {
  const [data] = await pool.query("select * from citas");

  return res.json(data);
});
app.get("/citas/:fecha/:hora", async (req, res) => {
  const [data] = await pool.query(
    `select * from citas where fecha = '${req.params.fecha}' && hora = '${req.params.hora}'`
  );
  if (data.length == 0) {
    return res.sendStatus(200);
  }

  return res.sendStatus(404);
});
app.post("/citas", async (req, res) => {
  if ((await buscar(req.body.fecha, req.body.hora)) > 0) {
    return res.sendStatus(404);
  }
  const data = await pool.query(
    "INSERT INTO citas (nombre, fecha, motivo, hora, telefono, pago, status, count, idCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      req.body.nombre,
      req.body.fecha,
      req.body.motivo,
      req.body.hora,
      req.body.telefono,
      req.body.pago,
      req.body.status,
      req.body.count,
      req.body.idCount,
    ]
  );
  res.json({
    data,
  });
});
app.put("/citas/:id", async (req, res) => {
  const {
    nombre,
    fecha,
    motivo,
    hora,
    telefono,
    pago,
    status,
    count,
    idCount,
  } = req.body;
  const registroId = req.params.id;
  const data = await pool.query(
    "UPDATE citas SET nombre=?, fecha=?, motivo=?, hora=?, telefono=?, pago=?, status=?, count=?, idCount=? WHERE id=?",
    [
      nombre,
      fecha,
      motivo,
      hora,
      telefono,
      pago,
      status,
      count,
      idCount,
      registroId,
    ]
  );
  res.json({
    data,
  });
});
app.put("/citas/all/:id", async (req, res) => {
  const { nombre, motivo, telefono, pago } = req.body;
  const registroId = req.params.id;
  const data = await pool.query(
    "UPDATE citas SET nombre=?, motivo=?, telefono=?, pago=? WHERE idCount=?",
    [nombre, motivo, telefono, pago, registroId]
  );
  res.json({
    data,
  });
});
app.delete("/citas/:id", async (req, res) => {
  const registroId = req.params.id;
  const [data] = await pool.query("DELETE FROM citas WHERE id=?", [registroId]);
  res.json({
    data,
  });
});
app.delete("/citas/all/:id", async (req, res) => {
  const registroId = req.params.id;
  const [data] = await pool.query("DELETE FROM citas WHERE idCount=?", [
    registroId,
  ]);
  res.json({
    data,
  });
});

app.listen(port, () => {
  console.log("server iniciado");
});
