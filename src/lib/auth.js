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
      // Log para debug
      console.log("=== Discord Login Info ===");
      console.log("Username:", profile.username);
      console.log("Discord ID:", profile.id);
      console.log("Email:", user.email);
      console.log("========================");

      try {
        const sql = getDb();

        // Actualizar discord_id en authorized_users si existe por username
        await sql`
          UPDATE discord_authorized_users
          SET discord_id = ${profile.id}, updated_at = NOW()
          WHERE discord_username = ${profile.username} AND discord_id IS NULL
        `;

        // Actualizar discord_id en members si existe vinculación por username
        await sql`
          UPDATE members
          SET discord_id = ${profile.id}, updated_at = NOW()
          WHERE name LIKE '%' || ${profile.username} || '%' AND discord_id IS NULL
        `;

        // Verificar si está autorizado
        const authorizedUsers = await sql`
          SELECT * FROM discord_authorized_users
          WHERE discord_id = ${profile.id}
             OR discord_username = ${profile.username}
             OR email = ${user.email}
        `;

        const isAllowed = authorizedUsers.length > 0;
        console.log("Is user allowed?", isAllowed);

        return isAllowed;
      } catch (error) {
        console.error("Error checking authorization:", error);
        return false;
      }
    },

    async jwt({ token, user, account, profile }) {
      // Agregar discord_id al token
      if (profile) {
        token.discordId = profile.id;
        token.discordUsername = profile.username;
      }

      // Si no hay discordId pero hay account, obtenerlo del user
      if (!token.discordId && user?.name) {
        // Intentar obtener del nombre de usuario
        token.discordUsername = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      // Agregar info de Discord a la sesión
      if (token) {
        let discordId = token.discordId;
        let discordUsername = token.discordUsername;

        // Fallback: si no hay discordId en el token, intentar buscarlo en la BD
        if (!discordId) {
          try {
            const sql = getDb();
            const users = await sql`
              SELECT discord_id, discord_username
              FROM discord_authorized_users
              WHERE discord_username = ${session.user.name}
                 OR email = ${session.user.email}
              LIMIT 1
            `;
            if (users.length > 0) {
              discordId = users[0].discord_id;
              discordUsername = users[0].discord_username;
            }
          } catch (error) {
            console.error("Error fetching discord_id:", error);
          }
        }

        session.user.discordId = discordId;
        session.user.discordUsername = discordUsername;

        // Obtener permisos del usuario
        try {
          const sql = getDb();
          const permissions = await sql`
            SELECT * FROM user_permissions WHERE discord_id = ${discordId}
          `;
          session.user.permissions = permissions[0] || {
            is_admin: false,
            can_publish_blog: false,
            can_publish_videos: false,
            can_publish_events: false,
            can_edit_rules: false,
            can_manage_members: false,
            can_manage_permissions: false,
          };
        } catch (error) {
          console.error("Error loading permissions:", error);
          session.user.permissions = { is_admin: false };
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
