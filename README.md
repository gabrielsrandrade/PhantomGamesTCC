# 🎮 Phantom Games - E-commerce de Jogos

Este projeto é um **Trabalho de Conclusão de Curso (TCC)** desenvolvido para o curso de **Técnico em Desenvolvimento de Sistemas** (Etec 2025). A **Phantom Games** é uma plataforma completa de distribuição digital de jogos, focada em experiência do usuário, segurança em pagamentos e uma arquitetura moderna de software.

---

## 🚀 Funcionalidades Principais

* **Autenticação Avançada:** Gestão de usuários, login e cadastro via **Clerk** (integrado com temas dark e localização pt-BR).
* **Loja Dinâmica:** Carrossel de destaques (Slider.js), listagem de jogos com filtros avançados (gênero, categoria e nota) e busca em tempo real.
* **Gestão de Jogos:** * Biblioteca pessoal do usuário (jogos comprados).
    * Lista de desejos (Wishlist).
    * Sistema de comentários e avaliações com média de notas automática.
* **Checkout Profissional:** Integração real com a API do **Stripe** para processamento de pagamentos.
* **Painel Administrativo:** Interface modular para adição de novos jogos e gerenciamento de mídias/uploads.

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
* **Framework de Build:** Vite
* **Linguagens:** HTML5, CSS3, JavaScript (ES6+)
* **Bibliotecas:** Swiper.js (Sliders), Clerk SDK (Auth), Stripe Elements (Pagamentos)

### **Back-end & Banco de Dados**
* **Runtime:** Node.js
* **Framework:** Express
* **Banco de Dados:** MySQL (Relacional)
* **Uploads:** Multer (Gestão de imagens e capas)

---
## ⚙️ Configuração do Ambiente (.env)

Para o correto funcionamento das integrações, crie um arquivo `.env` na raiz do projeto (`PhantomGamesTCC/`) com o seguinte formato:

```env
# --- CONFIGURAÇÕES DO CLERK (AUTENTICAÇÃO) ---
VITE_CLERK_PUBLISHABLE_KEY=sua_chave_publica_aqui
CLERK_SECRET_KEY=sua_chave_privada_aqui

# --- CONFIGURAÇÕES DO STRIPE (PAGAMENTOS) ---
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_aqui
STRIPE_SECRET_KEY=sua_chave_privada_aqui
```

---

## 🔧 Como Executar o Projeto

Siga os passos abaixo em **dois terminais diferentes** para rodar o ecossistema completo:

### 1. Iniciar o Banco de Dados (Back-end)

No primeiro terminal, navegue até a pasta de configurações e inicie o servidor Node:

```bash
cd PhantomGamesTCC\src\back-end\settings
node bd.js
```

> **Nota:** O servidor será iniciado na porta `3000`.

---

### 2. Iniciar o Localhost (Front-end)

No segundo terminal, vá para a raiz do projeto e execute o comando do Vite:

```bash
cd PhantomGamesTCC
npm run dev
```

> **Nota:** O Vite abrirá o projeto no endereço padrão: [http://localhost:5173](http://localhost:5173).

---

## 👥 Autores

* **Fabricio Marconato Garcia** — Designer UI/UX & Desenvolvedor Full Stack — [GitHub]([https://github.com/seu-usuario-1](https://github.com/Dheiko))
* **Gabriel Henrique Oliveira** — Desenvolvedor Front-end & Back-end — [GitHub]([https://github.com/seu-usuario-2](https://github.com/OGabriel0))
* **Gabriel Santana de Andrade** — DBA & Back-end — [GitHub]([https://github.com/seu-usuario-3](https://github.com/gabrielsrandrade))
