const express = require("express");
const router = express.Router();
const { clerkClient } = require("@clerk/express");

router.post("/", async (req, res) => {
  const { userId } = req.auth;
  console.log(req.body)
  console.log(userId)
  console.log(req)
  if (!userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const user = await clerkClient.users.getUser(userId);

    console.log(res.json(user));

    res.status(200).json({
      message: "Login verificado com sucesso",
      user: {
        id: user.id,
        role: user.publicMetadata,
        email: user.emailAddresses?.[0]?.emailAddress,
        nome: user.username
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar usuário" });
  }
});

module.exports = router;
