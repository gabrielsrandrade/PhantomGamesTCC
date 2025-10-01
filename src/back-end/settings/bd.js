// --- 1. IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS ---
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const port = 3000;

// --- 2. CONFIGURAÇÃO DE SEGURANÇA (CLERK E STRIPE) ---
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
if (!CLERK_SECRET_KEY || !CLERK_SECRET_KEY.startsWith("sk_")) {
    throw new Error("A chave secreta do Clerk (CLERK_SECRET_KEY) parece estar ausente ou inválida.");
}

// --- 3. MIDDLEWARES ---
app.use(cors({
    origin: 'http://localhost:5173', // Permite requisições do seu front-end
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Middleware de verificação do Clerk
const clerkAuthMiddleware = ClerkExpressWithAuth({ secretKey: CLERK_SECRET_KEY });
// Middleware para verificar se o usuário é admin
const isAdminMiddleware = async (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute("SELECT is_admin FROM usuario WHERE ID_usuario = ?", [req.auth.userId]);
        if (rows.length === 0 || !rows[0].is_admin) {
            return res.status(403).json({ message: "Acesso negado. Requer permissão de administrador." });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Erro ao verificar permissões." });
    } finally {
        if (connection) connection.release();
    }
};

// --- 4. CONFIGURAÇÃO DE UPLOAD (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// --- 5. CONFIGURAÇÃO DO BANCO DE DADOS ---
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "PhantomGames",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = mysql.createPool(dbConfig);
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Pool de conexões com o banco de dados criado com sucesso!");
        connection.release();
    } catch (err) {
        console.error("ERRO FATAL: Não foi possível conectar ao banco de dados:", err.message);
        process.exit(1);
    }
})();

app.get("/", (req, res) => res.status(200).send("Servidor PhantomGames está no ar."));

app.post("/salvar-usuario", async (req, res) => {
    const { id, nome, imagem_perfil } = req.body;
    if (!id || !nome) return res.status(400).json({ message: "ID e nome são obrigatórios." });
    let connection;
    try {
        connection = await pool.getConnection();
        const [user] = await connection.execute("SELECT ID_usuario FROM usuario WHERE ID_usuario = ?", [id]);
        if (user.length > 0) {
            await connection.execute("UPDATE usuario SET Nome = ?, Imagem_perfil = ? WHERE ID_usuario = ?", [nome, imagem_perfil, id]);
            res.status(200).json({ message: "Usuário atualizado." });
        } else {
            await connection.execute("INSERT INTO usuario (ID_usuario, Nome, Imagem_perfil) VALUES (?, ?, ?)", [id, nome, imagem_perfil]);
            res.status(201).json({ message: "Usuário salvo." });
        }
    } catch (err) { res.status(500).json({ message: "Erro interno do servidor." }); }
    finally { if (connection) connection.release(); }
});

// ROTAS PÚBLICAS DE JOGOS E METADADOS
app.get("/jogos", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [jogos] = await connection.execute("SELECT * FROM jogos ORDER BY Nome_jogo ASC");
        res.status(200).json(jogos);
    } catch (err) { res.status(500).json({ message: "Erro ao buscar jogos." }); }
    finally { if (connection) connection.release(); }
});

