import { initializeAuth } from "./auth.js";

// --- Funções do Modal de Adição/Edição (anteriormente em outro arquivo) ---
function createAddGameModal() {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("div");
  modal.classList.add("add-game-modal");

  // CSS para o modal e as mídias
  const modalStyle = `
      <style>
          .modal-content .media-preview-item {
              margin-bottom: 20px; /* Adiciona espaçamento entre os itens de mídia */
          }
          .modal-content .media-preview-item .media-details {
              display: flex;
              flex-direction: column;
              margin-top: 10px;
              padding-left: 10px;
          }
          .modal-content .media-preview-item .media-details button {
              width: fit-content;
              align-self: flex-start;
              margin-top: 5px;
          }
      </style>
  `;

  const firstPageHTML = `
    <div class="modal-content" id="first-page">
            <button class="close-modal-btn">&times;</button>
            <h2>Adicionar Novo Jogo</h2>
            <form id="add-game-form">
                <div class="form-group">
                    <label for="Nome_jogo">Nome do Jogo:</label>
                    <input type="text" id="Nome_jogo" name="Nome_jogo" required>
                </div>
                <div class="form-group">
                    <label for="Descricao_jogo">Descrição:</label>
                    <textarea id="Descricao_jogo" name="Descricao_jogo" required></textarea>
                </div>
                <div class="form-group">
                    <label for="Preco_jogo">Preço (R$):</label>
                    <input type="number" id="Preco_jogo" name="Preco_jogo" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="Logo_jogo">Logo (URL da Imagem):</label>
                    <input type="url" id="Logo_jogo" name="Logo_jogo">
                </div>
                <div class="form-group">
                    <label for="Capa_jogo">Capa (URL da Imagem):</label>
                    <input type="url" id="Capa_jogo" name="Capa_jogo" required>
                </div>
                <div class="form-group">
                    <label for="Faixa_etaria">Faixa Etária:</label>
                    <select id="Faixa_etaria" name="Faixa_etaria" required>
                        <option value="L">L - Livre</option>
                        <option value="10">10+</option>
                        <option value="12">12+</option>
                        <option value="14">14+</option>
                        <option value="16">16+</option>
                        <option value="18">18+</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Gêneros:</label>
                    <div class="multiselect-container" id="multiselect-genre">
                        <div class="multiselect-tags" id="genre-tags"></div>
                        <div class="multiselect-dropdown hidden" id="genre-dropdown">
                            ${["Ação", "Aventura", "Casual", "Corrida", "Esportes", "Estratégia", "Indie", "Luta", "Musical", "Narrativo", "Plataforma", "Puzzle", "RPG", "Simulação", "Sobrevivência", "Terror", "Tiro"].map(g => `<span class="multiselect-option" data-value="${g}">${g}</span>`).join("")}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Categorias:</label>
                    <div class="multiselect-container" id="multiselect-category">
                        <div class="multiselect-tags" id="category-tags"></div>
                        <div class="multiselect-dropdown hidden" id="category-dropdown">
                            ${["Singleplayer", "Multiplayer Local", "Multiplayer Online", "Co-op", "PvP", "PvE", "MMO", "Cross-Plataform", "2D", "3D", "2.5D", "Top-Down", "Side-Scrooling", "Isométrico", "Primeira Pessoa", "Terceira Pessoa", "Linear", "Mundo Aberto", "Sandbox", "Campanha", "Missões/Fases", "Permadeath", "Rouguelike"].map(c => `<span class="multiselect-option" data-value="${c}">${c}</span>`).join("")}
                        </div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="button" class="clear-btn">Limpar</button>
                    <button type="button" class="next-btn">Próximo</button>
                </div>
            </form>
        </div>
  `;

  const secondPageHTML = `
      <div class="modal-content" id="second-page" style="display: none;">
          <button class="close-modal-btn">&times;</button>
          <h2>Adicionar Mídias</h2>
          <div class="form-group">
              <label for="media-upload">Selecionar Imagens/Vídeos:</label>
              <input type="file" id="media-upload" name="media-upload" multiple accept="image/*,video/*">
          </div>
          <p>Total de mídias: <span id="media-count">0</span></p>
          <div id="media-preview-container" class="media-preview-container"></div>
          <div class="form-buttons">
              <button type="button" class="back-btn">Voltar</button>
              <button type="button" class="submit-btn">Adicionar Jogo</button>
          </div>
      </div>
  `;

  modal.innerHTML = modalStyle + firstPageHTML + secondPageHTML;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-modal-btn')) {
          overlay.remove();
      }
  });

  const firstPage = modal.querySelector('#first-page');
  const secondPage = modal.querySelector('#second-page');
  const nextBtn = firstPage.querySelector('.next-btn');
  const backBtn = secondPage.querySelector('.back-btn');

  nextBtn.addEventListener('click', () => {
      firstPage.style.display = 'none';
      secondPage.style.display = 'block';
  });

  backBtn.addEventListener('click', () => {
      secondPage.style.display = 'none';
      firstPage.style.display = 'block';
  });

  return modal;
}

