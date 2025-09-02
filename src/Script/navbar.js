// import { Clerk } from '@clerk/clerk-js';

// const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// const clerk = new Clerk(clerkPubKey);

// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     await clerk.load();

//     clerk.addListener(({ user }) => {
//       renderNavbar(user);
//     });

//     renderNavbar(clerk.user);

//   } catch (error) {
//     console.error('Erro ao inicializar Clerk:', error);
//   }
// });

// function renderNavbar(user) {
//   const navbar = document.querySelector('.navbar');
//   if (!navbar) return;

//   const isSignedIn = !!user;

//   if (isSignedIn) {
//     const userEmail = user.primaryEmailAddress?.emailAddress;

//     if (userEmail === "phantomgamestcc@gmail.com") {
//       navbar.innerHTML = `
//         <div class="logadoA">
//           <ul>
//             <li><img src="../../assets/imagens/logo-png.png" alt="Logo"></li>
//             <li><a href="homepage.html">Descobrir</a></li>
//             <li><a href="navegar.html">Navegar</a></li>
//           </ul>
//           <form class="search-bar">
//             <input type="search" placeholder="Pesquisar...">
//           </form>
//           <a><button id="add-game-btn">Adicionar Jogo</button></a>
//           <div id="user-button"></div>
//         </div>
//       `;
//       const addButton = document.getElementById('add-game-btn');
//       if (addButton) {
//         addButton.addEventListener('click', createAddGameModal);
//       }
//     } else {
//       navbar.innerHTML = `
//         <div class="logadoM">
//           <ul>
//             <li><img src="../../assets/imagens/logo-png.png" alt="Logo"></li>
//             <li><a href="homepage.html">Descobrir</a></li>
//             <li><a href="navegar.html">Navegar</a></li>
//             <li><a href="suporte.html">Suporte</a></li>
//             <li><a href="biblioteca.html">Biblioteca</a></li>
//           </ul>
//           <form class="search-bar">
//             <input type="search" placeholder="Pesquisar...">
//           </form>
//           <div class="left">
//           <li><img class="carrinho" src="../../assets/imagens/carrinho.png" alt="Logo"></li>
//           <div id="user-button"></div>
//           </div>
//         </div>
//       `;
//     }

//     const userButtonDiv = document.getElementById('user-button');
//     if (userButtonDiv) {
//       clerk.mountUserButton(userButtonDiv);
//     }
//   } else {
//     navbar.innerHTML = `
//       <div class="deslogado">
//         <ul>
//           <li><img src="../../assets/imagens/logo-png.png" alt="Logo"></li>
//           <li><a href="homepage.html">Descobrir</a></li>
//           <li><a href="navegar.html">Navegar</a></li>
//           <li><a href="suporte.html">Suporte</a></li>
//         </ul>
//         <form class="search-bar">
//           <input type="search" placeholder="Pesquisar...">
//         </form>
//         <a href="login.html"><button>Entrar</button></a>
//       </div>
//     `;
//   }
// }

// function createAddGameModal() {
//   const overlay = document.createElement('div');
//   overlay.classList.add('modal-overlay');

//   const modal = document.createElement('div');
//   modal.classList.add('add-game-modal');

//   const genres = ["Ação", "Aventura", "Casual", "Corrida", "Esportes", "Estratégia", "Indie", "Luta", "Musical", "Narrativo", "Plataforma", "Puzzle", "RPG", "Simulação", "Sobrevivência", "Terror", "Tiro"];
//   const categories = ["Singleplayer", "Multiplayer Local", "Multiplayer Online", "Co-op", "PvP", "PvE", "MMO", "Cross-Plataform", "2D", "3D", "2.5D", "Top-Down", "Side-Scrooling", "Isométrico", "Primeira Pessoa", "Terceira Pessoa", "Linear", "Mundo Aberto", "Sandbox", "Campanha", "Missões/Fases", "Permadeath", "Rouguelike"];

