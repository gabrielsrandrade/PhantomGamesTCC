import { Clerk } from '@clerk/clerk-js'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

const user = clerk.user

if (clerk.isSignedIn && user) {
    const userEmail = user.primaryEmailAddress?.emailAddress

    if (userEmail === "phantomgamestcc@gmail.com") {
        window.location.href = "/src/front-end/homepage.html"
    } else {
        window.location.href = "/src/front-end/navegar.html"
    }

} else {
    window.location.href = "/src/front-end/homepage.html"
}