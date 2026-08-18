const { Server } = require("socket.io");
const { env } = require("../config");
const { STAFF_ROLES } = require("../constants");
const { verifyAccessToken } = require("./token.service");
const User = require("../models/User.model");

const ADMIN_ROOM = "admins";

/** @type {import("socket.io").Server | null} */
let io = null;

const getTokenFromHandshake = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return String(authToken);

  const header = socket.handshake.headers?.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);

  return null;
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromHandshake(socket);
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).select("-password");

      if (!user || !user.isActive) {
        return next(new Error("Unauthorized"));
      }

      if (!STAFF_ROLES.includes(user.role)) {
        return next(new Error("Forbidden"));
      }

      socket.data.user = {
        id: String(user._id),
        role: user.role,
        email: user.email,
      };
      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(ADMIN_ROOM);
  });

  return io;
};

const getIO = () => io;

const emitToAdmins = (event, payload) => {
  if (!io) return;
  io.to(ADMIN_ROOM).emit(event, payload);
};

module.exports = {
  ADMIN_ROOM,
  initSocket,
  getIO,
  emitToAdmins,
};
