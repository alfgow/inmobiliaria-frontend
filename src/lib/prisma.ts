import { PrismaClient } from '@prisma/client';

type PrismaClientConstructor = typeof PrismaClient;
type PrismaClientInstance = InstanceType<PrismaClientConstructor>;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientInstance;
};

const logOptions: string[] =
  process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'];

let prismaInstance: PrismaClientInstance | undefined;

const createPrismaClient = (): PrismaClientInstance => {
  try {
    return new PrismaClient({
      log: logOptions,
    });
  } catch (error) {
    const installCommand = 'npm install @prisma/client prisma';
    const generateCommand = 'npx prisma generate';

    const message =
      `No se pudo crear una instancia de PrismaClient. Ejecuta "${installCommand}" ` +
      `y después "${generateCommand}" para generar el cliente de Prisma.`;

    if (process.env.NODE_ENV !== 'production') {
      console.warn(message, error);
    }

    throw new Error(message);
  }
};

export const getPrismaClient = (): PrismaClientInstance => {
  if (prismaInstance) {
    return prismaInstance;
  }

  prismaInstance = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
};
