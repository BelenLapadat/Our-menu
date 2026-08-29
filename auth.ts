import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { assertAuthEnv } from "@/lib/env";
import { findOrCreateUser } from "@/lib/users";

assertAuthEnv();

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email_verified === false) {
        return false;
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        const googleSub =
          (profile?.sub as string | undefined) ?? account.providerAccountId;

        if (googleSub) {
          const user = await findOrCreateUser({
            googleSub,
            email: (profile?.email as string | undefined) ?? "",
            name: (profile?.name as string | undefined) ?? "",
            image: (profile?.picture as string | undefined) ?? null,
          });
          token.userId = user.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }

      return session;
    },
  },
});
