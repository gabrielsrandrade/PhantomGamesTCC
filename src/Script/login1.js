import { Clerk } from "@clerk/clerk-js"
import { dark } from '@clerk/themes'
import { ptBR } from '@clerk/localizations'

const clerkPubKey = "pk_test_d29ydGh5LWhhbGlidXQtNjUuY2xlcmsuYWNjb3VudHMuZGV2JA"

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
