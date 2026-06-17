import { Prisma, PrismaClient } from '@prisma/client';

type PrismaClientConstructor = typeof PrismaClient;
type PrismaClientInstance = InstanceType<PrismaClientConstructor>;

const validateDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      'Falta DATABASE_URL. Define una URL PostgreSQL válida, por ejemplo postgresql://user:password@host:5433/database?schema=public.'
    );
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error(
      'DATABASE_URL debe empezar con postgresql:// o postgres://. El esquema actual de Prisma está configurado para PostgreSQL.'
    );
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientInstance;
};

const logOptions: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'];

let prismaInstance: PrismaClientInstance | undefined;

const createPrismaClient = (): PrismaClientInstance => {
  try {
    validateDatabaseUrl();

    return new PrismaClient({
      log: logOptions,
    });
  } catch (error) {
    const installCommand = 'npm install @prisma/client prisma';
    const generateCommand = 'npx prisma generate';
    const causeMessage = error instanceof Error ? error.message : String(error);

    const message =
      `No se pudo crear una instancia de PrismaClient. Ejecuta "${installCommand}" ` +
      `y después "${generateCommand}" para generar el cliente de Prisma. Causa: ${causeMessage}`;

    if (process.env.NODE_ENV !== 'production') {
      console.warn(message, error);
    }

    throw new Error(message, { cause: error instanceof Error ? error : undefined });
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
