# Oprava notifikací / Notifications repair

Příčina: chybějící sloupce `notification_key` a `data_json` v Neon tabulce `notifications`.

1. Otevři Neon Console → SQL Editor pro databázi používanou projektem na Vercelu.
2. Spusť obsah `scripts/fix-notifications-columns.sql`.
3. Nahraj aktualizovaný kód a proveď redeploy. API GET má navíc bezpečný fallback pro starší schéma, ale migrace je nezbytná, aby fungovaly nové typy notifikací.

Migrace nemaže uživatele ani notifikace. Při chybě `relation notifications does not exist` nejprve spusť `scripts/community-v5.9-migration.sql`.
