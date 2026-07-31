-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dbs14813645";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "dbs14813645"."contactos_estado" AS ENUM ('nuevo', 'en_contacto', 'rejected', 'blocked', 'en_contacto_bot', 'prospectando', 'rechazado', 'bloqueado');

-- CreateEnum
CREATE TYPE "dbs14813645"."inmuebles_operacion" AS ENUM ('Renta', 'Venta');

-- CreateEnum
CREATE TYPE "dbs14813645"."inmuebles_tipo" AS ENUM ('Departamento', 'Casa', 'Oficina', 'Local Comercial', 'Terreno', 'Bodega');

-- CreateEnum
CREATE TYPE "dbs14813645"."restricciones_inmueble_acepta_estudiantes" AS ENUM ('si', 'no');

-- CreateEnum
CREATE TYPE "dbs14813645"."restricciones_inmueble_acepta_mascotas" AS ENUM ('si', 'no', 'solo pequeñas');

-- CreateEnum
CREATE TYPE "dbs14813645"."restricciones_inmueble_acepta_niños" AS ENUM ('si', 'no');

-- CreateEnum
CREATE TYPE "dbs14813645"."restricciones_inmueble_acepta_roomies" AS ENUM ('si', 'no', 'max 2');

-- CreateEnum
CREATE TYPE "public"."contactos_estado" AS ENUM ('nuevo', 'en_contacto', 'rechazado', 'bloqueado');

