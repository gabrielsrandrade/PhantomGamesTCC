const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch'); // Importe a biblioteca node-fetch
const { randomBytes } = require('crypto');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve a pasta de uploads estaticamente para que as imagens fiquem acessíveis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Adicione esta linha no topo do seu arquivo, junto com as outras importações
const crypto = require('crypto');

// Função auxiliar para obter a extensão a partir do Content-Type
function getFileExtensionFromContentType(contentType) {
    if (!contentType) {
        return '.jpg'; 
    }
    const mimeMap = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/bmp': '.bmp',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
    };
    return mimeMap[contentType] || '.jpg';
}

// --- FUNÇÃO PARA BAIXAR E SALVAR A IMAGEM ---
async function downloadAndSaveImage(url) {
    try {
        if (!url) {
            console.error("URL fornecida é nula ou vazia.");
            return null;
        }

        let fileExtension;
        let fileData;

        // 1. Lida com URIs de Dados (data:...)
        if (url.startsWith('data:')) {
            const parts = url.split(';base64,');
            if (parts.length < 2) {
                console.error("URI de dados inválida.");
                return null;
            }

            const contentTypePart = parts[0].split(':')[1];
            fileExtension = getFileExtensionFromContentType(contentTypePart);
            
            const base64Data = parts[1];
            fileData = Buffer.from(base64Data, 'base64');
        } 
        
        // 2. Lida com URLs de internet (http/https)
        else if (url.startsWith('http://') || url.startsWith('https://')) {
            let imageUrl = url;
            if (url.includes('google.com/imgres')) {
                const urlObject = new URL(url);
                const imgUrlParam = urlObject.searchParams.get('imgurl');
                if (imgUrlParam) {
                    imageUrl = imgUrlParam;
                } else {
                    console.error("Não foi possível extrair a URL da imagem do link do Google.");
                    return null;
                }
            }

            const response = await fetch(imageUrl);
            
            if (!response.ok) {
                console.error(`Erro ao baixar a imagem da URL: ${imageUrl}`);
                return null;
            }

            const contentType = response.headers.get('content-type');
            fileExtension = getFileExtensionFromContentType(contentType);
            
            fileData = await response.buffer();
        } 
        
        // 3. Lida com qualquer outro tipo de URL
        else {
            console.error(`URL fornecida é inválida: ${url}`);
            return null;
        }

        // --- Salva o arquivo no disco (lógica unificada) ---
        const uniqueFileName = crypto.randomBytes(16).toString('hex') + fileExtension;
        const filePath = path.join(__dirname, 'uploads', uniqueFileName);

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        fs.writeFileSync(filePath, fileData);

        console.log(`Imagem salva com sucesso: ${filePath}`);
        return `/uploads/${uniqueFileName}`;

    } catch (error) {
        console.error("Erro ao processar imagem:", error.message);
        return null;
    }
}

// Rota POST para adicionar um novo jogo, categorias e gêneros
app.post("/adicionar-jogo", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const {
            Nome_jogo,
            Descricao_jogo,
            Preco_jogo,
            Logo_jogo,
            Capa_jogo,
            Midias_jogo, // Esta variável já é um array
            Faixa_etaria,
            categorias = [],
            generos = [],
        } = req.body;

        if (!Nome_jogo || !Preco_jogo) {
            await connection.rollback();
            return res.status(400).send("Nome do jogo e preço são obrigatórios.");
        }

        // Processa a imagem da capa e do logo
        const capaUrl = await downloadAndSaveImage(Capa_jogo);
        const logoUrl = Logo_jogo ? await downloadAndSaveImage(Logo_jogo) : null;
        
        if (!capaUrl) {
            await connection.rollback();
            return res.status(400).send("URL de capa inválida ou inacessível.");
        }

        // 1. Inserir o novo jogo na tabela 'jogos'
        const gameSql = `
            INSERT INTO jogos (Nome_jogo, Preco_jogo, Logo_jogo, Descricao_jogo, Capa_jogo, Faixa_etaria, Media_nota)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const gameValues = [
            Nome_jogo,
            Preco_jogo,
            logoUrl,
            Descricao_jogo,
            capaUrl,
            Faixa_etaria,
            10.0,
        ];
        const [gameResult] = await connection.execute(gameSql, gameValues);
        const jogoId = gameResult.insertId;
        console.log(`Jogo inserido com sucesso! ID do jogo: ${jogoId}`);

        // 2. Inserir as mídias na tabela 'midias_jogo'
        if (Midias_jogo && Array.isArray(Midias_jogo) && Midias_jogo.length > 0) {
            const midiasValues = [];

            // Processa todas as mídias em paralelo para melhor performance
            const savedUrls = await Promise.all(Midias_jogo.map(url => downloadAndSaveImage(url)));
            
            savedUrls.forEach(savedUrl => {
                if (savedUrl) {
                    midiasValues.push([jogoId, savedUrl]);
                }
            });

            if (midiasValues.length > 0) {
                await connection.query(
                    "INSERT INTO midias_jogo (ID_jogo, URL_midia) VALUES ?",
                    [midiasValues]
                );
                console.log(`Mídias adicionadas para o jogo ${jogoId}.`);
            }
        }
        
        // 3. Inserir categorias
        if (categorias && Array.isArray(categorias) && categorias.length > 0) {
            const placeholders = categorias.map(() => '?').join(',');
            const [existingCategories] = await connection.execute(
                `SELECT ID_categoria FROM categoria WHERE Nome IN (${placeholders})`,
                categorias
            );
            const categoriaValues = existingCategories.map(row => [row.ID_categoria, jogoId]);
            if (categoriaValues.length > 0) {
                await connection.query(
                    "INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES ?",
                    [categoriaValues]
                );
                console.log(`Vínculos de categorias criados para o jogo ${jogoId}.`);
            }
        }

        // 4. Inserir gêneros
        if (generos && Array.isArray(generos) && generos.length > 0) {
            const placeholders = generos.map(() => '?').join(',');
            const [existingGenres] = await connection.execute(
                `SELECT ID_genero FROM genero WHERE Nome IN (${placeholders})`,
                generos
            );
            const generoValues = existingGenres.map(row => [row.ID_genero, jogoId]);
            if (generoValues.length > 0) {
                await connection.query(
                    "INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES ?",
                    [generoValues]
                );
                console.log(`Vínculos de gêneros criados para o jogo ${jogoId}.`);
            }
        }

        await connection.commit();
        res.status(200).send("Jogo, categorias, gêneros e mídias adicionados com sucesso!");
        
    } catch (err) {
        if (connection) {
            await connection.rollback();
            console.error("Transação desfeita devido a um erro.");
        }
        console.error("Erro na rota /adicionar-jogo:", err.message);
        res.status(500).send("Erro interno do servidor ao adicionar jogo.");
    } finally {
        if (connection) {
            connection.release();
            console.log("Conexão liberada.");
        }
    }
});

// A rota GET já estava correta, pois ela já busca das tabelas de relacionamento.
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

app.get("/", (req, res) => {
    res.status(200).send("Servidor está rodando.");
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});