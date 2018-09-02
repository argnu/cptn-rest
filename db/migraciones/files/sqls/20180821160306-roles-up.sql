ALTER TABLE "usuario" ADD COLUMN "rol" varchar(100);
UPDATE usuario SET rol='admin' WHERE admin=true;
UPDATE usuario SET rol='usuario_cptn' WHERE admin=false;
ALTER TABLE "usuario" DROP COLUMN "admin";
