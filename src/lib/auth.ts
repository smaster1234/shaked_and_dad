import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || "noreply@shakdol.com",
    }),
    // Credentials provider for development/testing
    CredentialsProvider({
      id: "credentials",
      name: "Development Login",
      credentials: {
        email: { label: "אימייל", type: "email" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV !== "development") return null;
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, status: true, fullName: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.fullName = dbUser.fullName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).status = token.status;
        (session.user as Record<string, unknown>).fullName = token.fullName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/register",
  },
};
