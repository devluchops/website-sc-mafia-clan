import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Solo permite login de usuarios autorizados
      const allowedUsers = process.env.DISCORD_ALLOWED_USERS?.split(",") || [];
      if (allowedUsers.length === 0) return true;

      // Permitir por Discord username#discriminator o por ID
      const discordTag = profile.username + "#" + profile.discriminator;
      const discordId = profile.id;

      return allowedUsers.includes(user.email) ||
             allowedUsers.includes(discordTag) ||
             allowedUsers.includes(discordId);
    },
  },
  pages: {
    signIn: "/admin/login",
  },
};