//   modal.innerHTML = `
//       <div class="modal-content">
//           <button class="close-modal-btn">&times;</button>
//           <h2>Adicionar Novo Jogo</h2>
//           <form id="add-game-form">
//               <div class="form-group">
//                   <label for="Nome_jogo">Nome do Jogo:</label>
//                   <input type="text" id="Nome_jogo" name="Nome_jogo" required>
//               </div>
//               <div class="form-group">
//                   <label for="Descricao_jogo">Descrição:</label>
//                   <textarea id="Descricao_jogo" name="Descricao_jogo" required></textarea>
//               </div>
//               <div class="form-group">
//                   <label for="Preco_jogo">Preço (R$):</label>
//                   <input type="number" id="Preco_jogo" name="Preco_jogo" step="0.01" required>
//               </div>
//               <div class="form-group">
//                   <label for="Logo_jogo">Logo (URL da Imagem):</label>
//                   <input type="url" id="Logo_jogo" name="Logo_jogo">
//               </div>
//               <div class="form-group">
//                   <label for="Capa_jogo">Capa (URL da Imagem):</label>
//                   <input type="url" id="Capa_jogo" name="capa_jogo" required>
//               </div>
//               <div class="form-group">
//                   <label for="Midias_jogo">Imagens/Vídeos (URLs, separadas por vírgula):</label>
//                   <textarea id="Midias_jogo" name="Midias_jogo"></textarea>
//               </div>
//               <div class="form-group">
//                   <label for="Faixa_etaria">Faixa Etária:</label>
//                   <select id="Faixa_etaria" name="Faixa_etaria" required>
//                       <option value="L">L - Livre</option>
//                       <option value="10">10+</option>
//                       <option value="12">12+</option>
//                       <option value="14">14+</option>
//                       <option value="16">16+</option>
//                       <option value="18">18+</option>
//                   </select>
//               </div>
              
//               <div class="form-group">
//                   <label>Gêneros:</label>
//                   <div class="multiselect-container" id="multiselect-genre">
//                       <div class="multiselect-tags" id="genre-tags"></div>
//                       <div class="multiselect-dropdown hidden" id="genre-dropdown">
//                           ${genres.map(g => `<span class="multiselect-option" data-value="${g}">${g}</span>`).join('')}
//                       </div>
//                   </div>
//               </div>

//               <div class="form-group">
//                   <label>Categorias:</label>
//                   <div class="multiselect-container" id="multiselect-category">
//                       <div class="multiselect-tags" id="category-tags"></div>
//                       <div class="multiselect-dropdown hidden" id="category-dropdown">
//                           ${categories.map(c => `<span class="multiselect-option" data-value="${c}">${c}</span>`).join('')}
//                       </div>
//                   </div>
//               </div>
              
//               <div class="form-buttons">
//                   <button type="button" class="clear-btn">Limpar</button>
//                   <button type="submit" class="submit-btn">Adicionar</button>
//               </div>
//           </form>
//       </div>
//   `;

//   document.body.appendChild(overlay);
//   document.body.appendChild(modal);

//   const closeModalBtn = modal.querySelector('.close-modal-btn');
//   closeModalBtn.addEventListener('click', () => {
//     document.body.removeChild(modal);
//     document.body.removeChild(overlay);
//   });

//   overlay.addEventListener('click', (e) => {
//     if (e.target === overlay) {
//       document.body.removeChild(modal);
//       document.body.removeChild(overlay);
//     }
//   });

//   function setupMultiselect(containerId) {
//     const container = document.getElementById(containerId);
//     const tagsDiv = container.querySelector('.multiselect-tags');
//     const dropdown = container.querySelector('.multiselect-dropdown');
//     let selectedValues = [];

//     const renderTags = () => {
//       tagsDiv.innerHTML = '';
//       if (selectedValues.length === 0) {
//         tagsDiv.textContent = "Clique para adicionar...";
//         tagsDiv.classList.add('placeholder');
//       } else {
//         tagsDiv.classList.remove('placeholder');
//         selectedValues.forEach(value => {
//           const tag = document.createElement('span');
//           tag.classList.add('multiselect-tag');
//           tag.textContent = value;
//           const closeBtn = document.createElement('span');
//           closeBtn.classList.add('tag-close');
//           closeBtn.innerHTML = '&times;';
//           closeBtn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             selectedValues = selectedValues.filter(v => v !== value);
//             renderTags();
//             updateDropdown(); // Atualiza o dropdown ao remover uma tag
//           });
//           tag.appendChild(closeBtn);
//           tagsDiv.appendChild(tag);
//         });
//       }
//     };

