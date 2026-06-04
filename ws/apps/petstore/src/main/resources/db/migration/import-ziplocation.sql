-- WaterRock: H2-compatible replacement for Derby SYSCS_UTIL.SYSCS_IMPORT_TABLE.
-- Loads zip code data from cities.del CSV into the ziplocation table.
-- This file is loaded by Hibernate's import_files at deploy time.
INSERT INTO ZIPLOCATION SELECT * FROM CSVREAD('classpath:db/migration/cities.del');
