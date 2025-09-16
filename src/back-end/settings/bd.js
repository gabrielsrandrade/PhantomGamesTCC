const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser"); // Usado para json e urlencoded
const cors = require("cors");
const path = require('path');
const fs = require('fs');
// const fetch = require('node-fetch'); // Removido, pois não é mais usado
const crypto = require('crypto'); // Mantido para geração de nomes de arquivo únicos, se necessário para outras partes
const multer = require('multer'); // Importado para o upload de arquivos

const app = express();
const port = 3000;

app.use(cors());
// Mantenha bodyParser.json() e bodyParser.urlencoded() se você ainda precisa deles para outras rotas.
// Para a rota de upload com Multer, não precisamos de bodyParser.json().
app.use(express.json()); // Alternativa moderna ao bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Alternativa moderna ao bodyParser.urlencoded()

// Serve a pasta de uploads estaticamente para que as imagens fiquem acessíveis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let fileExtension = path.extname(file.originalname);

        // Lógica para verificar o Content-Type e ajustar a extensão se necessário
        const contentType = file.mimetype; // Multer adiciona mimetype ao objeto do arquivo
        if (contentType === 'image/jpeg' && fileExtension.toLowerCase() === '.jfif') {
            fileExtension = '.jpg'; // Corrige de .jfif para .jpg se for JPEG
        } else if (contentType && contentType.startsWith('image/')) {
            // Tenta obter a extensão correta a partir do content type se disponível
            const mimeMap = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/bmp': '.bmp',
                'image/webp': '.webp',
                'image/svg+xml': '.svg',
            };
            const mappedExtension = mimeMap[contentType.toLowerCase()] || fileExtension;
            if (mappedExtension !== fileExtension) {
                fileExtension = mappedExtension;
            }
        }

        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: storage });


// Configurações do seu banco de dados
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "PhantomGames",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Cria um pool de conexões
const pool = mysql.createPool(dbConfig);

