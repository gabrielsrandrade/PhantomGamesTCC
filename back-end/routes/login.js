const express = require("express");
const router = express.Router();
const { ClerkExpressWithAuth, users } = require("@clerk/clerk-sdk-node");

const clerkMiddleware = ClerkExpressWithAuth();

router.get("/", clerkMiddleware, async (req, res) => {
  const { userId } = req.auth;

  if (!userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const user = await users.getUser(userId);

    res.status(200).json({
      message: "Login verificado com sucesso",
      user: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        nome: user.username,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar usuário" });
  }
});

module.exports = router;
