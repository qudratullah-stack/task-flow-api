import mongoose, { Document, Schema, Types } from "mongoose";

export enum WorkspaceRole {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId; 
  members: {
    user: Types.ObjectId;
    role: WorkspaceRole;
    joinedAt: Date;
  }[];
  inviteCode: string;
  isActive: boolean;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      maxlength: [50, "Workspace name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "SaasUser", 
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "SaasUser",
          required: true,
        },
        role: {
          type: String,
          enum: Object.values(WorkspaceRole),
          default: WorkspaceRole.VIEWER,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    inviteCode: {
      type: String,
      unique: true,
      index: true, 
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

WorkspaceSchema.pre("save", async function () {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
});

export const Workspace = mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);