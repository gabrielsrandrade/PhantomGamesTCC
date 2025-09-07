async function carregarJogos() {
  try {
    const response = await fetch("http://localhost:3000/jogos");
    const jogos = await response.json();

    const container = document.getElementById("cards-container");
    container.innerHTML = "";

    jogos.forEach(jogo => {
      const card = document.createElement("div");
      card.classList.add("card_jogo"); // só card_jogo

      card.innerHTML = `
        <div class="capa_card">
          <img src="${jogo.Capa_jogo}" alt="${jogo.Nome_jogo}" />
        </div>
        <span>${jogo.Nome_jogo}</span>
        <div class="estrelas">
          ${renderStars(jogo.Media_nota)}
        </div>
        <span>R$${Number(jogo.Preco_jogo).toFixed(2)}</span>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar jogos:", error);
  }
}

function renderStars(media) {
  const maxStars = 5;
  let estrelas = "";
  const nota = Math.round(media || 0);

  for (let i = 1; i <= maxStars; i++) {
    estrelas += `<span class="star">${i <= nota ? "&#9733;" : "&#9734;"}</span>`;
  }

  return estrelas;
}

carregarJogos();