-- CreateTable
CREATE TABLE "public"."api_keys" (
    "id" BIGSERIAL NOT NULL,
    "user_id" DECIMAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "prefix" VARCHAR(12) NOT NULL,
    "key_hash" VARCHAR(128) NOT NULL,
    "allowed_ip" VARCHAR(45),
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_19222_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asesores" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_19230_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blogs" (
    "id" BIGSERIAL NOT NULL,
    "autor_id" DECIMAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_19238_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."codigos_postales" (
    "id" BIGSERIAL NOT NULL,
    "d_codigo" VARCHAR(5) NOT NULL,
    "d_asenta" VARCHAR(255) NOT NULL,
    "d_tipo_asenta" VARCHAR(100),
    "d_mnpio" VARCHAR(150),
    "d_estado" VARCHAR(150),
    "d_ciudad" VARCHAR(255) NOT NULL,
    "d_cp" VARCHAR(10),
    "c_estado" VARCHAR(5),
    "c_oficina" VARCHAR(10),
    "c_cp" VARCHAR(10),
    "c_tipo_asenta" VARCHAR(5),
    "c_mnpio" VARCHAR(5),
    "id_asenta_cpcons" VARCHAR(20),
    "d_zona" VARCHAR(20),
    "c_cve_ciudad" VARCHAR(10),

    CONSTRAINT "idx_19270_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comentarios" (
    "id" BIGSERIAL NOT NULL,
    "contacto_id" DECIMAL NOT NULL,
    "comentario" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_19289_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacto_conversaciones" (
    "id" BIGSERIAL NOT NULL,
    "contacto_id" BIGINT NOT NULL,
    "wa_id" TEXT NOT NULL,
    "inmueble_id" BIGINT,
    "canal" VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    "estado_bot" TEXT NOT NULL DEFAULT 'activo',
    "iniciada_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_mensaje_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacto_conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacto_mensajes" (
    "id" BIGSERIAL NOT NULL,
    "conversacion_id" BIGINT NOT NULL,
    "message_id" TEXT,
    "rol" VARCHAR(20) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "enviado_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacto_mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contactos" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150),
    "telefono" VARCHAR(20) NOT NULL,
    "estado" "dbs14813645"."contactos_estado" DEFAULT 'nuevo',
    "fuente" VARCHAR(50) DEFAULT 'Web',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_19302_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."error_logs" (
    "id" BIGSERIAL NOT NULL,
    "exception_class" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "file" VARCHAR(512),
    "line" BIGINT,
    "trace" TEXT,
    "status_code" INTEGER,
    "url" TEXT,
    "method" VARCHAR(20),
    "payload" TEXT,
    "headers" TEXT,
    "user_id" DECIMAL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_19311_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inmueble_estatus" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(150),
    "color" VARCHAR(20) DEFAULT '#ffffff',
    "orden" BIGINT DEFAULT 0,

    CONSTRAINT "idx_19352_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inmueble_imagenes" (
    "id" BIGSERIAL NOT NULL,
    "disk" VARCHAR(50) NOT NULL DEFAULT 's3',
    "path" VARCHAR(255),
    "url" VARCHAR(500),
    "metadata" TEXT,
    "inmueble_id" DECIMAL NOT NULL,
    "s3_key" VARCHAR(255) NOT NULL,
    "orden" BIGINT DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_19360_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inmuebles" (
    "id" BIGSERIAL NOT NULL,
    "asesor_id" DECIMAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "precio" DECIMAL(12,2) NOT NULL,
    "direccion" VARCHAR(255) NOT NULL,
    "latitud" DECIMAL(10,6),
    "longitud" DECIMAL(10,6),
    "colonia" VARCHAR(255),
    "municipio" VARCHAR(255),
    "estado" VARCHAR(150),
    "codigo_postal" VARCHAR(10),
    "tipo" "dbs14813645"."inmuebles_tipo" NOT NULL,
    "operacion" "dbs14813645"."inmuebles_operacion" NOT NULL,
    "estatus_id" SMALLINT NOT NULL DEFAULT 1,
    "habitaciones" SMALLINT DEFAULT 0,
    "banos" SMALLINT DEFAULT 0,
    "estacionamientos" SMALLINT DEFAULT 0,
    "metros_cuadrados" DECIMAL(10,2) DEFAULT 0.00,
    "superficie_construida" DECIMAL(10,2) DEFAULT 0.00,
    "superficie_terreno" DECIMAL(10,2) DEFAULT 0.00,
    "anio_construccion" INTEGER,
    "video_url" VARCHAR(255),
    "tour_virtual_url" VARCHAR(255),
    "amenidades" TEXT,
    "extras" TEXT,
    "tags" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "requisitos_restricciones" JSONB NOT NULL DEFAULT '{"requisitos": [], "restricciones": []}',
    "published_at" TIMESTAMPTZ(6),
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "seo_description" TEXT,
    "banos_modalidad" TEXT NOT NULL DEFAULT 'privado',

    CONSTRAINT "idx_19328_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interacciones_ia" (
    "id" BIGSERIAL NOT NULL,
    "contacto_id" DECIMAL NOT NULL,
    "payload" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_19372_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."intereses" (
    "id" BIGSERIAL NOT NULL,
    "contacto_id" DECIMAL NOT NULL,
    "inmueble_id" DECIMAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_19380_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."regina_contextos" (
    "wa_id" TEXT NOT NULL,
    "nombre" TEXT,
    "inmueble_id" INTEGER,
    "status" TEXT DEFAULT 'activo',
    "rechazos_post" INTEGER DEFAULT 0,
    "historial" JSONB DEFAULT '[]',
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "referencia_inmueble_pendiente" TEXT,
    "resumen_contexto" JSONB,
    "resumen_generado_at" TIMESTAMPTZ(6),
    "resumen_version" VARCHAR(30),

    CONSTRAINT "regina_contextos_pkey" PRIMARY KEY ("wa_id")
);

-- CreateTable
CREATE TABLE "public"."restricciones_inmueble" (
    "id" BIGSERIAL NOT NULL,
    "id_inmueble" DECIMAL NOT NULL,
    "acepta_mascotas" "dbs14813645"."restricciones_inmueble_acepta_mascotas" DEFAULT 'no',
    "acepta_niños" "dbs14813645"."restricciones_inmueble_acepta_niños" DEFAULT 'no',
    "acepta_estudiantes" "dbs14813645"."restricciones_inmueble_acepta_estudiantes" DEFAULT 'no',
    "acepta_roomies" "dbs14813645"."restricciones_inmueble_acepta_roomies" DEFAULT 'no',
    "ingresos_minimos" DECIMAL(10,2),
    "precio_poliza" DECIMAL(10,2),
    "requiere_comprobantes_ingresos" BOOLEAN DEFAULT true,
    "observaciones" TEXT,

    CONSTRAINT "idx_19414_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_user" (
    "user_id" DECIMAL NOT NULL,
    "role_id" DECIMAL NOT NULL,

    CONSTRAINT "idx_19432_primary" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "idx_19428_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "password" VARCHAR(255) NOT NULL,
    "remember_token" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_19444_primary" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_19222_api_keys_key_hash_unique" ON "public"."api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "idx_19222_api_keys_user_id_foreign" ON "public"."api_keys"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19230_email" ON "public"."asesores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19238_slug" ON "public"."blogs"("slug");

-- CreateIndex
CREATE INDEX "idx_19238_autor_id" ON "public"."blogs"("autor_id");

-- CreateIndex
CREATE INDEX "idx_19289_contacto_id" ON "public"."comentarios"("contacto_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacto_conversaciones_wa_id_unique" ON "public"."contacto_conversaciones"("wa_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacto_mensajes_message_id_unique" ON "public"."contacto_mensajes"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19302_telefono" ON "public"."contactos"("telefono");

-- CreateIndex
CREATE INDEX "idx_contactos_estado" ON "public"."contactos"("estado");

-- CreateIndex
CREATE INDEX "idx_19311_error_logs_user_id_foreign" ON "public"."error_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19352_nombre" ON "public"."inmueble_estatus"("nombre");

-- CreateIndex
CREATE INDEX "idx_19360_inmueble_id" ON "public"."inmueble_imagenes"("inmueble_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19328_inmuebles_slug_unique" ON "public"."inmuebles"("slug");

-- CreateIndex
CREATE INDEX "idx_19328_asesor_id" ON "public"."inmuebles"("asesor_id");

-- CreateIndex
CREATE INDEX "idx_19328_estatus_id" ON "public"."inmuebles"("estatus_id");

-- CreateIndex
CREATE INDEX "idx_19372_contacto_id" ON "public"."interacciones_ia"("contacto_id");

-- CreateIndex
CREATE INDEX "idx_19380_inmueble_id" ON "public"."intereses"("inmueble_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19380_contacto_inmueble_unique" ON "public"."intereses"("contacto_id", "inmueble_id");

-- CreateIndex
CREATE INDEX "idx_19414_id_inmueble" ON "public"."restricciones_inmueble"("id_inmueble");

-- CreateIndex
CREATE INDEX "idx_19432_role_id" ON "public"."role_user"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19428_nombre" ON "public"."roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "idx_19444_email" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."contacto_conversaciones" ADD CONSTRAINT "contacto_conversaciones_contacto_fk" FOREIGN KEY ("contacto_id") REFERENCES "public"."contactos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contacto_conversaciones" ADD CONSTRAINT "contacto_conversaciones_contexto_fk" FOREIGN KEY ("wa_id") REFERENCES "public"."regina_contextos"("wa_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contacto_conversaciones" ADD CONSTRAINT "contacto_conversaciones_inmueble_fk" FOREIGN KEY ("inmueble_id") REFERENCES "public"."inmuebles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contacto_mensajes" ADD CONSTRAINT "contacto_mensajes_conversacion_fk" FOREIGN KEY ("conversacion_id") REFERENCES "public"."contacto_conversaciones"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."inmuebles" ADD CONSTRAINT "inmuebles_ibfk_2" FOREIGN KEY ("estatus_id") REFERENCES "public"."inmueble_estatus"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