app.get("/jogos/:id",ClerkExpressWithAuth(), async (req, res) => {
    const jogoId = req.params.id;
    const userId = req.auth?.userId; 
    let connection;

    try {
        connection = await pool.getConnection();
        const [jogosRows] = await connection.execute("SELECT * FROM jogos WHERE ID_jogo = ?", [jogoId]);
        if (jogosRows.length === 0) return res.status(404).json({ message: "Jogo não encontrado." });

        const [categoriasRows] = await connection.execute("SELECT c.Nome FROM categoria_jogos cj JOIN categoria c ON cj.ID_categoria = c.ID_categoria WHERE cj.ID_jogo = ?", [jogoId]);
        const [generosRows] = await connection.execute("SELECT g.Nome FROM genero_jogos gj JOIN genero g ON gj.ID_genero = g.ID_genero WHERE gj.ID_jogo = ?", [jogoId]);
        const [midiasRows] = await connection.execute("SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?", [jogoId]);

        const jogoCompleto = { 
            ...jogosRows[0], 
            categorias: categoriasRows.map(r => r.Nome), 
            generos: generosRows.map(r => r.Nome), 
            midias: midiasRows.map(r => r.URL_midia),
            isInCart: false,
            isInWishlist: false,
            isOwned: false // Adicionamos este campo
        };

        if (userId) {
            const [cartRows] = await connection.execute("SELECT 1 FROM carrinho_itens WHERE ID_usuario = ? AND ID_jogo = ?", [userId, jogoId]);
            jogoCompleto.isInCart = cartRows.length > 0;

            const [wishlistRows] = await connection.execute("SELECT 1 FROM lista_desejos WHERE ID_usuario = ? AND ID_jogo = ?", [userId, jogoId]);
            jogoCompleto.isInWishlist = wishlistRows.length > 0;
            
            // **VERIFICAÇÃO DA BIBLIOTECA**
            const [libraryRows] = await connection.execute("SELECT 1 FROM biblioteca WHERE ID_usuario = ? AND ID_jogo = ?", [userId, jogoId]);
            jogoCompleto.isOwned = libraryRows.length > 0;
        }

        res.status(200).json(jogoCompleto);

    } catch (err) { 
        console.error("Erro em /jogos/:id:", err);
        res.status(500).json({ message: "Erro ao buscar detalhes do jogo." }); 
    }
    finally { 
        if (connection) connection.release(); 
    }
});

app.get("/buscar-jogo", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(200).json([]);
    let connection;
    try {
        connection = await pool.getConnection();
        const [jogos] = await connection.execute("SELECT * FROM jogos WHERE Nome_jogo LIKE ?", [`%${query}%`]);
        res.status(200).json(jogos);
    } catch (err) { res.status(500).json({ message: "Erro no servidor ao buscar jogos." }); }
    finally { if (connection) connection.release(); }
});

app.get("/filtrar-jogos", async (req, res) => {
    const { genero, categoria, preco, avaliacao } = req.query;
    
    try {
        let sql = `
            SELECT DISTINCT j.* FROM jogos j
        `;
        let params = [];
        let joins = [];
        let wheres = [];

        // Filtro por Gênero
        if (genero) {
            joins.push(`
                INNER JOIN genero_jogos gj ON j.ID_jogo = gj.ID_jogo
                INNER JOIN genero g ON gj.ID_genero = g.ID_genero
            `);
            wheres.push("g.Nome = ?");
            params.push(genero);
        }

        // Filtro por Categoria
        if (categoria) {
            joins.push(`
                INNER JOIN categoria_jogos cj ON j.ID_jogo = cj.ID_jogo
                INNER JOIN categoria c ON cj.ID_categoria = c.ID_categoria
            `);
            wheres.push("c.Nome = ?");
            params.push(categoria);
        }

        // Filtro por Preço
        if (preco) {
            const precoComDesconto = `(j.Preco_jogo * (1 - COALESCE(j.Desconto_jogo, 0) / 100))`;
            if (preco === "Grátis") {
                wheres.push(`${precoComDesconto} = 0`);
            } else if (preco === "Até R$20") {
                wheres.push(`${precoComDesconto} > 0 AND ${precoComDesconto} <= 20`);
            } else if (preco === "R$20 - R$50") {
                wheres.push(`${precoComDesconto} > 20 AND ${precoComDesconto} <= 50`);
            } else if (preco === "R$50 - R$100") {
                wheres.push(`${precoComDesconto} > 50 AND ${precoComDesconto} <= 100`);
            } else if (preco === "Acima de R$100") {
                wheres.push(`${precoComDesconto} > 100`);
            }
        }

        // ##### LÓGICA DE AVALIAÇÃO COM A OPÇÃO "SEM ESTRELAS" #####
        if (avaliacao) {
            if (avaliacao === '0') {
                // "Sem Estrelas": Apenas jogos com nota 0
                wheres.push("j.Media_nota = ?");
                params.push(0.0);
            } else if (avaliacao === '5') {
                // 5 estrelas: Apenas nota 10
                wheres.push("j.Media_nota = ?");
                params.push(10.0);
            } else if (avaliacao === '4-5') {
                // 4-5 estrelas: Nota de 8.0 até 9.9
                wheres.push("j.Media_nota >= ? AND j.Media_nota < ?");
                params.push(8.0, 10.0);
            } else if (avaliacao === '3-4') {
                // 3-4 estrelas: Nota de 6.0 até 7.9
                wheres.push("j.Media_nota >= ? AND j.Media_nota < ?");
                params.push(6.0, 8.0);
            } else if (avaliacao === '2-3') {
                // 2-3 estrelas: Nota de 4.0 até 5.9
                wheres.push("j.Media_nota >= ? AND j.Media_nota < ?");
                params.push(4.0, 6.0);
            } else if (avaliacao === '1-2') {
                // 1-2 estrelas: Nota de 2.0 até 3.9
                wheres.push("j.Media_nota >= ? AND j.Media_nota < ?");
                params.push(2.0, 4.0);
            }
        }

        // Monta a query final
        if (joins.length > 0) {
            sql += [...new Set(joins)].join(" ");
        }
        if (wheres.length > 0) {
            sql += " WHERE " + wheres.join(" AND ");
        }
        sql += " ORDER BY j.Nome_jogo ASC";

        console.log("SQL Executada:", sql);
        console.log("Parâmetros:", params);

        const [rows] = await pool.execute(sql, params);
        
        res.status(200).json(rows);

    } catch (err) {
        console.error("Erro ao filtrar jogos:", err);
        res.status(500).json({ message: "Erro interno do servidor ao filtrar jogos." });
    }
});

