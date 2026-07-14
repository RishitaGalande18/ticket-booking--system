CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'ORGANISER',
    'CUSTOMER'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    phone VARCHAR(20),

    role user_role DEFAULT 'CUSTOMER',

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()
);