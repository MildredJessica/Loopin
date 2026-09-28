CREATE TABLE stories (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL,
    author_username VARCHAR(30) NOT NULL,
    author_gradient VARCHAR(60) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
