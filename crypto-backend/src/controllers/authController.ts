import { PrismaClient } from '../../node_modules/.prisma/client/default';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {Request, Response} from 'express'

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, birthDate, dni, email, password } = req.body;

  try {
 
    if (!firstName || !lastName || !dni || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de correo electrónico inválido' });
    }

    if (isNaN(Date.parse(birthDate)) || new Date(birthDate) > new Date()) {
      return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        dni,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Usuario registrado con éxito', userId: newUser.id });
  } catch (error: any) {
    console.error('Error en el registro:', error);

    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  // Validar el formato del email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'El formato del email no es válido' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ token });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};