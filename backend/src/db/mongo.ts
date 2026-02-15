import mongoose from 'mongoose';

let connected = false;

export const connectMongo = async (): Promise<void> => {
  if (connected) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(uri);
  connected = true;
};
