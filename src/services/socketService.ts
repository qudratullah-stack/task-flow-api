import { Server, Socket } from "socket.io";

/**
 * @description: Advanced Socket Manager to handle real-time communication
 */
export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`⚡ User Connected: ${socket.id}`);

    socket.on("join_workspace", (workspaceId: string) => {
      socket.join(workspaceId);
      console.log(`👥 User ${socket.id} joined workspace: ${workspaceId}`);
    });

    // 2. Leave Workspace Room
    socket.on("leave_workspace", (workspaceId: string) => {
      socket.leave(workspaceId);
      console.log(`🏃 User ${socket.id} left workspace: ${workspaceId}`);
    });

    // 3. Handle Disconnection
    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });
};

/**
 * @description: Global Helper to emit events from anywhere in the app
 */
export const emitToWorkspace = (io: Server, workspaceId: string, eventName: string, data: any) => {
  io.to(workspaceId).emit(eventName, data);
};