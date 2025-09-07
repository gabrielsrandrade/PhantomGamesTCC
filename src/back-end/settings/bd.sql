-- Primeiro sempre apaga antes de criar
DROP DATABASE IF EXISTS PhantomGames;

CREATE DATABASE PhantomGames;

USE PhantomGames;

-- tabela usuario
CREATE TABLE
    usuario (
        ID_usuario INT (6) PRIMARY KEY AUTO_INCREMENT,
        Nome VARCHAR(80) NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE,
        senha VARCHAR(20) NOT NULL,
        classe CHAR(1) NOT NULL
    );

-- tabela categoria
CREATE TABLE
    categoria (
        ID_categoria INT PRIMARY KEY AUTO_INCREMENT,
        Nome_categoria VARCHAR(50) NOT NULL
    );

-- tabela genero
CREATE TABLE
    genero (
        ID_genero INT PRIMARY KEY AUTO_INCREMENT,
        Nome_genero VARCHAR(50) NOT NULL
    );

-- tabela jogos
CREATE TABLE
    jogos (
        ID_jogo INT PRIMARY KEY AUTO_INCREMENT,
        ID_categoria INT NOT NULL,
        ID_genero INT NOT NULL,
        Nome_jogo VARCHAR(100) NOT NULL,
        Descricao_jogo TEXT,
        Preco_jogo DECIMAL(10, 2) NOT NULL,
        Logo_jogo TEXT NOT NULL,
        Capa_jogo TEXT NOT NULL,
        Midias_jogo TEXT NOT NULL,
        Faixa_etaria VARCHAR(20) NOT NULL,
        Media_nota DECIMAL(3, 2) DEFAULT 0,
        FOREIGN KEY (ID_categoria) REFERENCES categoria (ID_categoria),
        FOREIGN KEY (ID_genero) REFERENCES genero (ID_genero)
    );

-- tabela categoria_jogos (relacionamento N:N)
CREATE TABLE
    categoria_jogos (
        ID_categoria_jogos INT PRIMARY KEY AUTO_INCREMENT,
        ID_categoria INT,
        ID_jogo INT,
        FOREIGN KEY (ID_categoria) REFERENCES categoria (ID_categoria),
        FOREIGN KEY (ID_jogo) REFERENCES jogos (ID_jogo)
    );

-- tabela genero_jogos (relacionamento N:N)
CREATE TABLE
    genero_jogos (
        ID_genero_jogos INT PRIMARY KEY AUTO_INCREMENT,
        ID_genero INT,
        ID_jogo INT,
        FOREIGN KEY (ID_genero) REFERENCES genero (ID_genero),
        FOREIGN KEY (ID_jogo) REFERENCES jogos (ID_jogo)
    );

-- tabela lista_desejos
CREATE TABLE
    lista_desejos (
        ID_lista_desejos INT PRIMARY KEY AUTO_INCREMENT,
        ID_usuario INT,
        ID_jogo INT,
        FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario),
        FOREIGN KEY (ID_jogo) REFERENCES jogos (ID_jogo)
    );

-- tabela biblioteca
CREATE TABLE
    biblioteca (
        ID_biblioteca INT PRIMARY KEY AUTO_INCREMENT,
        ID_usuario INT,
        ID_jogo INT,
        FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario),
        FOREIGN KEY (ID_jogo) REFERENCES jogos (ID_jogo)
    );

-- tabela carrinho
CREATE TABLE
    carrinho (
        ID_carrinho INT PRIMARY KEY AUTO_INCREMENT,
        forma_pagamento VARCHAR(20) NOT NULL,
        data_compra DATE NOT NULL,
        ID_usuario INT,
        ID_jogo INT,
        FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario),
        FOREIGN KEY (ID_jogo) REFERENCES jogos (ID_jogo)
    );

-- tabela comentario
CREATE TABLE
    comentario (
        ID_comentario INT PRIMARY KEY AUTO_INCREMENT,
        ID_usuario INT,
        ID_jogo INT,
        txtcomentario VARCHAR(255),
        data_comentario DATE NOT NULL,
        nota TINYINT CHECK (nota BETWEEN 0 AND 10),
        FOREIGN KEY (ID_usuario) REFERENCES usuario (ID_usuario),
        FOREIGN KEY (ID_jogo) REFERENCES jogos (ID_jogo)
    );

-- Inserindo categorias
INSERT INTO
    categoria (Nome_categoria)
VALUES
    ('Singleplayer'),
    ('Multiplayer Local'),
    ('Multiplayer Online'),
    ('Co-op'),
    ('PvP'),
    ('PvE'),
    ('MMO'),
    ('Cross-Plataform'),
    ('2D'),
    ('3D'),
    ('2.5D'),
    ('Top-Down'),
    ('Side-Scrolling'),
    ('Isométrico'),
    ('Primeira Pessoa'),
    ('Terceira Pessoa'),
    ('Linear'),
    ('Mundo Aberto'),
    ('Sandbox'),
    ('Campanha'),
    ('Missões/Fases'),
    ('Permadeath'),
    ('Roguelike');
    
-- Inserindo gêneros
INSERT INTO
    genero (Nome_genero)
VALUES
    ('Ação'),
    ('Aventura'),
    ('Casual'),
    ('Corrida'),
    ('Esportes'),
    ('Estratégia'),
    ('Indie'),
    ('Luta'),
    ('Musical'),
    ('Narrativo'),
    ('Plataforma'),
    ('Puzzle'),
    ('RPG'),
    ('Simulação'),
    ('Sobrevivência'),
    ('Terror'),
    ('Tiro');