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
      // Log para debug - ver información del usuario
      console.log("=== Discord Login Info ===");
      console.log("Username:", profile.username);
      console.log("Discord ID:", profile.id);
      console.log("Email:", user.email);
      console.log("Global Name:", profile.global_name);
      console.log("========================");

      // Solo permite login de usuarios autorizados
      const allowedUsers = process.env.DISCORD_ALLOWED_USERS?.split(",").map(u => u.trim()) || [];
      console.log("Allowed users:", allowedUsers);

      if (allowedUsers.length === 0) {
        console.log("No restrictions - allowing all users");
        return true;
      }

      // Permitir por Discord username (sin discriminador), ID o email
      const discordId = profile.id;
      const username = profile.username;

      const isAllowed = allowedUsers.includes(user.email) ||
                       allowedUsers.includes(username) ||
                       allowedUsers.includes(discordId);

      console.log("Is user allowed?", isAllowed);
      return isAllowed;
    },
  },
  pages: {
    signIn: "/login",
  },
};
