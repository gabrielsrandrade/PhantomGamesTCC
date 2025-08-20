import { Clerk } from '@clerk/clerk-js'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

const userbuttonDiv = document.getElementById('user-button')

clerk.mountUserButton(userbuttonDiv)

console.log(userbuttonDiv)