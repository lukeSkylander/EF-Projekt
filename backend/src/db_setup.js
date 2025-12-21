import pgPromise from "pg-promise";

const pgp = pgPromise();
const db = pgp(process.env.DATABASE_URL);

await db.none(`
    DROP TABLE users;
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100)
    );
`);

pgp.end();
