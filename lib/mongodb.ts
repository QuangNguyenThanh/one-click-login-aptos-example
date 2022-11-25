import { Schema, model, connect, models, Model } from "mongoose";

const uri =
  "mongodb+srv://admin:nvQshcfIyK1ljTj4@cluster0.jtntftf.mongodb.net/aptos-example?retryWrites=true&w=majority";

let mongoClient: typeof import("mongoose") | null = null;

export async function connectToDatabase() {
  try {
    if (mongoClient) {
      return mongoClient;
    }
    mongoClient = await connect(uri);
    console.log("Mongoose connected!");
    return mongoClient;
  } catch (e) {
    console.error(e);
  }
}

export interface IUser {
  name?: string;
  email?: string;
  avatar?: string;
  address: string;
  nonce: number;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: false },
  email: { type: String, required: false },
  avatar: { type: String, required: false },
  address: { type: String, required: true },
  nonce: { type: Number, required: true },
});

export const User: Model<IUser> =
  models.User || model<IUser>("User", userSchema);
