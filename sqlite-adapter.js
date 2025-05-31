import db from "./db.js";

export const customSQLiteAdapter = () => {
  return {
    async getSessionAndUser(sessionId) {
      const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
      if (!session) return [null, null];

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user_id);
      if (!user) return [null, null];

      return [
        {
          id: session.id,
          userId: session.user_id,
          expiresAt: new Date(session.expires_at),
        },
        {
          id: user.id,
          attributes: {
            username: user.username,
          },
        }
      ];
    },

    async getUser(userId) {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) return null;

      return {
        id: user.id,
        attributes: {
          username: user.username,
        }
      };
    },

    async setUser(user) {
      db.prepare("INSERT INTO users (id, username) VALUES (?, ?)").run(
        user.id,
        user.attributes.username
      );
    },

    async setSession(session) {
      db.prepare(
        "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
      ).run(session.id, session.userId, session.expiresAt.getTime());
    },

    async updateSessionExpiration(sessionId, expiresAt) {
      db.prepare("UPDATE sessions SET expires_at = ? WHERE id = ?").run(
        expiresAt.getTime(),
        sessionId
      );
    },

    async deleteSession(sessionId) {
      db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    },

    async deleteUserSessions(userId) {
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
    }
  };
};
