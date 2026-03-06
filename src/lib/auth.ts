import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM || "shaked@shakedol.org",
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { error } = await getResend().emails.send({
          from: provider.from,
          to: email,
          subject: "התחברות לאתר שקדול - השפה החדשה שלנו",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">שלום!</h2>
              <p>לחץ על הכפתור למטה כדי להתחבר:</p>
              <a href="${url}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
                התחבר עכשיו
              </a>
              <p style="color: #666; font-size: 14px;">אם לא ביקשת להתחבר, אפשר להתעלם מהמייל הזה.</p>
            </div>
          `,
        });
        if (error) {
          throw new Error(`Failed to send email: ${error.message}`);
        }

        // Log email for cost tracking (Resend: ~$1 per 1000 emails after free tier)
        await prisma.emailLog.create({
          data: {
            to: email,
            subject: "התחברות לאתר שקדול - השפה החדשה שלנו",
            type: "magic_link",
            estimatedCost: 0.001, // ~$1/1000 emails
          },
        }).catch(() => {}); // Don't fail auth if logging fails
      },
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
          select: { role: true, status: true, fullName: true, firstName: true, serialNumber: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.fullName = dbUser.fullName;
          token.firstName = dbUser.firstName;
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
    newUser: "/auth/complete-profile",
  },
};
