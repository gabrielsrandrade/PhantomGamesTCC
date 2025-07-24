require('dotenv').config(); // Carrega as variáveis

// Carregar variáveis para chaves do Clerk
console.log("CLERK_API_KEY:", process.env.CLERK_API_KEY); // Variável para a chave da API
console.log("CLERK_FRONTEND_API:", process.env.CLERK_FRONTEND_API); // Variável para a chave do Frontend API

const express = require("express");
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node"); // Importa o middleware do Clerk
const { users } = require("@clerk/clerk-sdk-node"); // Importa o SDK do Clerk
const app = express();
const cadastroRoutes = require("./cadastro"); // Rota do Cadastro

// Configura o middleware para autenticação
const clerkMiddleware = ClerkExpressWithAuth();

// Usando o middleware para autenticação das rotas (exceto cadastro)
app.use(express.json()); // Permite que o Express leia JSON na requisição

// Rota pública (não precisa de autenticação)
app.use("/cadastro", cadastroRoutes);

// Rota protegida (precisa de autenticação)
app.get("/profile", clerkMiddleware, (req, res) => {
  const user = req.auth.user; // Obtendo as informações do usuário autenticado

  res.json({
    message: "Perfil autenticado!",
    user,
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