// Cria um modal de confirmação customizado para substituir window.confirm
function createConfirmModal(message) {
  return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.classList.add('modal-overlay');

      const modal = document.createElement('div');
      modal.classList.add('confirm-modal');
      modal.innerHTML = `
          <p>${message}</p>
          <div class="confirm-buttons">
              <button id="confirm-yes">Sim</button>
              <button id="confirm-no">Não</button>
          </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(modal);

      modal.querySelector('#confirm-yes').onclick = () => {
          modal.remove();
          overlay.remove();
          resolve(true);
      };
      modal.querySelector('#confirm-no').onclick = () => {
          modal.remove();
          overlay.remove();
          resolve(false);
      };
  });
}

// Exibe uma mensagem temporária para substituir window.alert
function showMessage(message) {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.textContent = message;
  document.body.appendChild(messageBox);
  setTimeout(() => {
      messageBox.remove();
  }, 3000); // Remove a mensagem após 3 segundos
}

// Função auxiliar para pré-preencher os multiselects
function prefillMultiselect(multiselectContainer, selectedValues) {
  if (!multiselectContainer || !selectedValues) return;

  const dropdown = multiselectContainer.querySelector('.multiselect-dropdown');
  const tagsContainer = multiselectContainer.querySelector('.multiselect-tags');
  tagsContainer.innerHTML = '';
  
  selectedValues.forEach(value => {
      const tag = document.createElement('span');
      tag.classList.add('tag');
      tag.textContent = value;
      tagsContainer.appendChild(tag);
      
      const option = dropdown.querySelector(`[data-value="${value}"]`);
      if (option) {
          option.classList.add('selected');
      }
  });
}

// Lógica para configurar a interatividade dos multiselects
function setupMultiselect(containerId) {
  const multiselectContainer = document.getElementById(containerId);
  const tagsContainer = multiselectContainer.querySelector('.multiselect-tags');
  const dropdown = multiselectContainer.querySelector('.multiselect-dropdown');

  // Toggle dropdown visibility
  multiselectContainer.addEventListener('click', (e) => {
      if (e.target.closest('.multiselect-tags') || e.target.closest('.multiselect-dropdown')) {
          dropdown.classList.toggle('hidden');
      } else {
          dropdown.classList.add('hidden');
      }
  });

  // Handle option selection
  dropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.multiselect-option');
      if (option) {
          const value = option.dataset.value;
          const isSelected = option.classList.contains('selected');

          if (isSelected) {
              // Deselect
              option.classList.remove('selected');
              const tagToRemove = tagsContainer.querySelector(`.tag[data-value="${value}"]`);
              if (tagToRemove) {
                  tagToRemove.remove();
              }
          } else {
              // Select
              option.classList.add('selected');
              const tag = document.createElement('span');
              tag.classList.add('tag');
              tag.textContent = value;
              tag.dataset.value = value;
              tagsContainer.appendChild(tag);
          }
          e.stopPropagation();
      }
  });
}

// Lógica principal é executada apenas após o DOM ser completamente carregado
document.addEventListener("DOMContentLoaded", async () => {
  // Inicializa a autenticação e obtém o estado do usuário de forma assíncrona
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
function renderGameDetails(game) {
  document.getElementById("nome-jogo").textContent = game.Nome_jogo;

  const logoDiv = document.getElementById("logo-jogo");
  logoDiv.innerHTML = "";
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

  const faixaEtariaImg = document.getElementById("faixa-etaria-img");
  const faixaEtaria = game.Faixa_etaria;
  faixaEtariaImg.src = `../../assets/imagens/${faixaEtaria.toLowerCase()}.png`;
  faixaEtariaImg.alt = `Faixa Etária: ${faixaEtaria}`;

  const precoSpan = document.getElementById("preco");
  const preco = parseFloat(game.Preco_jogo);
  precoSpan.textContent =
      preco === 0 ? "Grátis" : `R$${preco.toFixed(2).replace(".", ",")}`;

  const avaliacaoDiv = document.getElementById("avaliacao");
  const rating = Math.round(game.Media_nota / 2);
  let starHtml = "";
  for (let i = 0; i < 5; i++) {
      starHtml += `<span class="star" style="color: ${
          i < rating ? "var(--star-color)" : "var(--non-selected-color)"
      };">&#9733;</span>`;
  }
  avaliacaoDiv.innerHTML = starHtml;

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
      midias.forEach((midiaUrl) => {
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

// ----------------------------------------------------
// LÓGICA PARA BOTÕES DE AÇÃO E EDIÇÃO
// ----------------------------------------------------

function renderActionButtons(isSignedIn, isAdmin) {
  const detalhesJogo = document.querySelector(".detalhes-jogo");
  const existingButtons = detalhesJogo.querySelectorAll("button");
  existingButtons.forEach((btn) => btn.remove());

  if (isAdmin) {
      const urlParams = new URLSearchParams(window.location.search);
      const jogoId = urlParams.get("id");

      const editBtn = document.createElement("button");
      editBtn.id = "editar";
      editBtn.textContent = "Editar Jogo";
      editBtn.addEventListener("click", async () => {
          try {
              const response = await fetch(`http://localhost:3000/jogos/${jogoId}`);
              if (!response.ok) {
                  throw new Error("Jogo não encontrado para edição.");
              }
              const gameData = await response.json();

              // Cria e exibe o modal
              const modal = createAddGameModal();

              // Obtém referências para os elementos do modal recém-criado
              const firstPage = modal.querySelector("#first-page");
              const secondPage = modal.querySelector("#second-page");
              const form = modal.querySelector("#add-game-form");
              const submitBtn = secondPage.querySelector(".submit-btn");
              const mediaPreviewContainer = secondPage.querySelector("#media-preview-container");
              const mediaUploadInput = secondPage.querySelector("#media-upload");
              const mediaCountSpan = secondPage.querySelector("#media-count");
              
              // Pré-preenche os campos do formulário na primeira página
              firstPage.querySelector('h2').textContent = 'Editar Jogo';
              secondPage.querySelector('h2').textContent = 'Adicionar Mídias';
              submitBtn.textContent = 'Salvar Edições';
              document.getElementById("Nome_jogo").value = gameData.Nome_jogo;
              document.getElementById("Descricao_jogo").value = gameData.Descricao_jogo;
              document.getElementById("Preco_jogo").value = gameData.Preco_jogo;
              document.getElementById("Logo_jogo").value = gameData.Logo_jogo;
              document.getElementById("Capa_jogo").value = gameData.Capa_jogo;
              document.getElementById("Faixa_etaria").value = gameData.Faixa_etaria;

              // Pré-preenche os multiselects com os dados existentes do jogo
              prefillMultiselect(document.getElementById('multiselect-genre'), gameData.generos);
              prefillMultiselect(document.getElementById('multiselect-category'), gameData.categorias);

              // Configura a interatividade dos multiselects
              setupMultiselect('multiselect-genre');
              setupMultiselect('multiselect-category');

              // Variável para rastrear as mídias existentes que devem ser salvas
              let existingMidiasToKeep = gameData.midias;
              let currentMediaCount = gameData.midias.length;

              // Mostra o contador de mídias inicial
              mediaCountSpan.textContent = currentMediaCount;

              // Mostra as mídias existentes na segunda página
              gameData.midias.forEach(mediaUrl => {
                  const fullUrl = `http://localhost:3000${mediaUrl}`;
                  const fileName = mediaUrl.split('/').pop();
                  const mediaElement = document.createElement('div');
                  mediaElement.classList.add('media-preview-item');
                  
                  const fileExtension = mediaUrl.split('.').pop().toLowerCase();
                  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExtension)) {
                      mediaElement.innerHTML = `<img src="${fullUrl}" alt="${fileName}" />`;
                  } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                      mediaElement.innerHTML = `<video src="${fullUrl}" controls></video>`;
                  } else {
                      mediaElement.innerHTML = `<p>Arquivo não suportado: ${fileName}</p>`;
                  }
                  
                  const nameAndButton = document.createElement('div');
                  nameAndButton.classList.add('media-details');
                  nameAndButton.innerHTML = `
                      <span>${fileName}</span>
                      <button class="remove-media-btn">Remover</button>
                  `;
                  mediaElement.appendChild(nameAndButton);

                  // Adiciona o listener para o botão de remoção
                  nameAndButton.querySelector('.remove-media-btn').addEventListener('click', () => {
                      mediaElement.remove();
                      // Remove a URL da lista de mídias a serem salvas
                      existingMidiasToKeep = existingMidiasToKeep.filter(url => url !== mediaUrl);
                      currentMediaCount--;
                      mediaCountSpan.textContent = currentMediaCount;
                  });

                  mediaPreviewContainer.appendChild(mediaElement);
              });

              // Adiciona um listener para pré-visualizar novos arquivos
              mediaUploadInput.addEventListener('change', (e) => {
                  const files = e.target.files;
                  for (const file of files) {
                      const fileReader = new FileReader();
                      fileReader.onload = (event) => {
                          const mediaElement = document.createElement('div');
                          mediaElement.classList.add('media-preview-item');
                          
                          if (file.type.startsWith('image/')) {
                              mediaElement.innerHTML = `<img src="${event.target.result}" alt="${file.name}" />`;
                          } else if (file.type.startsWith('video/')) {
                              mediaElement.innerHTML = `<video src="${event.target.result}" controls></video>`;
                          } else {
                              mediaElement.innerHTML = `<p>Arquivo não suportado: ${file.name}</p>`;
                          }
                          
                          const nameAndButton = document.createElement('div');
                          nameAndButton.classList.add('media-details');
                          nameAndButton.innerHTML = `
                              <span>${file.name}</span>
                              <button class="remove-media-btn">Remover</button>
                          `;
                          mediaElement.appendChild(nameAndButton);

                          // Adiciona o listener de remoção para novos arquivos
                          nameAndButton.querySelector('.remove-media-btn').addEventListener('click', () => {
                              mediaElement.remove();
                              currentMediaCount--;
                              mediaCountSpan.textContent = currentMediaCount;
                          });

                          mediaPreviewContainer.appendChild(mediaElement);
                          currentMediaCount++;
                          mediaCountSpan.textContent = currentMediaCount;
                      };
                      fileReader.readAsDataURL(file);
                  }
              });

              // Adiciona o event listener de envio para o modo de edição
              submitBtn.addEventListener('click', async (e) => {
                  e.preventDefault();
                  
                  const formData = new FormData();
                  
                  // Adiciona os dados do formulário principal
                  formData.append("Nome_jogo", document.getElementById("Nome_jogo").value);
                  formData.append("Descricao_jogo", document.getElementById("Descricao_jogo").value);
                  formData.append("Preco_jogo", document.getElementById("Preco_jogo").value);
                  formData.append("Logo_jogo", document.getElementById("Logo_jogo").value);
                  formData.append("Capa_jogo", document.getElementById("Capa_jogo").value);
                  formData.append("Faixa_etaria", document.getElementById("Faixa_etaria").value);

                  // Pega os gêneros e categorias selecionados
                  const selectedGeneros = Array.from(document.querySelectorAll('#multiselect-genre .tag')).map(tag => tag.textContent);
                  const selectedCategorias = Array.from(document.querySelectorAll('#multiselect-category .tag')).map(tag => tag.textContent);

                  // Adiciona os valores ao FormData
                  selectedGeneros.forEach(genero => formData.append("generos[]", genero));
                  selectedCategorias.forEach(categoria => formData.append("categorias[]", categoria));


                  // Adiciona as mídias existentes que não foram removidas
                  existingMidiasToKeep.forEach(url => {
                      formData.append("existing_midias[]", url);
                  });

                  // Adiciona os novos arquivos
                  const files = mediaUploadInput.files;
                  for (const file of files) {
                      formData.append('midias', file);
                  }

                  const url = `http://localhost:3000/jogos/${jogoId}`;

                  try {
                      const response = await fetch(url, {
                          method: 'PUT',
                          body: formData,
                      });

                      if (!response.ok) {
                          throw new Error('Erro ao salvar as edições do jogo.');
                      }

                      showMessage("Jogo editado com sucesso!");
                      window.location.reload();
                  } catch (error) {
                      console.error("Erro na edição:", error);
                      showMessage("Ocorreu um erro ao salvar as edições do jogo.");
                  }
              }, { once: true });
          } catch (error) {
              console.error("Erro ao carregar dados para edição:", error);
              showMessage("Não foi possível carregar os dados do jogo para edição. Verifique o console.");
          }
      });

      const removeBtn = document.createElement("button");
      removeBtn.id = "remover";
      removeBtn.textContent = "Remover Jogo";
      removeBtn.addEventListener("click", async () => {
          const confirmed = await createConfirmModal("Tem certeza que deseja remover este jogo? Esta ação não pode ser desfeita.");
          if (confirmed) {
              try {
                  const response = await fetch(`http://localhost:3000/jogos/${jogoId}`, {
                      method: 'DELETE',
                  });

                  if (!response.ok) {
                      throw new Error("Erro ao remover o jogo. Verifique o console.");
                  }

                  showMessage("Jogo removido com sucesso!");
                  window.location.href = "homepage.html";
              } catch (error) {
                  console.error("Erro na remoção:", error);
                  showMessage("Não foi possível remover o jogo. Tente novamente.");
              }
          }
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
              showMessage("Função de compra não implementada ainda.");
          });
          wishBtn.addEventListener("click", () => {
              showMessage("Função de adicionar à lista de desejos não implementada ainda.");
          });
      } else {
          buyBtn.addEventListener("click", () => {
              showMessage("Você precisa estar logado para comprar.");
              window.location.href = "login.html";
          });
          wishBtn.addEventListener("click", () => {
              showMessage("Você precisa estar logado para adicionar à lista de desejos.");
              window.location.href = "login.html";
          });
      }
      detalhesJogo.appendChild(buyBtn);
      detalhesJogo.appendChild(wishBtn);
  }
}
