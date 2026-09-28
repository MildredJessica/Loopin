CREATE TABLE recommendations (
    id UUID PRIMARY KEY,
    title VARCHAR(60) NOT NULL,
    color VARCHAR(60) NOT NULL,
    icon VARCHAR(60) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default recommendations
INSERT INTO recommendations (id, title, color, icon) VALUES 
(gen_random_uuid(), 'UI/UX', '#F3F1FF', 'PenTool'),
(gen_random_uuid(), 'Music', '#FF5C8A', 'Music'),
(gen_random_uuid(), 'Cooking', '#FDF5E6', 'ChefHat'),
(gen_random_uuid(), 'Hiking', '#7C5CFC', 'Mountain');
