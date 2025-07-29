require("dotenv").config({ path: "../.env" }); // Carrega as variáveis

const express = require("express");
const cors = require("cors");
const PORT = 3333;
const cadastroRoutes = require("./routes/cadastro");
const loginRoutes = require("./routes/login");
const userDataRoutes = require("./routes/UserData");
const { clerkMiddleware, clerkClient } = require("@clerk/express");

const app = express(); // Crie o app antes de usar

// Configura CORS antes de qualquer rota
app.use(
  cors({
    origin: ["http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware({clerkClient}));
app.use("/cadastro", cadastroRoutes);
app.use("/login", loginRoutes);

// Rota protegida
app.use("/user", userDataRoutes);

app.get("/profile", (req, res) => {
  const user = req.auth.user;

  res.json({
    message: "Perfil autenticado!",
    user,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
