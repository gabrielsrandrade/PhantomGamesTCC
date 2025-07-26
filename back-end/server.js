require("dotenv").config(); // Carrega as variáveis

const express = require("express");
const cors = require("cors");
const PORT = 3000;
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const webhookRoute = require("./routes/clerkwebhook");
const cadastroRoutes = require("./routes/cadastro");
const loginRoutes = require("./routes/login");
const userDataRoutes = require("./routes/UserData");

const app = express(); // Crie o app antes de usar

// Configura CORS antes de qualquer rota
app.use(
  cors({
    origin: ["http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

console.log("CLERK_API_KEY:", process.env.CLERK_API_KEY);
console.log("CLERK_FRONTEND_API:", process.env.CLERK_FRONTEND_API);

const clerkMiddleware = ClerkExpressWithAuth();

app.use(express.json());

app.use("/webhooks/clerk", webhookRoute);

app.use("/cadastro", cadastroRoutes);
app.use("/login", loginRoutes);

// Rota protegida
app.use("/user", userDataRoutes);

app.get("/profile", clerkMiddleware, (req, res) => {
  const user = req.auth.user;

  res.json({
    message: "Perfil autenticado!",
    user,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
