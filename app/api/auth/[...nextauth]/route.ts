import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { User } from '@/lib/types';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;

      const email = user.email!;
      const googleId = account.providerAccountId;

      const users = await readJSONAsync<User>('users.json');
      const existing = users.find(u => u.email === email);

      if (existing) {
        // User sudah ada — pastikan googleId tersimpan
        if (!existing.googleId) {
          const idx = users.findIndex(u => u.email === email);
          users[idx].googleId = googleId;
          users[idx].provider = 'google';
          await writeJSONAsync('users.json', users);
        }
      }
      // Selalu allow sign in — needsProfile ditentukan di jwt callback
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Saat pertama kali login Google
      if (account?.provider === 'google' && user) {
        const email = user.email!;
        const googleId = account.providerAccountId;

        const users = await readJSONAsync<User>('users.json');
        const existing = users.find(u => u.email === email);

        if (existing) {
          token.userId = existing.id;
          token.email = existing.email;
          token.name = existing.name;
          token.needsProfile = false;
          token.fromGoogle = true; // marker: ini dari Google OAuth
        } else {
          token.googleId = googleId;
          token.email = email;
          token.name = user.name ?? '';
          token.picture = user.image ?? '';
          token.needsProfile = true;
          token.fromGoogle = true;
        }
      }

      // Saat trigger 'update' — dipanggil setelah complete-profile berhasil
      if (trigger === 'update' && token.email) {
        const users = await readJSONAsync<User>('users.json');
        const existing = users.find(u => u.email === token.email as string);
        if (existing) {
          token.userId = existing.id;
          token.name = existing.name;
          token.needsProfile = false;
          token.googleId = undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any) = {
        ...session.user,
        id: token.userId as string,
        needsProfile: (token.needsProfile as boolean) ?? false,
        googleId: token.googleId as string,
        fromGoogle: (token.fromGoogle as boolean) ?? false,
      };
      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
});

export { handler as GET, handler as POST };