app.get("/categorias", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [categorias] = await connection.execute("SELECT Nome FROM categoria ORDER BY Nome ASC");
        res.status(200).json(categorias.map(c => c.Nome));
    } catch (err) { res.status(500).json({ message: "Erro ao buscar categorias." }); }
    finally { if (connection) connection.release(); }
});

app.get("/generos", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [generos] = await connection.execute("SELECT Nome FROM genero ORDER BY Nome ASC");
        res.status(200).json(generos.map(g => g.Nome));
    } catch (err) { res.status(500).json({ message: "Erro ao buscar gêneros." }); } 
    finally { if (connection) connection.release(); }
});

app.get("/comentarios/:id", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [comentarios] = await connection.execute(
            `SELECT c.*, u.Nome AS NomeUsuario, u.Imagem_perfil
             FROM comentario c JOIN usuario u ON c.ID_usuario = u.ID_usuario
             WHERE c.ID_jogo = ? ORDER BY c.data_comentario DESC`,
            [req.params.id]
        );
        const [mediaNota] = await connection.execute("SELECT Media_nota FROM jogos WHERE ID_jogo = ?", [req.params.id]);
        res.status(200).json({
            comentarios,
            media: mediaNota.length > 0 ? parseFloat(mediaNota[0].Media_nota).toFixed(1) : "0.0"
        });
    } catch (err) { res.status(500).json({ message: "Erro ao buscar comentários." }); }
    finally { if (connection) connection.release(); }
});

app.post("/comentarios", clerkAuthMiddleware, async (req, res) => {
    const { ID_jogo, txtcomentario, nota } = req.body;
    const ID_usuario = req.auth.userId;
    if (!ID_jogo || !nota) return res.status(400).json({ message: "ID do jogo e nota são obrigatórios." });

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        await connection.execute(
            "INSERT INTO comentario (ID_usuario, ID_jogo, txtcomentario, data_comentario, nota) VALUES (?, ?, ?, ?, ?)",
            [ID_usuario, ID_jogo, txtcomentario, new Date(), nota]
        );
        const [mediaResult] = await connection.execute("SELECT AVG(nota) AS media FROM comentario WHERE ID_jogo = ?", [ID_jogo]);
        const novaMedia = mediaResult[0].media || 0;
        await connection.execute("UPDATE jogos SET Media_nota = ? WHERE ID_jogo = ?", [novaMedia, ID_jogo]);
        await connection.commit();
        res.status(201).json({ message: "Comentário adicionado." });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: "Erro ao adicionar comentário." });
    } finally {
        if (connection) connection.release();
    }
});

