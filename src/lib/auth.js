import DiscordProvider from "next-auth/providers/discord";
import { getDb } from "@/lib/db";

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

      try {
        // Verificar contra la base de datos
        const sql = getDb();
        const authorizedUsers = await sql`
          SELECT * FROM discord_authorized_users
          WHERE discord_id = ${profile.id}
             OR discord_username = ${profile.username}
             OR email = ${user.email}
        `;

        const isAllowed = authorizedUsers.length > 0;
        console.log("Is user allowed (from DB)?", isAllowed);

        return isAllowed;
      } catch (error) {
        console.error("Error checking authorization:", error);
        // Fallback a variable de entorno si hay error
        const allowedUsers = process.env.DISCORD_ALLOWED_USERS?.split(",").map(u => u.trim()) || [];

        if (allowedUsers.length === 0) {
          return false; // Por seguridad, denegar si no hay configuración
        }

        const isAllowed = allowedUsers.includes(user.email) ||
                         allowedUsers.includes(profile.username) ||
                         allowedUsers.includes(profile.id);

        console.log("Is user allowed (from env fallback)?", isAllowed);
        return isAllowed;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};
