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

        // Verificar si está en discord_authorized_users
        const authorizedUsers = await sql`
          SELECT * FROM discord_authorized_users
          WHERE discord_id = ${profile.id}
             OR discord_username = ${profile.username}
             OR email = ${user.email}
        `;

        // Verificar si es un miembro del clan (tiene social_discord configurado)
        const members = await sql`
          SELECT * FROM members
          WHERE social_discord = ${profile.username}
        `;

        const isMember = members.length > 0;
        const isAuthorizedUser = authorizedUsers.length > 0;

        console.log("Is member?", isMember);
        console.log("Is authorized user?", isAuthorizedUser);

        // Si es miembro pero no está en authorized_users, agregarlo automáticamente
        if (isMember && !isAuthorizedUser) {
          console.log("Creating authorized user for member:", profile.username);
          await sql`
            INSERT INTO discord_authorized_users (discord_id, discord_username, email)
            VALUES (${profile.id}, ${profile.username}, ${user.email})
          `;
        }

        // Actualizar discord_id y last_login_at en members si hay match
        if (isMember) {
          await sql`
            UPDATE members
            SET discord_id = ${profile.id}, last_login_at = NOW(), updated_at = NOW()
            WHERE social_discord = ${profile.username}
          `;
        }

        // Permitir acceso si es miembro O usuario autorizado
        const isAllowed = isMember || isAuthorizedUser;
        console.log("Access allowed?", isAllowed);

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

        // Sincronizar discord_id en la tabla members si hay un match por social_discord
        if (discordId && discordUsername) {
          try {
            const sql = getDb();
            await sql`
              UPDATE members
              SET discord_id = ${discordId}
              WHERE social_discord = ${discordUsername}
                AND (discord_id IS NULL OR discord_id != ${discordId})
            `;
          } catch (error) {
            console.error("Error syncing discord_id to members:", error);
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

        // Verificar estado de email verification
        try {
          const sql = getDb();
          const [member] = await sql`
            SELECT email, email_verified FROM members
            WHERE discord_id = ${discordId}
          `;
          session.user.email = member?.email || null;
          session.user.emailVerified = member?.email_verified || false;
        } catch (error) {
          console.error("Error loading email verification status:", error);
          session.user.emailVerified = false;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
