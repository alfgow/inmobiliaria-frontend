const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientInstance;
};

const logOptions: string[] =
  process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'];

type PrismaClientConstructor = new (...args: unknown[]) => PrismaClientInstance;
type PrismaClientInstance = Record<string, unknown>;

let prismaInstance: PrismaClientInstance | undefined;
let PrismaClientCtor: PrismaClientConstructor | undefined;

const loadPrismaClient = (): PrismaClientConstructor => {
  if (PrismaClientCtor) {
    return PrismaClientCtor;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const { PrismaClient } = require('@prisma/client') as {
      PrismaClient: PrismaClientConstructor;
    };

    PrismaClientCtor = PrismaClient;
    return PrismaClientCtor;
  } catch (error) {
    const installCommand = 'npm install @prisma/client prisma';
    const generateCommand = 'npx prisma generate';

    const message =
      `No se pudo cargar "@prisma/client". Ejecuta "${installCommand}" ` +
      `y después "${generateCommand}" para generar el cliente de Prisma.`;

    if (process.env.NODE_ENV !== 'production') {
      console.warn(message, error);
    }

    throw new Error(message);
  }
};

const createPrismaClient = (): PrismaClientInstance => {
  const PrismaClient = loadPrismaClient();

  return new PrismaClient({
    log: logOptions,
  });
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