app.delete("/remover-comentario/:id", clerkAuthMiddleware, async (req, res) => {
    const comentarioId = req.params.id;
    const userId = req.auth.userId;
    let connection;
    try {
        connection = await pool.getConnection();
        const [commentRows] = await connection.execute("SELECT ID_usuario, ID_jogo FROM comentario WHERE ID_comentario = ?", [comentarioId]);
        if (commentRows.length === 0) return res.status(404).json({ message: "Comentário não encontrado." });

        const [userRows] = await connection.execute("SELECT is_admin FROM usuario WHERE ID_usuario = ?", [userId]);
        const isUserAdmin = userRows.length > 0 && userRows[0].is_admin;

        if (!isUserAdmin && userId !== commentRows[0].ID_usuario) {
            return res.status(403).json({ message: "Você não tem permissão para remover este comentário." });
        }

        await connection.beginTransaction();
        await connection.execute("DELETE FROM comentario WHERE ID_comentario = ?", [comentarioId]);
        const jogoId = commentRows[0].ID_jogo;
        const [mediaResult] = await connection.execute("SELECT AVG(nota) AS media FROM comentario WHERE ID_jogo = ?", [jogoId]);
        const novaMedia = mediaResult[0].media || 0;
        await connection.execute("UPDATE jogos SET Media_nota = ? WHERE ID_jogo = ?", [novaMedia, jogoId]);
        await connection.commit();
        res.status(200).json({ message: "Comentário removido." });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: "Erro ao remover comentário." });
    } finally {
        if (connection) connection.release();
    }
});

