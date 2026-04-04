-- CreateTable: boards
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable: board_members
CREATE TABLE "board_members" (
    "board_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("board_id","user_id")
);

-- AddForeignKey: boards → users
ALTER TABLE "boards" ADD CONSTRAINT "boards_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: board_members → boards
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_fkey"
    FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: board_members → users
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Для каждого существующего пользователя создаём личную доску "Мои задачи"
-- и добавляем его как участника
INSERT INTO "boards" ("id", "name", "owner_id", "updated_at")
SELECT
    gen_random_uuid()::text,
    'Мои задачи',
    u.id,
    NOW()
FROM "users" u;

-- board_members: владелец сразу является участником своей доски
INSERT INTO "board_members" ("board_id", "user_id")
SELECT b.id, b.owner_id FROM "boards" b;

-- AlterTable: добавляем board_id как nullable сначала
ALTER TABLE "tasks" ADD COLUMN "board_id" TEXT;

-- Привязываем существующие задачи к личной доске их владельца
UPDATE "tasks" t
SET "board_id" = b.id
FROM "boards" b
WHERE b.owner_id = t.user_id;

-- Теперь делаем board_id NOT NULL
ALTER TABLE "tasks" ALTER COLUMN "board_id" SET NOT NULL;

-- AddForeignKey: tasks → boards
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_board_id_fkey"
    FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
