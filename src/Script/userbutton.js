import { Clerk } from '@clerk/clerk-js'
import { dark } from '@clerk/themes'
import { ptBR } from '@clerk/localizations'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load({
    signInUrl: '../front-end/login.html' ,
    localization: ptBR,
    appearance: {
      baseTheme: dark,
    }
  })

const userbuttonDiv = document.getElementById('user-button')

clerk.mountUserButton(userbuttonDiv)