//     const updateDropdown = () => {
//       const options = dropdown.querySelectorAll('.multiselect-option');
//       options.forEach(option => {
//         if (selectedValues.includes(option.dataset.value)) {
//           option.classList.add('selected');
//         } else {
//           option.classList.remove('selected');
//         }
//       });
//     };

//     tagsDiv.addEventListener('click', () => {
//       dropdown.classList.toggle('hidden');
//     });

//     dropdown.addEventListener('click', (e) => {
//       const option = e.target.closest('.multiselect-option');
//       if (!option || option.classList.contains('selected')) return;
      
//       const value = option.dataset.value;
//       if (!selectedValues.includes(value)) {
//         selectedValues.push(value);
//         renderTags();
//         updateDropdown(); // Atualiza o dropdown ao adicionar uma tag
//       }
//       dropdown.classList.add('hidden');
//     });

//     const reset = () => {
//         selectedValues = [];
//         renderTags();
//         updateDropdown(); // Atualiza o dropdown ao resetar
//     };

//     renderTags();
//     updateDropdown(); // Atualiza o dropdown no estado inicial

//     return {
//         getValues: () => selectedValues,
//         reset: reset
//     };
//   }
  
//   const multiselectGenre = setupMultiselect('multiselect-genre');
//   const multiselectCategory = setupMultiselect('multiselect-category');

//   const addGameForm = modal.querySelector('#add-game-form');
//   addGameForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const selectedGenres = multiselectGenre.getValues();
//     const selectedCategories = multiselectCategory.getValues();

//     console.log('Dados do jogo a serem enviados:', {
//       name: addGameForm.Nome_jogo.value,
//       description: addGameForm.Descricao_jogo.value,
//       price: addGameForm.Preco_jogo.value,
//       logo: addGameForm.Logo_jogo.value,
//       cover: addGameForm.Capa_jogo.value,
//       media: addGameForm.Midias_jogo.value.split(',').map(url => url.trim()),
//       rating: addGameForm.Faixa_etaria.value,
//       genre: selectedGenres,
//       category: selectedCategories
//     });

//     alert('Jogo adicionado com sucesso! (Simulação)');
//     document.body.removeChild(modal);
//     document.body.removeChild(overlay);
//   });
  
