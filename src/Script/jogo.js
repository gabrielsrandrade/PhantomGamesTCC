import { initializeAuth } from "./auth.js";

// Lógica principal é executada apenas após o DOM ser completamente carregado
document.addEventListener("DOMContentLoaded", async () => {
  // Inicializa a autenticação e obtém o estado do usuário de forma assíncrona
  // O restante do script só prossegue após essa verificação
  const { isSignedIn, isAdmin } = await initializeAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const jogoId = urlParams.get("id");
  console.log("ID do jogo solicitado:", jogoId);

  // Se o ID do jogo não estiver na URL, exibe uma mensagem de erro e para a execução
  if (!jogoId) {
    document.querySelector("main").innerHTML =
      '<p style="color: red; text-align: center;">ID do jogo não fornecido.</p>';
    return;
  }

  try {
    // Realiza a requisição para buscar os dados do jogo
    const response = await fetch(`http://localhost:3000/jogos/${jogoId}`);
    console.log("Status do fetch para jogo:", response.status);

    if (!response.ok) {
      // Se a resposta for 404 (não encontrado), exibe uma mensagem específica
      if (response.status === 404) {
        document.querySelector(
          "main"
        ).innerHTML = `<p style="color: red; text-align: center;">Jogo não encontrado. Verifique se o ID ${jogoId} existe no banco de dados. Certifique-se de que o back-end está rodando.</p>`;
        return;
      }
      // Para outros erros, lança uma exceção
      throw new Error(
        "Erro ao buscar detalhes do jogo. Verifique logs do back-end."
      );
    }

    const game = await response.json();
    console.log("Dados do jogo recebidos:", game);

    // Função para renderizar as informações do jogo na página
    renderGameDetails(game);

    // Função para configurar os sliders do Swiper
    setupSwiperSliders(game.midias || []);

    // Função para renderizar os botões de ação com base no estado do usuário
    renderActionButtons(isSignedIn, isAdmin);
  } catch (error) {
    console.error("Erro ao carregar jogo:", error);
    document.querySelector("main").innerHTML =
      '<p style="color: red; text-align: center;">Não foi possível carregar os detalhes do jogo. Verifique o console para mais detalhes ou se o ID é válido. Certifique-se de que o back-end está rodando e o jogo existe.</p>';
  }
});

// Funções de Renderização e Lógica Separada
// Esta abordagem melhora a organização e a legibilidade do código

function renderGameDetails(game) {
  document.getElementById("nome-jogo").textContent = game.Nome_jogo;

  const logoDiv = document.getElementById("logo-jogo");
  logoDiv.innerHTML = ""; // Limpa o conteúdo da div antes de adicionar a logo

  if (game.Logo_jogo) {
    const logoImg = document.createElement("img");
    logoImg.src = game.Logo_jogo;
    logoImg.alt = `Logo de ${game.Nome_jogo}`;
    logoImg.style.maxWidth = "100%";
    logoDiv.appendChild(logoImg);
  } else {
    console.log("Nenhuma logo encontrada para o jogo.");
  }

  document.getElementById("descrição").textContent =
    game.Descricao_jogo || "Descrição não disponível.";

  // Renderiza a imagem da faixa etária dinamicamente
  const faixaEtariaImg = document.getElementById("faixa-etaria-img");
  const faixaEtaria = game.Faixa_etaria;

  // Corrigindo o caminho da imagem da faixa etária
  faixaEtariaImg.src = `../../assets/imagens/${faixaEtaria.toLowerCase()}.png`;
  faixaEtariaImg.alt = `Faixa Etária: ${faixaEtaria}`;

  const precoSpan = document.getElementById("preco");
  const preco = parseFloat(game.Preco_jogo);
  precoSpan.textContent =
    preco === 0 ? "Grátis" : `R$${preco.toFixed(2).replace(".", ",")}`;

  // Renderiza as estrelas de avaliação
  const avaliacaoDiv = document.getElementById("avaliacao");
  const rating = Math.round(game.Media_nota / 2);
  let starHtml = "";
  for (let i = 0; i < 5; i++) {
    starHtml += `<span class="star" style="color: ${
      i < rating ? "var(--star-color)" : "var(--non-selected-color)"
    };">&#9733;</span>`;
  }
  avaliacaoDiv.innerHTML = starHtml;

  // Renderiza gêneros e categorias
  const generosDiv = document.getElementById("genero");
  generosDiv.innerHTML = game.generos
    .map((genero) => `<span>${genero}</span>`)
    .join("");

  const categoriasDiv = document.getElementById("categoria");
  categoriasDiv.innerHTML = game.categorias
    .map((categoria) => `<span>${categoria}</span>`)
    .join("");
}