// Verifica a conexão
async function checkDatabaseConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("Pool de conexões com o banco de dados criado com sucesso!");
    } catch (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
checkDatabaseConnection();


// --- Rota para adicionar jogo com upload de arquivos via FormData ---
// upload.array('Midias_jogo') espera um array de arquivos com o nome 'Midias_jogo'
app.post("/adicionar-jogo-file", upload.array('Midias_jogo', 10), async (req, res) => { // O segundo argumento (10) limita a 10 arquivos por upload
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Os dados não relacionados aos arquivos são enviados como campos de texto no FormData
        const {
            Nome_jogo,
            Descricao_jogo,
            Preco_jogo,
            Logo_jogo,
            Capa_jogo,
            Faixa_etaria,
            categorias, // Estes virão como strings JSON do FormData
            generos     // Estes virão como strings JSON do FormData
        } = req.body;

        // Converte as strings JSON de volta para arrays
        const categoriasArray = JSON.parse(categorias);
        const generosArray = JSON.parse(generos);

        if (!Nome_jogo || !Preco_jogo) {
            await connection.rollback();
            return res.status(400).send("Todos os campos são obrigatórios.");
        }

        // --- 1. Inserir o novo jogo na tabela 'jogos' ---
        const gameSql = `
            INSERT INTO jogos (Nome_jogo, Preco_jogo, Logo_jogo, Descricao_jogo, Capa_jogo, Faixa_etaria, Media_nota)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const gameValues = [
            Nome_jogo,
            parseFloat(Preco_jogo), // Converte o preço para número
            Logo_jogo, // Logo e Capa ainda são tratadas como URLs
            Descricao_jogo,
            Capa_jogo,
            Faixa_etaria,
            10.0, // Valor padrão para Media_nota
        ];
        const [gameResult] = await connection.execute(gameSql, gameValues);
        const jogoId = gameResult.insertId;
        console.log(`Jogo inserido com sucesso! ID do jogo: ${jogoId}`);

        // --- 2. Inserir as mídias na tabela 'midias_jogo' ---
        // req.files contém as informações sobre os arquivos que foram enviados e salvos pelo Multer
        if (req.files && req.files.length > 0) {
            const midiasValues = req.files.map(file => {
                // file.filename contém o nome do arquivo salvo pelo Multer
                return [jogoId, `/uploads/${file.filename}`];
            });

            await connection.query(
                "INSERT INTO midias_jogo (ID_jogo, URL_midia) VALUES ?",
                [midiasValues]
            );
            console.log(`Mídias adicionadas para o jogo ${jogoId}.`);
        } else {
            console.log(`Nenhuma mídia enviada para o jogo ${jogoId}.`);
        }

        // --- 3. Inserir categorias ---
        if (categoriasArray && categoriasArray.length > 0) {
            // Busca as IDs das categorias existentes pelo nome
            const placeholders = categoriasArray.map(() => '?').join(',');
            const [existingCategories] = await connection.execute(
                `SELECT ID_categoria FROM categoria WHERE Nome IN (${placeholders})`,
                categoriasArray
            );
            // Cria os pares de (ID_categoria, ID_jogo) para inserção
            const categoriaValues = existingCategories.map(row => [row.ID_categoria, jogoId]);
            if (categoriaValues.length > 0) {
                await connection.query(
                    "INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES ?",
                    [categoriaValues]
                );
                console.log(`Vínculos de categorias criados para o jogo ${jogoId}.`);
            }
        }

        // --- 4. Inserir gêneros ---
        if (generosArray && generosArray.length > 0) {
            // Busca as IDs dos gêneros existentes pelo nome
            const placeholders = generosArray.map(() => '?').join(',');
            const [existingGenres] = await connection.execute(
                `SELECT ID_genero FROM genero WHERE Nome IN (${placeholders})`,
                generosArray
            );
            // Cria os pares de (ID_genero, ID_jogo) para inserção
            const generoValues = existingGenres.map(row => [row.ID_genero, jogoId]);
            if (generoValues.length > 0) {
                await connection.query(
                    "INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES ?",
                    [generoValues]
                );
                console.log(`Vínculos de gêneros criados para o jogo ${jogoId}.`);
            }
        }

        await connection.commit(); // Confirma a transação
        res.status(200).send("Jogo adicionado com sucesso!");

    } catch (err) {
        if (connection) {
            await connection.rollback(); // Desfaz a transação em caso de erro
            console.error("Transação desfeita devido a um erro.");
        }
        console.error("Erro na rota /adicionar-jogo-file:", err.message);
        // Logar o stack trace pode ser útil para depuração
        console.error("Stack trace:", err.stack);
        res.status(500).send("Erro interno do servidor ao adicionar jogo.");
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão de volta para o pool
            console.log("Conexão liberada.");
        }
    }
});

// Rota para buscar jogos (mantida como estava)
app.get("/jogos", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [jogosRows] = await connection.execute("SELECT * FROM jogos");
        const [categoriasRows] = await connection.execute("SELECT cj.ID_jogo, c.Nome FROM categoria_jogos AS cj INNER JOIN categoria AS c ON cj.ID_categoria = c.ID_categoria");
        const categoriasMap = categoriasRows.reduce((acc, row) => { acc[row.ID_jogo] = acc[row.ID_jogo] || []; acc[row.ID_jogo].push(row.Nome); return acc; }, {});
        const [generosRows] = await connection.execute("SELECT gj.ID_jogo, g.Nome FROM genero_jogos AS gj INNER JOIN genero AS g ON gj.ID_genero = g.ID_genero");
        const generosMap = generosRows.reduce((acc, row) => { acc[row.ID_jogo] = acc[row.ID_jogo] || []; acc[row.ID_jogo].push(row.Nome); return acc; }, {});
        const [midiasRows] = await connection.execute("SELECT ID_jogo, URL_midia FROM midias_jogo");
        const midiasMap = midiasRows.reduce((acc, row) => { acc[row.ID_jogo] = acc[row.ID_jogo] || []; acc[row.ID_jogo].push(row.URL_midia); return acc; }, {});
        const jogosComDetalhes = jogosRows.map(jogo => ({
            ...jogo,
            categorias: categoriasMap[jogo.ID_jogo] || [],
            generos: generosMap[jogo.ID_jogo] || [],
            midias: midiasMap[jogo.ID_jogo] || [],
        }));
        res.status(200).json(jogosComDetalhes);
    } catch (err) {
        console.error("Erro ao buscar jogos:", err.message);
        res.status(500).send("Erro interno do servidor ao buscar os jogos.");
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Rota raiz (mantida)
app.get("/", (req, res) => {
    res.status(200).send("Servidor está rodando.");
});

// Inicia o servidor (mantido)
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});