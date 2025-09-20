drop database PhantomGames;

create database PhantomGames;

use PhantomGames;

/* tabela usuario */
create table usuario(
ID_usuario varchar(50) primary key not null,
Nome varchar(80) not null,
Imagem_perfil varchar(255)
);

/* tabela categoria */
create table categoria(
ID_categoria int(2) primary key not null auto_increment,
Nome varchar(20) not null
);

/* tabela genero */
create table genero(
ID_genero int(2) primary key not null auto_increment,
Nome varchar(20) not null
);

/* tabela jogos */
create table jogos(
ID_jogo int(5) primary key not null auto_increment,
Nome_jogo varchar(100) not null,
Preco_jogo decimal(5,2) not null,
Logo_jogo text not null,
Descricao_jogo text,
Capa_jogo text not null,
Faixa_etaria text not null,
Media_nota decimal(10,2) not null
);

/* tabela midia_jogos */
create table midias_jogo(
  ID_midia int(10) not null auto_increment primary key,
  ID_jogo int(5) not null,
  URL_midia varchar(255) not null,
  foreign key (ID_jogo) references jogos(ID_jogo)
);

/* tabela categoria_jogos (relacionamento entre jogos e categorias) */
create table categoria_jogos(
  ID_categoria int(2) not null,
  ID_jogo int(5) not null,
  primary key (ID_categoria, ID_jogo),
  foreign key (ID_categoria) references categoria(ID_categoria),
  foreign key (ID_jogo) references jogos(ID_jogo)
);

/* tabela genero_jogos (relacionamento entre jogos e generos) */
create table genero_jogos(
  ID_genero int(2) not null,
  ID_jogo int(5) not null,
  primary key (ID_genero, ID_jogo),
  foreign key (ID_genero) references genero(ID_genero),
  foreign key (ID_jogo) references jogos(ID_jogo)
);

/*tabela lista_desejos */
create table lista_desejos(
ID_lista_desejos int(5) primary key not null auto_increment, 
ID_usuario varchar(50),
ID_jogo int(5),
foreign key (ID_usuario) references usuario(ID_usuario),
foreign key (ID_jogo) references jogos(ID_jogo));

/*tabela biblioteca */
create table biblioteca(
ID_biblioteca int(5) primary key not null auto_increment, 
ID_usuario varchar(50),
ID_jogo int(5),
foreign key (ID_usuario) references usuario(ID_usuario),
foreign key (ID_jogo) references jogos(ID_jogo));

/*tabela carrinho */
create table carrinho(
ID_carrinho int(5) primary key not null auto_increment, 
forma_pagamento varchar(20) not null,
data_compra date not null,
ID_usuario varchar(50),
ID_jogo int(5),
foreign key (ID_usuario) references usuario(ID_usuario),
foreign key (ID_jogo) references jogos(ID_jogo));

/*tabela comentário */
create table comentario(
ID_comentario int(12) primary key not null auto_increment, 
ID_usuario varchar(50),
ID_jogo int(5),
txtcomentario varchar(255),
data_comentario date not null,
nota int(1),
foreign key (ID_usuario) references usuario(ID_usuario),
foreign key (ID_jogo) references jogos(ID_jogo));

INSERT INTO genero (Nome)
VALUES ('Ação'), ('Aventura'), ('Casual'), ('Corrida'), ('Esportes'), ('Estratégia'), ('Indie'), ('Luta'), ('Musical'), ('Narrativo'), 
('Plataforma'), ('Puzzle'), ('RPG'), ('Simulação'), ('Sobrevivência'), ('Terror'), ('Tiro');

INSERT INTO categoria (Nome)
VALUES ('Singleplayer'), ('Multiplayer Local'), ('Multiplayer Online'), ('Co-op'), ('PvP'), ('PvE'), ('MMO'), ('Cross-Plataform'),
('2D'), ('3D'), ('2.5D'), ('Top-Down'), ('Side-Scrooling'), ('Isométrico'), ('Primeira Pessoa'), ('Terceira Pessoa'),
('Linear'), ('Mundo Aberto'), ('Sandbox'), ('Campanha'), ('Missões/Fases'), ('Permadeath'), ('Rouguelike');