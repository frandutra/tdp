import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import cryptoRoutes from './routes/cryptoRoutes';
import { verifyToken } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';
import './jobs/alertChecker';

const app = express();
const prisma = new PrismaClient();


app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));

app.use(express.json());

app.use('/auth', authRoutes);

app.use('/api', verifyToken, cryptoRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app._router.stack.forEach(function(r: any){
    if (r.route && r.route.path){
        console.log(r.route.path)
    }
});