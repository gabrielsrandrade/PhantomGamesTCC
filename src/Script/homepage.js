import { Clerk } from '@clerk/clerk-js'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

const user = clerk.user

if (clerk.isSignedIn && user) {
    const userEmail = user.primaryEmailAddress?.emailAddress

    if (userEmail === "phantomgamestcc@gmail.com") {
        
    } else {
       
    }

} else {
    document.addEventListener('DOMContentLoaded', function() {
        const navbar = document.querySelector('.navbar');

        const conteudoHTML = `
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
        `;
        
        navbar.innerHTML = conteudoHTML;
      });
}