function setupSwiperSliders(midias) {
  const mainWrapper = document.querySelector(
    ".jogo-main-image .swiper-wrapper"
  );
  const thumbsWrapper = document.querySelector(
    ".jogo-side-image .swiper-wrapper"
  );
  mainWrapper.innerHTML = "";
  thumbsWrapper.innerHTML = "";

  if (midias.length === 0) {
    const placeholderSlide = `
            <div class="swiper-slide">
                <img src="../../assets/imagens/placeholder-image.jpg" alt="Sem mídia disponível" />
            </div>
        `;
    mainWrapper.innerHTML = placeholderSlide;
    thumbsWrapper.innerHTML = placeholderSlide;
  } else {
    // Itera sobre as mídias recebidas e cria um slide para cada uma
    midias.forEach((midiaUrl) => {
      // Concatena a URL base do servidor com o caminho da mídia
      const fullUrl = `http://localhost:3000${midiaUrl}`;

      const slideHtml = `
                <div class="swiper-slide">
                    <img src="${fullUrl}" alt="Mídia do jogo" />
                </div>
            `;
      mainWrapper.innerHTML += slideHtml;
      thumbsWrapper.innerHTML += slideHtml;
    });
  }

  // Inicializa os sliders Swiper se a biblioteca estiver disponível
  if (typeof Swiper !== "undefined") {
    var swiper = new Swiper(".jogo-side-image", {
      spaceBetween: 16,
      slidesPerView: 4,
      freeMode: true,
      loop: false,
      watchSlidesProgress: true,
     
    });
    var swiper2 = new Swiper(".jogo-main-image", {
      spaceBetween: 10,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      thumbs: {
        swiper: swiper,
      },
    });
  }
}

function renderActionButtons(isSignedIn, isAdmin) {
  const detalhesJogo = document.querySelector(".detalhes-jogo");
  const existingButtons = detalhesJogo.querySelectorAll("button");
  existingButtons.forEach((btn) => btn.remove()); // Remove botões existentes para evitar duplicação

  if (isAdmin) {
    const editBtn = document.createElement("button");
    editBtn.id = "editar";
    editBtn.textContent = "Editar Jogo";
    editBtn.addEventListener("click", () => {
      alert("Função de edição não implementada ainda.");
    });

    const removeBtn = document.createElement("button");
    removeBtn.id = "remover";
    removeBtn.textContent = "Remover Jogo";
    removeBtn.addEventListener("click", () => {
      alert("Função de remoção não implementada ainda.");
    });

    detalhesJogo.appendChild(editBtn);
    detalhesJogo.appendChild(removeBtn);
  } else {
    const buyBtn = document.createElement("button");
    buyBtn.id = "comprar";
    buyBtn.textContent = "Comprar";

    const wishBtn = document.createElement("button");
    wishBtn.id = "desejos";
    wishBtn.textContent = "Adicionar à Lista de Desejos";

    if (isSignedIn) {
      buyBtn.addEventListener("click", () => {
        alert("Função de compra não implementada ainda.");
      });
      wishBtn.addEventListener("click", () => {
        alert("Função de adicionar à lista de desejos não implementada ainda.");
      });
    } else {
      buyBtn.addEventListener("click", () => {
        alert("Você precisa estar logado para comprar.");
        window.location.href = "login.html";
      });
      wishBtn.addEventListener("click", () => {
        alert("Você precisa estar logado para adicionar à lista de desejos.");
        window.location.href = "login.html";
      });
    }
    detalhesJogo.appendChild(buyBtn);
    detalhesJogo.appendChild(wishBtn);
  }
}
