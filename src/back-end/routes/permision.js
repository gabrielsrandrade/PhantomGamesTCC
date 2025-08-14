import { Clerk } from '@clerk/clerk-js'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

const user = clerk.user;

// async function setAndCheckRole() {
//     if (!user) {
//         // Se o usuário não está logado, redirecione para o login
//         window.location.href = "/src/front-end/login.html"
//         return
//     }

//     // Chama o back-end para setar a role se ela ainda não existir
//     if (!user.publicMetadata.role) {
//         // A 'role' será setada aqui, mas no seu back-end!
//         await fetch('/api/set-role', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 userId: user.id,
//                 userEmail: user.primaryEmailAddress.emailAddress
//             })
//         })

//         // Recarrega os dados do usuário para pegar a role nova
//         await user.reload()
//     }

    if (clerk.user === 'admin') {
        console.log("Usuário é admin")
        window.location.href = "/src/front-end/homepage.html"
    } else {
        console.log("Usuário é membro")
        window.location.href = "/src/front-end/navegar.html"
    }
// }