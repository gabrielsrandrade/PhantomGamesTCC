const express = require('express');
const router = express.Router();
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const db = require('../settings/bd');

const clerkMiddleware = ClerkExpressWithAuth();

router.get('/me', clerkMiddleware, async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Exemplo: Buscar dados do usuário no MySQL
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE clerk_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado no banco.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

module.exports = router;