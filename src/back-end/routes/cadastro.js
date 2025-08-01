const express = require("express");
const router = express.Router();
const { users } = require("@clerk/clerk-sdk-node");

router.post("/", async (req, res) => {
  console.log("Recebido POST em /cadastro:", req.body);

  const { nome, email, senha } = req.body;

  try {
    const user = await users.createUser({
      username: nome,
      emailAddress: [email],
      password: senha,
    });

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: {
        nome: user.username,
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({
      message: "Erro ao criar o usuário",
      error: error.errors || error.message,
    });
  }
});

module.exports = router;
