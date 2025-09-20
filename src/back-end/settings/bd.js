const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve a pasta de uploads estaticamente
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let fileExtension = path.extname(file.originalname);
    const contentType = file.mimetype;

    const mimeMap = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/bmp": ".bmp",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "video/mp4": ".mp4",
      "video/webm": ".webm",
      "video/ogg": ".ogg",
    };
    const mappedExtension = mimeMap[contentType.toLowerCase()] || fileExtension;
    if (mappedExtension !== fileExtension) {
      fileExtension = mappedExtension;
    }

    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "PhantomGames",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

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

// --- ROTAS DO BACK-END ---

// Rota para salvar informações do usuário Clerk no banco de dados
app.post("/salvar-usuario", async (req, res) => {
  let connection;
  try {
    const { id, nome, imagem_perfil } = req.body;

    if (!id || !nome) {
      return res
        .status(400)
        .json({ message: "ID e nome do usuário são obrigatórios." });
    }

    connection = await pool.getConnection();

    // 1. Verifique se o usuário já existe no banco de dados
    const [existingUser] = await connection.execute(
      "SELECT * FROM usuario WHERE ID_usuario = ?",
      [id]
    );

    if (existingUser.length > 0) {
      // Se o usuário já existe, atualize as informações
      await connection.execute(
        "UPDATE usuario SET Nome = ?, Imagem_perfil = ? WHERE ID_usuario = ?",
        [nome, imagem_perfil, id]
      );
      return res
        .status(200)
        .json({ message: "Usuário atualizado no banco de dados." });
    }

    // 2. Se o usuário não existe, insira um novo registro
    const insertUserSql = `
            INSERT INTO usuario (ID_usuario, Nome, Imagem_perfil)
            VALUES (?, ?, ?)
        `;
    const insertUserValues = [id, nome, imagem_perfil];

    await connection.execute(insertUserSql, insertUserValues);

    res.status(201).json({ message: "Usuário salvo com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar/atualizar usuário:", err);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao salvar o usuário." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para buscar um jogo específico por ID (GET)
app.get("/jogos/:id", async (req, res) => {
  let connection;
  try {
    const jogoId = req.params.id;
    connection = await pool.getConnection();

    const [jogosRows] = await connection.execute(
      "SELECT * FROM jogos WHERE ID_jogo = ?",
      [jogoId]
    );
    if (jogosRows.length === 0) {
      return res.status(404).json({ message: "Jogo não encontrado." });
    }

    const [categoriasRows] = await connection.execute(
      "SELECT c.Nome FROM categoria_jogos AS cj INNER JOIN categoria AS c ON cj.ID_categoria = c.ID_categoria WHERE cj.ID_jogo = ?",
      [jogoId]
    );
    const categorias = categoriasRows.map((row) => row.Nome);

    const [generosRows] = await connection.execute(
      "SELECT g.Nome FROM genero_jogos AS gj INNER JOIN genero AS g ON gj.ID_genero = g.ID_genero WHERE gj.ID_jogo = ?",
      [jogoId]
    );
    const generos = generosRows.map((row) => row.Nome);

    const [midiasRows] = await connection.execute(
      "SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?",
      [jogoId]
    );
    const midias = midiasRows.map((row) => row.URL_midia);

    const jogoComDetalhes = {
      ...jogosRows[0],
      categorias: categorias,
      generos: generos,
      midias: midias,
    };

    res.status(200).json(jogoComDetalhes);
  } catch (err) {
    console.error("Erro ao buscar jogo por ID:", err.message);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao buscar o jogo." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para editar jogo (PUT)
app.put("/jogos/:id", upload.array("midias", 10), async (req, res) => {
  let connection;
  try {
    const jogoId = req.params.id;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const {
      Nome_jogo,
      Descricao_jogo,
      Preco_jogo,
      Logo_jogo,
      Capa_jogo,
      Faixa_etaria,
      generos,
      categorias,
      existing_midias,
    } = req.body;

    console.log("ID do jogo para edição:", jogoId);
    console.log("Dados do formulário:", req.body);
    console.log("Novos arquivos de mídia:", req.files);

    // 1. Atualizar os dados principais do jogo
    const updateGameSql = `
            UPDATE jogos SET
            Nome_jogo = ?, Descricao_jogo = ?, Preco_jogo = ?, Logo_jogo = ?, Capa_jogo = ?, Faixa_etaria = ?
            WHERE ID_jogo = ?
        `;
    const updateGameValues = [
      Nome_jogo,
      Descricao_jogo,
      Preco_jogo,
      Logo_jogo,
      Capa_jogo,
      Faixa_etaria,
      jogoId,
    ];
    await connection.execute(updateGameSql, updateGameValues);

    // 2. Lidar com gêneros: deletar antigos e inserir novos
    await connection.execute("DELETE FROM genero_jogos WHERE ID_jogo = ?", [
      jogoId,
    ]);
    if (generos && generos.length > 0) {
      const generosArray = Array.isArray(generos) ? generos : [generos];
      const placeholders = generosArray.map(() => "?").join(",");
      const [existingGenres] = await connection.execute(
        `SELECT ID_genero FROM genero WHERE Nome IN (${placeholders})`,
        generosArray
      );
      const generoValues = existingGenres.map((row) => [row.ID_genero, jogoId]);
      if (generoValues.length > 0) {
        await connection.query(
          "INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES ?",
          [generoValues]
        );
      }
    }

    // 3. Lidar com categorias: deletar antigas e inserir novas
    await connection.execute("DELETE FROM categoria_jogos WHERE ID_jogo = ?", [
      jogoId,
    ]);
    if (categorias && categorias.length > 0) {
      const categoriasArray = Array.isArray(categorias)
        ? categorias
        : [categorias];
      const placeholders = categoriasArray.map(() => "?").join(",");
      const [existingCategories] = await connection.execute(
        `SELECT ID_categoria FROM categoria WHERE Nome IN (${placeholders})`,
        categoriasArray
      );
      const categoriaValues = existingCategories.map((row) => [
        row.ID_categoria,
        jogoId,
      ]);
      if (categoriaValues.length > 0) {
        await connection.query(
          "INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES ?",
          [categoriaValues]
        );
      }
    }

    // 4. Lidar com mídias: deletar antigas não enviadas e inserir novas
    const existingMidiasArray = Array.isArray(existing_midias)
      ? existing_midias
      : existing_midias
      ? [existing_midias]
      : [];
    const [oldMidiasRows] = await connection.execute(
      "SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?",
      [jogoId]
    );
    const oldMidiasPaths = oldMidiasRows.map((row) => row.URL_midia);

    // Mídias a serem deletadas
    const midiasToDelete = oldMidiasPaths.filter(
      (path) => !existingMidiasArray.includes(path)
    );
    if (midiasToDelete.length > 0) {
      const placeholders = midiasToDelete.map(() => "?").join(",");
      await connection.execute(
        `DELETE FROM midias_jogo WHERE ID_jogo = ? AND URL_midia IN (${placeholders})`,
        [jogoId, ...midiasToDelete]
      );
      // Opcional: deletar os arquivos físicos
      midiasToDelete.forEach((filePath) => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Novas mídias a serem inseridas
    if (req.files && req.files.length > 0) {
      const newMediaValues = req.files.map((file) => [
        jogoId,
        `/uploads/${file.filename}`,
      ]);
      await connection.query(
        "INSERT INTO midias_jogo (ID_jogo, URL_midia) VALUES ?",
        [newMediaValues]
      );
    }

    await connection.commit();
    res.status(200).json({ message: "Jogo atualizado com sucesso!" });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Erro na rota PUT /jogos/:id:", err);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao editar o jogo." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para remover um jogo específico por ID (DELETE)
app.delete("/jogos/:id", async (req, res) => {
  let connection;
  try {
    const jogoId = req.params.id;
    connection = await pool.getConnection();
    await connection.beginTransaction(); // Deletar os arquivos de mídia físicos primeiro

    const [midiasRows] = await connection.execute(
      "SELECT URL_midia FROM midias_jogo WHERE ID_jogo = ?",
      [jogoId]
    );
    midiasRows.forEach((row) => {
      const filePath = path.join(__dirname, row.URL_midia);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }); // 1. Deletar mídias do banco de dados

    await connection.execute("DELETE FROM midias_jogo WHERE ID_jogo = ?", [
      jogoId,
    ]); // 2. Deletar vínculos de categorias

    await connection.execute("DELETE FROM categoria_jogos WHERE ID_jogo = ?", [
      jogoId,
    ]); // 3. Deletar vínculos de gêneros

    await connection.execute("DELETE FROM genero_jogos WHERE ID_jogo = ?", [
      jogoId,
    ]);

    // 4. Deletar comentários do banco de dados (NOVO PASSO)
    await connection.execute("DELETE FROM comentario WHERE ID_jogo = ?", [
      jogoId,
    ]); // 5. Deletar o jogo da tabela principal

    const [result] = await connection.execute(
      "DELETE FROM jogos WHERE ID_jogo = ?",
      [jogoId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Jogo não encontrado." });
    }

    await connection.commit();
    res.status(200).json({ message: "Jogo removido com sucesso." });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Erro ao remover jogo:", err);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao remover o jogo." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para buscar todos os jogos (GET)
app.get("/jogos", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [jogosRows] = await connection.execute("SELECT * FROM jogos");
    const [categoriasRows] = await connection.execute(
      "SELECT cj.ID_jogo, c.Nome FROM categoria_jogos AS cj INNER JOIN categoria AS c ON cj.ID_categoria = c.ID_categoria"
    );
    const categoriasMap = categoriasRows.reduce((acc, row) => {
      acc[row.ID_jogo] = acc[row.ID_jogo] || [];
      acc[row.ID_jogo].push(row.Nome);
      return acc;
    }, {});
    const [generosRows] = await connection.execute(
      "SELECT gj.ID_jogo, g.Nome FROM genero_jogos AS gj INNER JOIN genero AS g ON gj.ID_genero = g.ID_genero"
    );
    const generosMap = generosRows.reduce((acc, row) => {
      acc[row.ID_jogo] = acc[row.ID_jogo] || [];
      acc[row.ID_jogo].push(row.Nome);
      return acc;
    }, {});
    const [midiasRows] = await connection.execute(
      "SELECT ID_jogo, URL_midia FROM midias_jogo"
    );
    const midiasMap = midiasRows.reduce((acc, row) => {
      acc[row.ID_jogo] = acc[row.ID_jogo] || [];
      acc[row.ID_jogo].push(row.URL_midia);
      return acc;
    }, {});
    const jogosComDetalhes = jogosRows.map((jogo) => ({
      ...jogo,
      categorias: categoriasMap[jogo.ID_jogo] || [],
      generos: generosMap[jogo.ID_jogo] || [],
      midias: midiasMap[jogo.ID_jogo] || [],
    }));
    res.status(200).json(jogosComDetalhes);
  } catch (err) {
    console.error("Erro ao buscar jogos:", err.message);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao buscar os jogos." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para adicionar jogo (POST)
app.post(
  "/adicionar-jogo-file",
  upload.array("Midias_jogo", 10),
  async (req, res) => {
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
        Faixa_etaria,
        categorias,
        generos,
      } = req.body;

      const categoriasArray = JSON.parse(categorias);
      const generosArray = JSON.parse(generos);

      if (!Nome_jogo || !Preco_jogo) {
        await connection.rollback();
        return res
          .status(400)
          .json({ message: "Nome e preço do jogo são obrigatórios." });
      }

      const gameSql = `INSERT INTO jogos (Nome_jogo, Preco_jogo, Logo_jogo, Descricao_jogo, Capa_jogo, Faixa_etaria, Media_nota) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const gameValues = [
        Nome_jogo,
        parseFloat(Preco_jogo),
        Logo_jogo,
        Descricao_jogo,
        Capa_jogo,
        Faixa_etaria,
        10.0,
      ];
      const [gameResult] = await connection.execute(gameSql, gameValues);
      const jogoId = gameResult.insertId;

      if (req.files && req.files.length > 0) {
        const midiasValues = req.files.map((file) => [
          jogoId,
          `/uploads/${file.filename}`,
        ]);
        await connection.query(
          "INSERT INTO midias_jogo (ID_jogo, URL_midia) VALUES ?",
          [midiasValues]
        );
      }

      if (categoriasArray && categoriasArray.length > 0) {
        const placeholders = categoriasArray.map(() => "?").join(",");
        const [existingCategories] = await connection.execute(
          `SELECT ID_categoria FROM categoria WHERE Nome IN (${placeholders})`,
          categoriasArray
        );
        const categoriaValues = existingCategories.map((row) => [
          row.ID_categoria,
          jogoId,
        ]);
        if (categoriaValues.length > 0) {
          await connection.query(
            "INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES ?",
            [categoriaValues]
          );
        }
      }

      if (generosArray && generosArray.length > 0) {
        const placeholders = generosArray.map(() => "?").join(",");
        const [existingGenres] = await connection.execute(
          `SELECT ID_genero FROM genero WHERE Nome IN (${placeholders})`,
          generosArray
        );
        const generoValues = existingGenres.map((row) => [
          row.ID_genero,
          jogoId,
        ]);
        if (generoValues.length > 0) {
          await connection.query(
            "INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES ?",
            [generoValues]
          );
        }
      }

      await connection.commit();
      res.status(200).json({ message: "Jogo adicionado com sucesso!" });
    } catch (err) {
      if (connection) {
        await connection.rollback();
      }
      console.error("Erro na rota /adicionar-jogo-file:", err);
      res
        .status(500)
        .json({ message: "Erro interno do servidor ao adicionar jogo." });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// NOVO CÓDIGO - Rota para buscar comentários e a nota média de um jogo
app.get("/comentarios/:id", async (req, res) => {
  let connection;
  try {
    const jogoId = req.params.id;
    connection = await pool.getConnection();

    // Buscar todos os comentários para o jogo
    const [comentarios] = await connection.execute(
      `SELECT c.*, u.Nome AS NomeUsuario, u.Imagem_perfil
             FROM comentario AS c
             JOIN usuario AS u ON c.ID_usuario = u.ID_usuario
             WHERE c.ID_jogo = ?
             ORDER BY c.data_comentario DESC`,
      [jogoId]
    );

    // Calcular a nota média do jogo
    const [mediaNota] = await connection.execute(
      "SELECT AVG(nota) AS media FROM comentario WHERE ID_jogo = ?",
      [jogoId]
    );
    const media = mediaNota[0].media
      ? parseFloat(mediaNota[0].media).toFixed(1)
      : 0;

    res.status(200).json({ comentarios, media });
  } catch (err) {
    console.error("Erro ao buscar comentários:", err);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao buscar os comentários." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// NOVO CÓDIGO - Rota para adicionar um novo comentário
app.post("/comentarios", async (req, res) => {
  let connection;
  try {
    const { ID_usuario, ID_jogo, txtcomentario, nota } = req.body;
    const data_comentario = new Date().toISOString().slice(0, 10);

    if (!ID_usuario || !ID_jogo || !nota) {
      return res.status(400).json({
        message: "ID de usuário, ID de jogo e nota são obrigatórios.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Inserir o novo comentário
    const insertSql = `
            INSERT INTO comentario (ID_usuario, ID_jogo, txtcomentario, data_comentario, nota)
            VALUES (?, ?, ?, ?, ?)
        `;
    const insertValues = [
      ID_usuario,
      ID_jogo,
      txtcomentario,
      data_comentario,
      nota,
    ];
    await connection.execute(insertSql, insertValues);

    // 2. Recalcular e atualizar a média de nota do jogo
    const [mediaNota] = await connection.execute(
      "SELECT AVG(nota) AS media FROM comentario WHERE ID_jogo = ?",
      [ID_jogo]
    );
    const media = mediaNota[0].media ? parseFloat(mediaNota[0].media) : 0;

    await connection.execute(
      "UPDATE jogos SET Media_nota = ? WHERE ID_jogo = ?",
      [media, ID_jogo]
    );

    await connection.commit();
    res
      .status(201)
      .json({ message: "Comentário e nota adicionados com sucesso." });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Erro ao adicionar comentário:", err);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao adicionar o comentário." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para remover um comentário (DELETE)
app.delete("/remover-comentario/:id", async (req, res) => {
    let connection;
    try {
        const comentarioId = req.params.id;
        const userId = req.headers["x-user-id"]; 
        
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado. Por favor, faça login novamente." });
        }
        
        connection = await pool.getConnection();

        // 1. Obter o ID do jogo e o ID do usuário que postou o comentário ANTES de deletar
        const [commentRows] = await connection.execute("SELECT ID_usuario, ID_jogo FROM comentario WHERE ID_comentario = ?", [comentarioId]);

        if (commentRows.length === 0) {
            connection.release();
            return res.status(404).json({ message: "Comentário não encontrado." });
        }
        
        const comentarioAutorId = commentRows[0].ID_usuario;
        const jogoId = commentRows[0].ID_jogo;

        const adminUserId = "SEU_ID_DE_ADMIN_AQUI"; // Substitua pelo ID real do seu usuário admin
        const isAdmin = (userId === adminUserId);
        const isUserAuthor = (userId === comentarioAutorId);

        if (!isUserAuthor && !isAdmin) {
            connection.release();
            return res.status(403).json({ message: "Você não tem permissão para remover este comentário." });
        }
        
        // 2. Se as permissões forem válidas, executar a exclusão
        const [result] = await connection.execute("DELETE FROM comentario WHERE ID_comentario = ?", [comentarioId]);

        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: "Comentário não encontrado após a verificação." });
        }

        // 3. Recalcular e atualizar a média de nota do jogo (NOVO PASSO)
        const [mediaNota] = await connection.execute(
            "SELECT AVG(nota) AS media FROM comentario WHERE ID_jogo = ?",
            [jogoId]
        );
        const novaMedia = mediaNota[0].media ? parseFloat(mediaNota[0].media) : 0;
        
        await connection.execute(
            "UPDATE jogos SET Media_nota = ? WHERE ID_jogo = ?",
            [novaMedia, jogoId]
        );

        res.status(200).json({ message: "Comentário removido e nota média atualizada com sucesso." });

    } catch (err) {
        console.error("Erro ao remover comentário:", err);
        res.status(500).json({ message: "Erro interno do servidor ao remover o comentário." });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Rota raiz
app.get("/", (req, res) => {
  res.status(200).send("Servidor está rodando.");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
