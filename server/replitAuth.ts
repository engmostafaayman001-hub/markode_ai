import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

// ===========================
// جلسات Express مع PostgreSQL
// ===========================
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 أسبوع
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // ينشئ الجدول إذا لم يكن موجود
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "أي_سلسلة_عشوائية_لتأمين_جلسات_Express",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// ===========================
// دالة setupAuth فارغة
// ===========================
export async function setupAuth(app: Express) {
  app.use(getSession());
  console.log("Replit OAuth disabled – استخدام dummy setup فقط");
}

// ===========================
// دالة isAuthenticated وهمية
// ===========================
export const isAuthenticated: RequestHandler = (req, res, next) => {
  // ببساطة اعتبر جميع المستخدمين مصرح لهم مؤقتًا
  return next();
};
