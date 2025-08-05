import { Clerk } from "@clerk/clerk-js"
import { dark } from '@clerk/themes'
import { ptBR } from '@clerk/localizations'

const clerkPubKey = "pk_test_d29ydGh5LWhhbGlidXQtNjUuY2xlcmsuYWNjb3VudHMuZGV2JA"

const clerk = new Clerk(clerkPubKey)
await clerk.load({
  signInUrl: '../front-end/login.html' ,
  localization: ptBR,
  appearance: {
    baseTheme: dark,
  }
})

const signUpDiv = document.getElementById('sign-up')

clerk.mountSignUp(signUpDiv, {
  forceRedirectUrl: '/login.html'  
})