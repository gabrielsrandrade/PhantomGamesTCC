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

// --- 2. CONFIGURAÇÃO DE SEGURANÇA (CLERK) ---
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY || !CLERK_SECRET_KEY.startsWith("sk_")) {
  throw new Error("A chave secreta do Clerk (CLERK_SECRET_KEY) parece estar ausente ou inválida.");
}

// --- 3. MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const clerkAuthMiddleware = ClerkExpressWithAuth({ secretKey: CLERK_SECRET_KEY });

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
  queueLimit: 0 };
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

// --- 6. ROTAS DA API ---

// ROTA PRINCIPAL
app.get("/", (req, res) => res.status(200).send("Servidor PhantomGames está no ar."));

// ROTA PARA SALVAR/ATUALIZAR USUÁRIO
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

app.get("/jogos/:id", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [jogosRows] = await connection.execute("SELECT * FROM jogos WHERE ID_jogo = ?", [req.params.id]);
        if (jogosRows.length === 0) return res.status(404).json({ message: "Jogo não encontrado." });

        const [categoriasRows] = await connection.execute("SELECT c.Nome FROM categoria_jogos cj JOIN categoria c ON cj.ID_categoria = c.ID_categoria WHERE cj.ID_jogo = ?", [req.params.id]);
        const [generosRows] = await connection.execute("SELECT g.Nome FROM genero_jogos gj JOIN genero g ON gj.ID_genero = g.ID_genero WHERE gj.ID_jogo = ?", [req.params.id]);
        const [midiasRows] = await connection.execute("SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?", [req.params.id]);

        const jogoCompleto = { ...jogosRows[0], categorias: categoriasRows.map(r => r.Nome), generos: generosRows.map(r => r.Nome), midias: midiasRows.map(r => r.URL_midia) };
        res.status(200).json(jogoCompleto);
    } catch (err) { res.status(500).json({ message: "Erro ao buscar detalhes do jogo." }); } 
    finally { if (connection) connection.release(); }
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
    let connection;
    try {
        connection = await pool.getConnection();
        
        let sql = `
            SELECT DISTINCT j.* 
            FROM jogos j
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
            if (preco === "Grátis") {
                wheres.push("j.Preco_jogo = 0");
            } else if (preco === "Até R$20") {
                wheres.push("j.Preco_jogo > 0 AND j.Preco_jogo <= 20");
            } else if (preco === "R$20 - R$50") {
                wheres.push("j.Preco_jogo > 20 AND j.Preco_jogo <= 50");
            } else if (preco === "R$50 - R$100") {
                wheres.push("j.Preco_jogo > 50 AND j.Preco_jogo <= 100");
            } else if (preco === "Acima de R$100") {
                wheres.push("j.Preco_jogo > 100");
            }
        }

        // Filtro por Avaliação (faixa exata baseada no arredondamento para N estrelas)
        if (avaliacao) {
            const estrelas = parseInt(avaliacao.split(" ")[0]); // Ex: "4 Estrelas" -> 4
            if (!isNaN(estrelas) && estrelas >= 1 && estrelas <= 5) {
                if (estrelas === 5) {
                    wheres.push("j.Media_nota >= 9.0");
                } else if (estrelas === 1) {
                    wheres.push("j.Media_nota > 0 AND j.Media_nota < 3.0");
                } else {
                    const minNota = estrelas * 2 - 1;
                    const maxNota = estrelas * 2 + 1;
                    wheres.push("j.Media_nota >= ? AND j.Media_nota < ?");
                    params.push(minNota, maxNota);
                }
            }
        }

        // Monta a query final
        if (joins.length > 0) {
            sql += joins.join(" ");
        }
        if (wheres.length > 0) {
            sql += " WHERE " + wheres.join(" AND ");
        }
        sql += " ORDER BY j.Nome_jogo ASC";

        console.log("SQL Executada:", sql);
        console.log("Parâmetros:", params);

        const [rows] = await connection.execute(sql, params);
        if (rows.length === 0) {
            return res.status(404).json([]);
        }
        res.status(200).json(rows);
    } catch (err) {
        console.error("Erro ao filtrar jogos:", err);
        res.status(500).json({ message: "Erro ao filtrar jogos." });
    } finally {
        if (connection) connection.release();
    }
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

app.get("/categorias", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [categorias] = await connection.execute("SELECT Nome FROM categoria ORDER BY Nome ASC");
        res.status(200).json(categorias.map(c => c.Nome));
    } catch (err) { res.status(500).json({ message: "Erro ao buscar categorias." }); } 
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

// ROTAS AUTENTICADAS (REQUEREM LOGIN)
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

        // --- ✅ AQUI ESTÁ A CORREÇÃO ---
        // "Ensinamos" o backend a ler a string JSON enviada pelo frontend
        let categoriasArray = [];
        if (categorias) try { categoriasArray = JSON.parse(categorias); } catch (e) { console.error("Erro ao parsear categorias"); }
        
        let generosArray = [];
        if (generos) try { generosArray = JSON.parse(generos); } catch (e) { console.error("Erro ao parsear generos"); }
        // --- FIM DA CORREÇÃO ---

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

        // 1. Atualiza os dados principais na tabela 'jogos' (sem alterações aqui)
        await connection.execute(
            `UPDATE jogos SET Nome_jogo = ?, Descricao_jogo = ?, Preco_jogo = ?, Desconto_jogo = ?, Logo_jogo = ?, Capa_jogo = ?, Faixa_etaria = ? WHERE ID_jogo = ?`,
            [Nome_jogo, Descricao_jogo, Preco_jogo, parseFloat(Desconto_jogo) || 0, Logo_jogo, Capa_jogo, Faixa_etaria, jogoId]
        );

        // 2. Atualiza gêneros e categorias (sem alterações aqui)
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

        // --- ✅ AQUI ESTÁ A CORREÇÃO ---
        // 3. Gerencia as mídias com a consulta SQL correta
        const [midiasAntigas] = await connection.execute("SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?", [jogoId]);
        const midiasParaDeletar = midiasAntigas.filter(midia => !midiasExistentes.includes(midia.URL_midia));
        
        if (midiasParaDeletar.length > 0) {
            const urlsParaDeletar = midiasParaDeletar.map(m => m.URL_midia);
            
            // Cria os placeholders (?) para a cláusula IN
            const placeholders = urlsParaDeletar.map(() => '?').join(',');
            // Executa a deleção com os placeholders corretos
            await connection.execute(`DELETE FROM midias_jogo WHERE ID_jogo = ? AND URL_midia IN (${placeholders})`, [jogoId, ...urlsParaDeletar]);
            
            // Deleta os arquivos físicos do servidor
            urlsParaDeletar.forEach(url => {
                const fullPath = path.join(__dirname, url);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
        }
        // --- FIM DA CORREÇÃO ---

        // 4. Adiciona as novas mídias que foram enviadas (sem alterações aqui)
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
        
        // Deletar o jogo da tabela principal (o ON DELETE CASCADE cuidará do resto)
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

// --- 7. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});