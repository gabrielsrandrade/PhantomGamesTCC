import { Clerk } from '@clerk/clerk-js';

async function initNavbar() {
  try {
    const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

    const clerk = new Clerk(clerkPubKey);
    await clerk.load();

    const user = clerk.user;
    const navbar = document.querySelector('.navbar');

    if (clerk.isSignedIn && user) {

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
          <a href="logout.html"><button>Adicionar Jogo</button></a>
          <div id="user-button"></div>
        </div>
        `;
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
          <div id="user-button"></div>
        `;
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
  } catch (error) {
    console.error('Erro ao inicializar Clerk ou navbar:', error);
  }
}

document.addEventListener('DOMContentLoaded', initNavbar);