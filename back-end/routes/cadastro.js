const express = require('express');
const { users } = require('@clerk/clerk-sdk-node');

const router = express.Router(); // Cria um novo roteador

// Define a rota POST /cadastro
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await users.createUser({
      emailAddress: [email],
      password,
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar o usuário', error: error.errors });
  }
});

module.exports = router; // Exporta o roteador