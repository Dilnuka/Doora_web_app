import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.roomId = user.roomId
        token.roomCode = user.roomCode
      } else if (token.id && !token.roomId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { roomId: true, role: true, room: { select: { code: true } } },
        })
        if (dbUser) {
          token.roomId = dbUser.roomId
          token.role = dbUser.role
          token.roomCode = dbUser.room?.code ?? null
        }
      }
      return token
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Login attempt for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            room: true
          }
        })

        if (!user) {
          console.log("User not found in DB");
          return null
        }
        
        if (!user.password) {
          console.log("User has no password set");
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log("Is password valid?", isPasswordValid);

        if (!isPasswordValid) {
          return null
        }

        console.log("Login successful!");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          roomId: user.roomId,
          roomCode: user.room?.code || null,
        }
      }
    })
  ]
})
