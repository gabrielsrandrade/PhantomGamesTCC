DROP DATABASE PhantomGames;

CREATE DATABASE PhantomGames;

USE PhantomGames;

/* Tabela de usuários, com a adição do campo de admin */
CREATE TABLE usuario(
    ID_usuario VARCHAR(50) PRIMARY KEY NOT NULL,
    Nome VARCHAR(80) NOT NULL,
    Imagem_perfil VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE
);

/* Tabela de categorias de jogos */
CREATE TABLE categoria(
    ID_categoria INT(2) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Nome VARCHAR(30) NOT NULL
);

/* Tabela de gêneros de jogos */
CREATE TABLE genero(
    ID_genero INT(2) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Nome VARCHAR(30) NOT NULL
);

/* Tabela principal de jogos */
CREATE TABLE jogos(
    ID_jogo INT(5) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Nome_jogo VARCHAR(100) NOT NULL,
    Preco_jogo DECIMAL(5,2) NOT NULL,
    Desconto_jogo DECIMAL(3) DEFAULT 0,
    Logo_jogo TEXT,
    Descricao_jogo TEXT,
    Capa_jogo TEXT NOT NULL,
    Faixa_etaria VARCHAR(10) NOT NULL,
    Media_nota DECIMAL(3,1) NOT NULL DEFAULT 0.0
);

CREATE TABLE midias_jogo(
  ID_midia INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ID_jogo INT(5) NOT NULL,
  URL_midia VARCHAR(255) NOT NULL,
  FOREIGN KEY (ID_jogo) REFERENCES jogos(ID_jogo) ON DELETE CASCADE
);

/* Tabela de relacionamento entre jogos e categorias (muitos-para-muitos) */
CREATE TABLE categoria_jogos(
  ID_categoria INT(2) NOT NULL,
  ID_jogo INT(5) NOT NULL,
  PRIMARY KEY (ID_categoria, ID_jogo),
  FOREIGN KEY (ID_categoria) REFERENCES categoria(ID_categoria) ON DELETE CASCADE,
  FOREIGN KEY (ID_jogo) REFERENCES jogos(ID_jogo) ON DELETE CASCADE
);

/* Tabela de relacionamento entre jogos e gêneros (muitos-para-muitos) */
CREATE TABLE genero_jogos(
  ID_genero INT(2) NOT NULL,
  ID_jogo INT(5) NOT NULL,
  PRIMARY KEY (ID_genero, ID_jogo),
  FOREIGN KEY (ID_genero) REFERENCES genero(ID_genero) ON DELETE CASCADE,
  FOREIGN KEY (ID_jogo) REFERENCES jogos(ID_jogo) ON DELETE CASCADE
);

/* Tabela de lista de desejos */
CREATE TABLE lista_desejos(
    ID_usuario VARCHAR(50) NOT NULL,
    ID_jogo INT(5) NOT NULL,
    PRIMARY KEY (ID_usuario, ID_jogo),
    FOREIGN KEY (ID_usuario) REFERENCES usuario(ID_usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_jogo) REFERENCES jogos(ID_jogo) ON DELETE CASCADE
);

/* Tabela de biblioteca de jogos do usuário */
CREATE TABLE biblioteca(
    ID_usuario VARCHAR(50) NOT NULL,
    ID_jogo INT(5) NOT NULL,
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_usuario, ID_jogo),
    FOREIGN KEY (ID_usuario) REFERENCES usuario(ID_usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_jogo) REFERENCES jogos(ID_jogo) ON DELETE CASCADE
);

/* Tabela de carrinho de compras */
CREATE TABLE carrinho_itens (
    ID_usuario VARCHAR(50) NOT NULL,
    ID_jogo INT(5) NOT NULL,
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_usuario, ID_jogo),
    FOREIGN KEY (ID_usuario) REFERENCES usuario(ID_usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_jogo) REFERENCES jogos(ID_jogo) ON DELETE CASCADE
);

/* Tabela de comentários e avaliações */
CREATE TABLE comentario(
    ID_comentario INT(12) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    ID_usuario VARCHAR(50),
    ID_jogo INT(5),
    txtcomentario VARCHAR(255),
    data_comentario DATE NOT NULL,
    nota INT(2),
    FOREIGN KEY (ID_usuario) REFERENCES usuario(ID_usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_jogo) REFERENCES jogos(ID_jogo) ON DELETE CASCADE
);

/* Inserindo os dados iniciais para Gêneros */
INSERT INTO genero (Nome) VALUES
('Ação'), ('Aventura'), ('Casual'), ('Corrida'), ('Esportes'), ('Estratégia'), ('Indie'), ('Luta'), ('Musical'), ('Narrativo'),
('Plataforma'), ('Puzzle'), ('RPG'), ('Simulação'), ('Sobrevivência'), ('Terror'), ('Tiro');

/* Inserindo os dados iniciais para Categorias */
INSERT INTO categoria (Nome) VALUES
('Singleplayer'), ('Multiplayer Local'), ('Multiplayer Online'), ('Jogo Nacional'), ('Co-op'), ('PvP'), ('PvE'), ('MMO'), ('Cross-Plataform'),
('2D'), ('3D'), ('2.5D'), ('Top-Down'), ('Side-Scrooling'), ('Isométrico'), ('Primeira Pessoa'), ('Terceira Pessoa'),
('Linear'), ('Mundo Aberto'), ('Sandbox'), ('Campanha'), ('Missões/Fases'), ('Permadeath'), ('Rouguelike');

UPDATE usuario SET is_admin = TRUE WHERE ID_usuario = 'user_31YoUjT0yZIMujj9D7jiveiepOt';

