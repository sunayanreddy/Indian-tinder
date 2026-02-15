import cors from 'cors';
import express from 'express';
import setRoutes from './routes/index';
import { connectMongo } from './db/mongo';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setRoutes(app);

const start = async (): Promise<void> => {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

start().catch(error => {
  console.error('Failed to start server', error);
  process.exit(1);
});
