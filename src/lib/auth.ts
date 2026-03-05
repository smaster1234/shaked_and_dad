import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || "shaked@shakedol.org",
    }),
    // Credentials provider for admin login with password
    CredentialsProvider({
      id: "credentials",
      name: "כניסה עם סיסמה",
      credentials: {
        email: { label: "אימייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
        };
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
          select: { role: true, status: true, fullName: true, serialNumber: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.fullName = dbUser.fullName;
          token.serialNumber = dbUser.serialNumber;
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
        (session.user as Record<string, unknown>).serialNumber = token.serialNumber;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/register",
  },
};
