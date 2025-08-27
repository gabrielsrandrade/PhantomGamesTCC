import { Clerk } from '@clerk/clerk-js';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerk = new Clerk(clerkPubKey);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await clerk.load();

    clerk.addListener(({ user }) => {
      renderNavbar(user);
    });

    renderNavbar(clerk.user);
    
  } catch (error) {
    console.error('Erro ao inicializar Clerk:', error);
  }
});

function renderNavbar(user) {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  const isSignedIn = !!user;

  if (isSignedIn) {
    const userEmail = user.primaryEmailAddress?.emailAddress;

    if (userEmail === "phantomgamestcc@gmail.com") {
      navbar.innerHTML = `
        <div class="logadoA">
          <ul>
            <li><img src="../../assets/imagens/logo-png.png" alt="Logo"></li>
            <li><a href="homepage.html">Descobrir</a></li>
            <li><a href="navegar.html">Navegar</a></li>
          </ul>
          <form class="search-bar">
            <input type="search" placeholder="Pesquisar...">
          </form>
          <a><button id="add-game-btn">Adicionar Jogo</button></a>
          <div id="user-button"></div>
        </div>
      `;
      // Adiciona o event listener APÓS o botão ser inserido
      const addButton = document.getElementById('add-game-btn');
      if (addButton) {
          addButton.addEventListener('click', createAddGameModal);
      }
    } else {
      navbar.innerHTML = `
        <div class="logadoM">
          <ul>
            <li><img src="../../assets/imagens/logo-png.png" alt="Logo"></li>
            <li><a href="homepage.html">Descobrir</a></li>
            <li><a href="navegar.html">Navegar</a></li>
            <li><a href="suporte.html">Suporte</a></li>
            <li><a href="biblioteca.html">Biblioteca</a></li>
          </ul>
          <form class="search-bar">
            <input type="search" placeholder="Pesquisar...">
          </form>
            <div class="left">
          <li><img class="carrinho" src="../../assets/imagens/carrinho.png" alt="Logo"></li>
          <div id="user-button"></div>
            </div>
        </div>
      `;
    }

    const userButtonDiv = document.getElementById('user-button');
    if (userButtonDiv) {
      clerk.mountUserButton(userButtonDiv);
    }
  } else {
    navbar.innerHTML = `
      <div class="deslogado">
        <ul>
          <li><img src="../../assets/imagens/logo-png.png" alt="Logo"></li>
          <li><a href="homepage.html">Descobrir</a></li>
          <li><a href="navegar.html">Navegar</a></li>
          <li><a href="suporte.html">Suporte</a></li>
        </ul>
        <form class="search-bar">
          <input type="search" placeholder="Pesquisar...">
        </form>
        <a href="login.html"><button>Entrar</button></a>
      </div>
    `;
  }
}


function createAddGameModal() {
    // Cria o elemento de overlay que escurece o fundo
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Cria o elemento da modal
    const modal = document.createElement('div');
    modal.classList.add('add-game-modal');
    
    // Conteúdo HTML da modal
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal-btn">&times;</button>
            <h2>Adicionar Novo Jogo</h2>
            <form id="add-game-form">
                <div class="form-group">
                    <label for="game-name">Nome do Jogo:</label>
                    <input type="text" id="game-name" name="game-name" required>
                </div>
                <div class="form-group">
                    <label for="game-description">Descrição:</label>
                    <textarea id="game-description" name="game-description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="game-price">Preço (R$):</label>
                    <input type="number" id="game-price" name="game-price" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="game-logo">Logo (URL da Imagem):</label>
                    <input type="url" id="game-logo" name="game-logo">
                </div>
                <div class="form-group">
                    <label for="game-cover">Capa (URL da Imagem):</label>
                    <input type="url" id="game-cover" name="game-cover" required>
                </div>
                <div class="form-group">
                    <label for="game-media">Imagens/Vídeos (URLs, separadas por vírgula):</label>
                    <textarea id="game-media" name="game-media"></textarea>
                </div>
                <div class="form-group">
                    <label for="game-rating">Faixa Etária:</label>
                    <select id="game-rating" name="game-rating" required>
                        <option value="L">L - Livre</option>
                        <option value="10">10+</option>
                        <option value="12">12+</option>
                        <option value="14">14+</option>
                        <option value="16">16+</option>
                        <option value="18">18+</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="reset" class="clear-btn">Limpar</button>
                    <button type="submit" class="submit-btn">Adicionar</button>
                </div>
            </form>
        </div>
    `;

    // Adiciona a modal e o overlay ao corpo do documento
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Adiciona um evento para fechar a modal
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    closeModalBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    });

    // Opcional: Fechar a modal clicando no overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        }
    });

    // Adiciona evento de submit ao formulário (aqui você faria o envio para o banco de dados)
    const addGameForm = modal.querySelector('#add-game-form');
    addGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Lógica para enviar os dados para o servidor/banco de dados
        console.log('Dados do jogo a serem enviados:', {
            name: addGameForm['game-name'].value,
            description: addGameForm['game-description'].value,
            price: addGameForm['game-price'].value,
            logo: addGameForm['game-logo'].value,
            cover: addGameForm['game-cover'].value,
            media: addGameForm['game-media'].value.split(',').map(url => url.trim()),
            rating: addGameForm['game-rating'].value
        });

        alert('Jogo adicionado com sucesso! (Simulação)');
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    });
}