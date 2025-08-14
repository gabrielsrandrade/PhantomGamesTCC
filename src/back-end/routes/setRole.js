// import express from 'express'
// import { Clerk } from '@clerk/clerk-sdk-node'

// const clerkClient = new Clerk({
//     secretKey: process.env.CLERK_SECRET_KEY
// })

// const app = express()
// app.use(express.json())

// app.post('/api/set-role', async (req, res) => {
//     const { userId, userEmail } = req.body

//     const role = (userEmail === "phantomgames@gmail.com") ? "admin" : "membro"

//     try {
//         await clerkClient.users.updateUser(userId, {
//             publicMetadata: { role }
//         })
//         res.status(200).send({ message: 'Role setada com sucesso' })
//     } catch (error) {
//         res.status(500).send({ error: 'Erro ao setar a role' })
//     }
// })