//   const clearButton = modal.querySelector('.clear-btn');
//   clearButton.addEventListener('click', () => {
//       addGameForm.reset();
//       multiselectGenre.reset();
//       multiselectCategory.reset();
//   });
// }

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
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');

  const modal = document.createElement('div');
  modal.classList.add('add-game-modal');

  const genres = ["Ação", "Aventura", "Casual", "Corrida", "Esportes", "Estratégia", "Indie", "Luta", "Musical", "Narrativo", "Plataforma", "Puzzle", "RPG", "Simulação", "Sobrevivência", "Terror", "Tiro"];
  const categories = ["Singleplayer", "Multiplayer Local", "Multiplayer Online", "Co-op", "PvP", "PvE", "MMO", "Cross-Plataform", "2D", "3D", "2.5D", "Top-Down", "Side-Scrooling", "Isométrico", "Primeira Pessoa", "Terceira Pessoa", "Linear", "Mundo Aberto", "Sandbox", "Campanha", "Missões/Fases", "Permadeath", "Rouguelike"];

  modal.innerHTML = `
      <div class="modal-content">
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
                  <label for="Midias_jogo">Imagens/Vídeos (URLs, separadas por vírgula):</label>
                  <textarea id="Midias_jogo" name="Midias_jogo"></textarea>
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
                          ${genres.map(g => `<span class="multiselect-option" data-value="${g}">${g}</span>`).join('')}
                      </div>
                  </div>
              </div>

              <div class="form-group">
                  <label>Categorias:</label>
                  <div class="multiselect-container" id="multiselect-category">
                      <div class="multiselect-tags" id="category-tags"></div>
                      <div class="multiselect-dropdown hidden" id="category-dropdown">
                          ${categories.map(c => `<span class="multiselect-option" data-value="${c}">${c}</span>`).join('')}
                      </div>
                  </div>
              </div>
              
              <div class="form-buttons">
                  <button type="button" class="clear-btn">Limpar</button>
                  <button type="submit" class="submit-btn">Adicionar</button>
              </div>
          </form>
      </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  const closeModalBtn = modal.querySelector('.close-modal-btn');
  closeModalBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
    document.body.removeChild(overlay);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    }
  });

  function setupMultiselect(containerId) {
    const container = document.getElementById(containerId);
    const tagsDiv = container.querySelector('.multiselect-tags');
    const dropdown = container.querySelector('.multiselect-dropdown');
    let selectedValues = [];

    const renderTags = () => {
      tagsDiv.innerHTML = '';
      if (selectedValues.length === 0) {
        tagsDiv.textContent = "Clique para adicionar...";
        tagsDiv.classList.add('placeholder');
      } else {
        tagsDiv.classList.remove('placeholder');
        selectedValues.forEach(value => {
          const tag = document.createElement('span');
          tag.classList.add('multiselect-tag');
          tag.textContent = value;
          const closeBtn = document.createElement('span');
          closeBtn.classList.add('tag-close');
          closeBtn.innerHTML = '&times;';
          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedValues = selectedValues.filter(v => v !== value);
            renderTags();
            updateDropdown();
          });
          tag.appendChild(closeBtn);
          tagsDiv.appendChild(tag);
        });
      }
    };

    const updateDropdown = () => {
      const options = dropdown.querySelectorAll('.multiselect-option');
      options.forEach(option => {
        if (selectedValues.includes(option.dataset.value)) {
          option.classList.add('selected');
        } else {
          option.classList.remove('selected');
        }
      });
    };

    tagsDiv.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
    });

    dropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.multiselect-option');
      if (!option || option.classList.contains('selected')) return;
      
      const value = option.dataset.value;
      if (!selectedValues.includes(value)) {
        selectedValues.push(value);
        renderTags();
        updateDropdown();
      }
      dropdown.classList.add('hidden');
    });

    const reset = () => {
        selectedValues = [];
        renderTags();
        updateDropdown();
    };

    renderTags();
    updateDropdown();

    return {
        getValues: () => selectedValues,
        reset: reset
    };
  }
  
  const multiselectGenre = setupMultiselect('multiselect-genre');
  const multiselectCategory = setupMultiselect('multiselect-category');

  const addGameForm = modal.querySelector('#add-game-form');
  
  // *** AQUI É O TRECHO PRINCIPAL QUE FOI MODIFICADO PARA ENVIAR OS DADOS ***
  addGameForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Cria um objeto com os dados do formulário
    const gameData = {
      Nome_jogo: addGameForm.Nome_jogo.value,
      Descricao_jogo: addGameForm.Descricao_jogo.value,
      Preco_jogo: parseFloat(addGameForm.Preco_jogo.value), // Converte para número
      Logo_jogo: addGameForm.Logo_jogo.value,
      Capa_jogo: addGameForm.Capa_jogo.value,
      Midias_jogo: addGameForm.Midias_jogo.value,
      Faixa_etaria: addGameForm.Faixa_etaria.value,
      // ID_categoria: addGameForm.ID_categoria.value,
      // ID_genero: addGameForm.ID_genero.value,
    };

    try {
      // Envia os dados para a sua API usando a rota '/adicionar-jogo'
      const response = await fetch('http://localhost:3000/adicionar-jogo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      const result = await response.text();

      if (response.ok) {
        alert(result);
        addGameForm.reset();
        multiselectGenre.reset();
        multiselectCategory.reset();
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
      } else {
        alert('Erro ao adicionar jogo: ' + result);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Ocorreu um erro ao conectar com o servidor.');
    }
  });
  
  const clearButton = modal.querySelector('.clear-btn');
  clearButton.addEventListener('click', () => {
    addGameForm.reset();
    multiselectGenre.reset();
    multiselectCategory.reset();
  });
}