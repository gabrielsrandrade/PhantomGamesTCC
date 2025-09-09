const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "PhantomGames"
});

connection.connect(function (err) {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        return;
    }
    console.log("Conexão com o banco de dados feita!");
});

// Rota POST para adicionar um novo jogo (já estava funcionando)
app.post('/adicionar-jogo', (req, res) => {
    console.log('Dados recebidos:', req.body);
    const { Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria } = req.body;

    if (!Nome_jogo || !Descricao_jogo || !Preco_jogo || !Capa_jogo || !Faixa_etaria) {
        return res.status(400).send('Campos obrigatórios faltando. Por favor, preencha todos os campos necessários.');
    }

    const sql = `INSERT INTO jogos (Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erro na query SQL:', err);
            return res.status(500).send("Erro interno do servidor ao adicionar jogo. Verifique o console para mais detalhes.");
        }
        
        console.log('Jogo adicionado com sucesso! ID:', result.insertId);
        res.status(200).send("Jogo adicionado com sucesso!");
    });
});

// --- Nova Rota para a Barra de Pesquisa ---

app.get('/buscar-jogo', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Parâmetro de busca "query" é obrigatório.' });
    }

    const searchQuery = `%${query}%`;
    const sql = `SELECT * FROM jogos WHERE Nome_jogo LIKE ?`;

    connection.query(sql, [searchQuery], (err, results) => {
        if (err) {
            console.error('Erro na query de busca:', err);
            return res.status(500).json({ message: 'Erro interno do servidor ao buscar jogos.' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Nenhum jogo encontrado com esse nome.' });
        }

        res.status(200).json(results);
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});