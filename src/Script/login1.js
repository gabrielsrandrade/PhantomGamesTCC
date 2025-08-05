import { Clerk } from "@clerk/clerk-js"
import { dark } from '@clerk/themes'
import { ptBR } from '@clerk/localizations'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load({
  signUpUrl: '../front-end/cadastro.html' ,
  localization: ptBR,
  appearance: {
    baseTheme: dark,
  }
})

const signInDiv = document.getElementById('sign-in')

clerk.mountSignIn(signInDiv)