app.post("/adicionar-jogo-file", clerkAuthMiddleware, isAdminMiddleware, upload.array("Midias_jogo", 10), async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { Nome_jogo, Descricao_jogo, Preco_jogo, Desconto_jogo, Logo_jogo, Capa_jogo, Faixa_etaria, categorias, generos } = req.body;


        let categoriasArray = [];
        if (categorias) try { categoriasArray = JSON.parse(categorias); } catch (e) { console.error("Erro ao parsear categorias"); }

        let generosArray = [];
        if (generos) try { generosArray = JSON.parse(generos); } catch (e) { console.error("Erro ao parsear generos"); }

        await connection.beginTransaction();
        const [gameResult] = await connection.execute(
            `INSERT INTO jogos (Nome_jogo, Descricao_jogo, Preco_jogo, Desconto_jogo, Logo_jogo, Capa_jogo, Faixa_etaria) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [Nome_jogo, Descricao_jogo, Preco_jogo, parseFloat(Desconto_jogo) || 0, Logo_jogo, Capa_jogo, Faixa_etaria]
        );
        const jogoId = gameResult.insertId;

        if (generosArray.length > 0) {
            const placeholders = generosArray.map(() => '?').join(',');
            const [rows] = await connection.execute(`SELECT ID_genero FROM genero WHERE Nome IN (${placeholders})`, generosArray);
            if (rows.length > 0) await connection.query("INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES ?", [rows.map(row => [row.ID_genero, jogoId])]);
        }
        if (categoriasArray.length > 0) {
            const placeholders = categoriasArray.map(() => '?').join(',');
            const [rows] = await connection.execute(`SELECT ID_categoria FROM categoria WHERE Nome IN (${placeholders})`, categoriasArray);
            if (rows.length > 0) await connection.query("INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES ?", [rows.map(row => [row.ID_categoria, jogoId])]);
        }

        if (req.files && req.files.length > 0) {
            const midiasValues = req.files.map(file => [jogoId, `/uploads/${file.filename}`]);
            await connection.query("INSERT INTO midias_jogo (ID_jogo, URL_midia) VALUES ?", [midiasValues]);
        }

        await connection.commit();
        res.status(201).json({ message: "Jogo adicionado com sucesso!", jogoId });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Erro em /adicionar-jogo-file:", err);
        res.status(500).json({ message: "Erro interno do servidor ao adicionar jogo." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para ATUALIZAR um jogo existente (VERSÃO CORRIGIDA)
app.put("/jogos/:id", clerkAuthMiddleware, isAdminMiddleware, upload.array("midias", 10), async (req, res) => {
    const jogoId = req.params.id;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { Nome_jogo, Descricao_jogo, Preco_jogo, Desconto_jogo, Logo_jogo, Capa_jogo, Faixa_etaria, generos, categorias, existing_midias } = req.body;
        const generosArray = Array.isArray(generos) ? generos : (generos ? [generos] : []);
        const categoriasArray = Array.isArray(categorias) ? categorias : (categorias ? [categorias] : []);
        const midiasExistentes = Array.isArray(existing_midias) ? existing_midias : (existing_midias ? [existing_midias] : []);

        await connection.execute(
            `UPDATE jogos SET Nome_jogo = ?, Descricao_jogo = ?, Preco_jogo = ?, Desconto_jogo = ?, Logo_jogo = ?, Capa_jogo = ?, Faixa_etaria = ? WHERE ID_jogo = ?`,
            [Nome_jogo, Descricao_jogo, Preco_jogo, parseFloat(Desconto_jogo) || 0, Logo_jogo, Capa_jogo, Faixa_etaria, jogoId]
        );

        await connection.execute("DELETE FROM genero_jogos WHERE ID_jogo = ?", [jogoId]);
        if (generosArray.length > 0) {
            const placeholders = generosArray.map(() => '?').join(',');
            const [rows] = await connection.execute(`SELECT ID_genero FROM genero WHERE Nome IN (${placeholders})`, generosArray);
            if (rows.length > 0) await connection.query("INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES ?", [rows.map(row => [row.ID_genero, jogoId])]);
        }

        await connection.execute("DELETE FROM categoria_jogos WHERE ID_jogo = ?", [jogoId]);
        if (categoriasArray.length > 0) {
            const placeholders = categoriasArray.map(() => '?').join(',');
            const [rows] = await connection.execute(`SELECT ID_categoria FROM categoria WHERE Nome IN (${placeholders})`, categoriasArray);
            if (rows.length > 0) await connection.query("INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES ?", [rows.map(row => [row.ID_categoria, jogoId])]);
        }

        const [midiasAntigas] = await connection.execute("SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?", [jogoId]);
        const midiasParaDeletar = midiasAntigas.filter(midia => !midiasExistentes.includes(midia.URL_midia));

        if (midiasParaDeletar.length > 0) {
            const urlsParaDeletar = midiasParaDeletar.map(m => m.URL_midia);

            const placeholders = urlsParaDeletar.map(() => '?').join(',');

            await connection.execute(`DELETE FROM midias_jogo WHERE ID_jogo = ? AND URL_midia IN (${placeholders})`, [jogoId, ...urlsParaDeletar]);

            // Deleta os arquivos físicos do servidor
            urlsParaDeletar.forEach(url => {
                const fullPath = path.join(__dirname, url);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
        }

        if (req.files && req.files.length > 0) {
            const midiasValues = req.files.map(file => [jogoId, `/uploads/${file.filename}`]);
            await connection.query("INSERT INTO midias_jogo (ID_jogo, URL_midia) VALUES ?", [midiasValues]);
        }

        await connection.commit();
        res.status(200).json({ message: "Jogo atualizado com sucesso!" });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error(`Erro em PUT /jogos/${jogoId}:`, err);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar o jogo." });
    } finally {
        if (connection) connection.release();
    }
});

app.delete("/jogos/:id", clerkAuthMiddleware, isAdminMiddleware, async (req, res) => {
    const jogoId = req.params.id;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Deletar arquivos de mídia do servidor
        const [midias] = await connection.execute("SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?", [jogoId]);
        midias.forEach(midia => {
            const fullPath = path.join(__dirname, midia.URL_midia);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });

        const [result] = await connection.execute("DELETE FROM jogos WHERE ID_jogo = ?", [jogoId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Jogo não encontrado." });
        }

        await connection.commit();
        res.status(200).json({ message: "Jogo removido com sucesso." });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error(`Erro em DELETE /jogos/${jogoId}:`, err);
        res.status(500).json({ message: "Erro ao remover o jogo." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para ADICIONAR um jogo ao carrinho do usuário logado
app.post("/carrinho/adicionar", clerkAuthMiddleware, async (req, res) => {
    const { ID_jogo } = req.body;
    const ID_usuario = req.auth.userId;

    if (!ID_jogo) {
        return res.status(400).json({ message: "ID do jogo é obrigatório." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        // INSERT IGNORE não insere se a chave primária (ID_usuario, ID_jogo) já existir.
        await connection.execute(
            "INSERT IGNORE INTO carrinho_itens (ID_usuario, ID_jogo) VALUES (?, ?)",
            [ID_usuario, ID_jogo]
        );
        res.status(200).json({ message: "Jogo adicionado ao carrinho!" });
    } catch (err) {
        console.error("Erro ao adicionar ao carrinho:", err);
        res.status(500).json({ message: "Erro interno ao adicionar jogo ao carrinho." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para BUSCAR todos os jogos no carrinho do usuário logado
app.get("/carrinho", clerkAuthMiddleware, async (req, res) => {
    const ID_usuario = req.auth.userId;
    let connection;
    try {
        connection = await pool.getConnection();
        const [itens] = await connection.execute(
            `SELECT j.* FROM jogos j 
             JOIN carrinho_itens ci ON j.ID_jogo = ci.ID_jogo 
             WHERE ci.ID_usuario = ?`,
            [ID_usuario]
        );
        res.status(200).json(itens);
    } catch (err) {
        console.error("Erro ao buscar carrinho:", err);
        res.status(500).json({ message: "Erro interno ao buscar o carrinho." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para REMOVER um jogo do carrinho (vamos precisar dela na página do carrinho)
app.delete("/carrinho/remover/:jogoId", clerkAuthMiddleware, async (req, res) => {
    const { jogoId } = req.params;
    const ID_usuario = req.auth.userId;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            "DELETE FROM carrinho_itens WHERE ID_usuario = ? AND ID_jogo = ?",
            [ID_usuario, jogoId]
        );
        res.status(200).json({ message: "Jogo removido do carrinho." });
    } catch (err) {
        console.error("Erro ao remover do carrinho:", err);
        res.status(500).json({ message: "Erro interno ao remover o jogo." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para ADICIONAR um jogo à lista de desejos
app.post("/desejos/adicionar", clerkAuthMiddleware, async (req, res) => {
    const { ID_jogo } = req.body;
    const ID_usuario = req.auth.userId;

    if (!ID_jogo) {
        return res.status(400).json({ message: "ID do jogo é obrigatório." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        // Usamos INSERT IGNORE para não dar erro se o jogo já estiver na lista
        await connection.execute(
            "INSERT IGNORE INTO lista_desejos (ID_usuario, ID_jogo) VALUES (?, ?)",
            [ID_usuario, ID_jogo]
        );
        res.status(200).json({ message: "Jogo adicionado à Lista de Desejos!" });
    } catch (err) {
        console.error("Erro ao adicionar à lista de desejos:", err);
        res.status(500).json({ message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para BUSCAR todos os jogos na lista de desejos do usuário
app.get("/desejos", clerkAuthMiddleware, async (req, res) => {
    const ID_usuario = req.auth.userId;
    let connection;
    try {
        connection = await pool.getConnection();
        const [jogos] = await connection.execute(
            `SELECT j.* FROM jogos j 
             JOIN lista_desejos ld ON j.ID_jogo = ld.ID_jogo 
             WHERE ld.ID_usuario = ?`,
            [ID_usuario]
        );
        res.status(200).json(jogos);
    } catch (err) {
        console.error("Erro ao buscar a lista de desejos:", err);
        res.status(500).json({ message: "Erro interno ao buscar a lista." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para REMOVER um jogo da lista de desejos
app.delete("/desejos/remover/:jogoId", clerkAuthMiddleware, async (req, res) => {
    const { jogoId } = req.params;
    const ID_usuario = req.auth.userId;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            "DELETE FROM lista_desejos WHERE ID_usuario = ? AND ID_jogo = ?",
            [ID_usuario, jogoId]
        );
        res.status(200).json({ message: "Jogo removido da Lista de Desejos." });
    } catch (err) {
        console.error("Erro ao remover da lista de desejos:", err);
        res.status(500).json({ message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/criar-sessao-de-pagamento', clerkAuthMiddleware, async (req, res) => {
    const userId = req.auth.userId;
    let connection;

    try {
        connection = await pool.getConnection();

        // 1. Busca os jogos do carrinho para calcular o total
        const [jogosNoCarrinho] = await connection.execute(
            `SELECT j.Nome_jogo, j.Preco_jogo, j.Desconto_jogo FROM jogos j
             JOIN carrinho_itens ci ON j.ID_jogo = ci.ID_jogo
             WHERE ci.ID_usuario = ?`,
            [userId]
        );

        if (jogosNoCarrinho.length === 0) {
            return res.status(400).json({ error: { message: "Seu carrinho está vazio." } });
        }

        // 2. Cria os 'line_items' para a API do Stripe
        const line_items = jogosNoCarrinho.map(jogo => {
            const preco = parseFloat(jogo.Preco_jogo);
            const desconto = parseFloat(jogo.Desconto_jogo);
            const precoFinal = desconto > 0 ? preco * (1 - desconto / 100) : preco;
            const precoEmCentavos = Math.round(precoFinal * 100); 

            return {
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: jogo.Nome_jogo,
                    },
                    unit_amount: precoEmCentavos,
                },
                quantity: 1,
            };
        });

        // 3. Cria a sessão de checkout no Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            metadata: {
                userId: userId 
            },
            success_url: `http://localhost:5173/src/front-end/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/src/front-end/carrinho.html`,
        });

        // 4. Envia o ID da sessão de volta para o front-end
        res.json({ id: session.id });

    } catch (error) {
        console.error("Erro ao criar sessão de pagamento:", error);
        res.status(500).json({ error: { message: "Não foi possível iniciar o pagamento." } });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/verificar-pagamento', clerkAuthMiddleware, async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.auth.userId;
    let connection;

    try {
        // 1. Pergunta ao Stripe sobre a sessão
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Verifica se o status do pagamento é "pago"
        if (session.payment_status === 'paid' && session.metadata.userId === userId) {
            // Se o pagamento foi bem-sucedido, executa a mesma lógica do webhook
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [jogosNoCarrinho] = await connection.execute('SELECT ID_jogo FROM carrinho_itens WHERE ID_usuario = ?', [userId]);
            if (jogosNoCarrinho.length > 0) {
                const jogosParaBiblioteca = jogosNoCarrinho.map(item => [userId, item.ID_jogo]);
                await connection.query('INSERT IGNORE INTO biblioteca (ID_usuario, ID_jogo) VALUES ?', [jogosParaBiblioteca]);
                await connection.execute('DELETE FROM carrinho_itens WHERE ID_usuario = ?', [userId]);
            }
            
            await connection.commit();
            console.log(`📚 Jogos liberados via verificação manual para o usuário: ${userId}`);
            return res.status(200).json({ status: 'success', message: 'Pagamento verificado e jogos liberados!' });
        } else {
            // Se o pagamento não foi bem-sucedido ou o ID do usuário não bate
            return res.status(400).json({ status: 'failed', message: 'Verificação de pagamento falhou.' });
        }

    } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        if (connection) await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/biblioteca', clerkAuthMiddleware, async (req, res) => {
    const userId = req.auth.userId;
    let connection;
    try {
        connection = await pool.getConnection();
        const [jogos] = await connection.execute(
            `SELECT j.ID_jogo, j.Nome_jogo, j.Capa_jogo, b.data_adicao 
             FROM jogos j
             JOIN biblioteca b ON j.ID_jogo = b.ID_jogo
             WHERE b.ID_usuario = ?
             ORDER BY j.Nome_jogo ASC`,
            [userId]
        );
        res.status(200).json(jogos);
    } catch (error) {
        console.error("Erro ao buscar biblioteca:", error);
        res.status(500).json({ message: "Erro ao buscar a biblioteca do usuário." });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/jogos-destaques', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Calcular um peso de popularidade: 
        // Aqui, combinamos a Média da Nota (já presente na tabela 'jogos') com a 
        // Contagem de Comentários para dar um peso maior aos jogos mais comentados e bem avaliados.
        // LIMIT 7 garante no máximo 7 jogos para o Swiper.
        const [destaques] = await connection.execute(
            `SELECT 
                j.ID_jogo, 
                j.Nome_jogo, 
                j.Capa_jogo, 
                j.Preco_jogo,
                j.Desconto_jogo,
                j.Media_nota,
                COUNT(c.ID_comentario) as total_comentarios
             FROM jogos j
             LEFT JOIN comentario c ON j.ID_jogo = c.ID_jogo
             GROUP BY j.ID_jogo, j.Nome_jogo, j.Capa_jogo, j.Preco_jogo, j.Desconto_jogo, j.Media_nota
             ORDER BY j.Media_nota DESC, total_comentarios DESC
             LIMIT 7`
        );
        
        res.status(200).json(destaques);

    } catch (error) {
        console.error("Erro ao buscar jogos em destaque:", error);
        res.status(500).json({ message: "Erro ao buscar os jogos em destaque." });
    } finally {
        if (connection) connection.release();
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    (async () => {
        try {
            const connection = await pool.getConnection();
            console.log("Pool de conexões com o banco de dados criado com sucesso!");
            connection.release();
            console.log(`Servidor rodando em http://localhost:${port}`);
        } catch (err) {
            console.error("ERRO FATAL: Não foi possível conectar ao banco de dados:", err.message);
            process.exit(1);
        }
    })();
});