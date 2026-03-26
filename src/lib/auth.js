import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Solo permite login del dueño del repo
      const allowedUsers = process.env.GITHUB_ALLOWED_USERS?.split(",") || [];
      if (allowedUsers.length === 0) return true;
      return allowedUsers.includes(user.email) || allowedUsers.includes(profile.login);
    },
  },
  pages: {
    signIn: "/admin/login",
  },
};
