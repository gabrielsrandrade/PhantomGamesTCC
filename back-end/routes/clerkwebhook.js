const express = require("express");
const router = express.Router();
const db = require("../settings/bd");

// Garantir que o JSON seja processado corretamente
router.use(express.json());

router.post("/webhook", async (req, res) => {
  console.log("🔔 Webhook recebido:", req.body);

  const { data, type } = req.body;

  if (type === "user.created") {
    const clerk_id = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const nome = data.username || "";

    try {
      await db.query(
        "INSERT INTO usuarios (clerk_id, email, nome) VALUES (?, ?, ?)",
        [clerk_id, email, nome]
      );
      console.log("Usuário salvo:", { clerk_id, email, nome });
      return res.status(200).send("Usuário salvo com sucesso");
    } catch (err) {
      console.error("Erro ao salvar usuário no banco:", err);
      return res.status(500).send("Erro ao salvar usuário");
    }
  }

  res.status(200).send("Evento ignorado");
});

module.exports = router;