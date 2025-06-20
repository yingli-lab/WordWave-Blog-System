-- Your database initialisation SQL here
DROP TABLE IF EXISTS web_final_project_article_likes;
DROP TABLE IF EXISTS web_final_project_comments;
DROP TABLE IF EXISTS web_final_project_articles;
DROP TABLE IF EXISTS web_final_project_users;
DROP TABLE IF EXISTS web_final_project_avatars;

-- Avatar image
CREATE TABLE IF NOT EXISTS web_final_project_avatars (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    file_path VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

-- User info
CREATE TABLE IF NOT EXISTS web_final_project_users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE,
    description TEXT,
    avatar_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (avatar_id) REFERENCES web_final_project_avatars(id)
);

-- Articles
CREATE TABLE IF NOT EXISTS web_final_project_articles (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES web_final_project_users(id) ON DELETE CASCADE
);

-- Comment
CREATE TABLE IF NOT EXISTS web_final_project_comments (
    id INT NOT NULL AUTO_INCREMENT,
    content TEXT NOT NULL,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (article_id) REFERENCES web_final_project_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES web_final_project_users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES web_final_project_comments(id) ON DELETE CASCADE
);

-- Relation_liked
CREATE TABLE IF NOT EXISTS web_final_project_article_likes (
    id INT NOT NULL AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (article_id) REFERENCES web_final_project_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES web_final_project_users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (article_id, user_id)
);


-- Fill some test data
INSERT INTO web_final_project_avatars (name, file_path) VALUES
    ('avatar1.png', '/images/avatars/avatar1.png'),
    ('avatar2.png', '/images/avatars/avatar2.png'),
    ('avatar3.png', '/images/avatars/avatar3.png'),
    ('avatar4.png', '/images/avatars/avatar4.png'),
    ('avatar5.png', '/images/avatars/avatar5.png'),
    ('avatar6.png', '/images/avatars/avatar6.png'),
    ('avatar7.png', '/images/avatars/avatar7.png'),
    ('avatar8.png', '/images/avatars/avatar8.png'),
    ('avatar9.png', '/images/avatars/avatar9.png'),
    ('avatar10.png', '/images/avatars/avatar10.png'),
    ('avatar11.png', '/images/avatars/avatar11.png'),
    ('avatar12.png', '/images/avatars/avatar12.png'),
    ('avatar13.png', '/images/avatars/avatar13.png'),
    ('avatar14.png', '/images/avatars/avatar14.png'),
    ('avatar15.png', '/images/avatars/avatar15.png');

INSERT INTO web_final_project_users (username, password, first_name, last_name, birth_date, description, avatar_id) VALUES
    ('user1', 'hashed_password', 'Alice', 'Smith', '1992-05-14', 'This is a description for user1.', 3),
    ('user2', 'hashed_password', 'Bob', 'Johnson', '1995-08-20', 'This is a description for user2.', 7),
    ('user3', 'hashed_password', 'Charlie', 'Brown', '1988-12-03', 'This is a description for user3.', 10),
    ('user4', 'hashed_password', 'David', 'Williams', '1999-07-11', 'This is a description for user4.', 4),
    ('user5', 'hashed_password', 'Emma', 'Jones', '2000-03-22', 'This is a description for user5.', 2),
    ('user6', 'hashed_password', 'Fiona', 'Davis', '1994-11-30', 'This is a description for user6.', 6),
    ('user7', 'hashed_password', 'George', 'Miller', '1987-09-10', 'This is a description for user7.', 9),
    ('user8', 'hashed_password', 'Helen', 'Wilson', '2003-06-18', 'This is a description for user8.', 1),
    ('user9', 'hashed_password', 'Ian', 'Moore', '1991-04-25', 'This is a description for user9.', 15),
    ('user10', 'hashed_password', 'Jack', 'Taylor', '1996-10-07', 'This is a description for user10.', 12);

INSERT INTO web_final_project_articles (user_id, title, content, image_url, created_time) VALUES
    (1, 'Why Can’t Robots Click The "I’m Not a Robot" Box?',
    'Many websites use CAPTCHA to distinguish between humans and bots. But why can’t robots simply click the "I’m not a robot" checkbox?
    The answer lies in the way these systems analyze user behavior, mouse movements, and other indicators to determine if an entity is human.
    Additionally, modern CAPTCHAs use risk-based approaches, analyzing browsing history, cookies, and previous interactions.
    In this article, we explore the mechanisms behind CAPTCHA and how it continues to evolve against AI.',
    '/images/articles/article1.jpg', NOW()),

    (2, 'The Future of AI',
    'Artificial intelligence is advancing at an unprecedented rate. From generative AI models to self-learning systems,
    we are witnessing a transformation in industries such as healthcare, finance, and entertainment.
    However, with this rapid development comes challenges related to ethics, bias, and employment impact.
    Will AI replace human jobs entirely, or will it augment human abilities?
    This article discusses current trends, challenges, and future possibilities of AI.',
    '/images/articles/article2.jpg', NOW()),

    (3, 'Understanding Quantum Computing',
    'Quantum computing is not just a buzzword; it represents a revolutionary leap in computation.
    Unlike classical computers that use bits (0s and 1s), quantum computers use qubits, which can exist in multiple states simultaneously.
    This allows quantum computers to solve complex problems much faster than traditional computers.
    In this article, we dive into the basics of quantum mechanics, quantum gates, and how they power the next generation of supercomputers.',
    '/images/articles/article3.jpg', NOW()),

    (4, 'How to Learn Python Efficiently',
    'Python is one of the most popular programming languages today.
    But how can beginners master Python efficiently?
    This guide provides a structured roadmap, starting from basic syntax to advanced concepts like object-oriented programming and data science.
    We also discuss the best resources, projects to build, and common mistakes to avoid on your journey to becoming a Python expert.',
    '/images/articles/article4.jpg', NOW()),

    (5, 'The Rise of Web3',
    'Web3 is reshaping the internet by decentralizing control and giving power back to users.
    With blockchain technology at its core, Web3 introduces decentralized applications (dApps), smart contracts, and digital ownership.
    However, challenges such as scalability, regulation, and mass adoption still remain.
    This article explores what Web3 is, how it differs from Web2, and what it means for the future of the internet.',
    '/images/articles/article5.jpg', NOW()),

    (6, 'Space Exploration Advances',
    'Space exploration has come a long way, from the Apollo moon landing to Mars rovers and private space travel.
    With new missions planned to explore the Moon, Mars, and beyond, the space industry is experiencing a renaissance.
    Companies like SpaceX and NASA are pioneering advancements in reusable rockets and interstellar travel.
    This article covers the latest breakthroughs in space technology and what the future holds for space exploration.',
    '/images/articles/article6.jpg', NOW()),

    (7, 'The Role of Ethics in AI',
    'As AI becomes more powerful, ethical concerns grow.
    From bias in algorithms to concerns over surveillance, how should society regulate AI to ensure fairness and accountability?
    This article delves into the ethical challenges AI poses and possible solutions to create responsible AI systems.',
    '/images/articles/article7.jpg', NOW()),

    (8, 'Cybersecurity Best Practices',
    'With cyber threats on the rise, protecting personal and business data has never been more critical.
    This guide outlines essential cybersecurity practices, including strong password management, two-factor authentication, and recognizing phishing attacks.
    We also explore the latest security trends and how companies can safeguard their systems from cybercriminals.',
    '/images/articles/article8.jpg', NOW()),

    (9, 'Breaking Down Machine Learning',
    'Machine learning is transforming industries by enabling computers to learn from data.
    But how does it actually work?
    In this article, we explain key concepts like supervised and unsupervised learning, neural networks, and deep learning.
    We also provide real-world applications of machine learning, from recommendation systems to fraud detection.',
    '/images/articles/article9.jpg', NOW()),

    (10, 'How to Build a Blog System',
    'Building a blog system requires knowledge of front-end and back-end development.
    This tutorial walks you through setting up a full-stack blog using technologies like Node.js, Express, and MySQL.
    We cover key features such as user authentication, posting articles, comments, and a responsive UI design.
    By the end of this guide, you will have a fully functional blog platform ready to deploy.',
    '/images/articles/article10.jpg', NOW());

INSERT INTO web_final_project_comments (content, article_id, user_id, parent_comment_id, created_time) VALUES
    ('Cybersecurity is more important than ever. This article explains it well!', 1, 7, NULL, NOW()),
    ('I love how blockchain is evolving. Exciting times ahead!', 2, 3, NULL, NOW()),
    ('Machine learning in healthcare is revolutionary. Can’t wait to see what’s next.', 3, 6, NULL, NOW()),
    ('JavaScript frameworks keep changing so fast. Which one should I focus on?', 4, 8, NULL, NOW()),
    ('Metaverse sounds like science fiction, but it’s becoming real!', 5, 9, NULL, NOW()),
    ('Climate tech innovation is something we should all support.', 6, 4, NULL, NOW()),
    ('Cloud computing has made everything easier. Great insights in this article.', 7, 5, NULL, NOW()),
    ('Data privacy should be a top priority in the digital age.', 8, 2, NULL, NOW()),
    ('AI-generated art is mind-blowing. Creativity redefined.', 9, 10, NULL, NOW()),
    ('I built my first API using this guide. Super helpful!', 10, 1, NULL, NOW()),

    ('Absolutely! Cybersecurity needs more focus from everyone.', 1, 2, 1, NOW()),
    ('Blockchain will change finance forever. We’re just at the beginning.', 2, 6, 2, NOW()),
    ('Healthcare AI has so much potential, but we need regulations.', 3, 7, 3, NOW()),
    ('Vue.js seems to be gaining traction, but React is still king.', 4, 9, 4, NOW()),
    ('The metaverse still feels like a buzzword. What real applications do we have now?', 5, 5, 5, NOW()),
    ('Absolutely! Green technology is the future.', 6, 10, 6, NOW()),
    ('Cloud computing has revolutionized startups. Lower costs, more flexibility.', 7, 3, 7, NOW()),
    ('We trade our privacy for convenience way too often.', 8, 4, 8, NOW()),
    ('I wonder if AI art can ever replace human creativity.', 9, 1, 9, NOW()),
    ('APIs are the backbone of modern web development. Good work!', 10, 8, 10, NOW()),

    ('Many companies don’t invest enough in security until it’s too late.', 1, 8, 11, NOW()),
    ('Decentralized finance is going to disrupt traditional banks.', 2, 1, 12, NOW()),
    ('Regulations are key, but they shouldn’t slow down innovation.', 3, 5, 13, NOW()),
    ('React has better job opportunities, but Vue is easier to learn.', 4, 6, 14, NOW()),
    ('Right now, gaming and virtual events are the most practical metaverse applications.', 5, 7, 15, NOW()),
    ('Carbon capture tech is improving fast. Hope it scales globally.', 6, 9, 16, NOW()),
    ('Startups should be more aware of cloud security risks.', 7, 10, 17, NOW()),
    ('Privacy laws are lagging behind technology. Governments need to catch up.', 8, 2, 18, NOW()),
    ('Human creativity is about emotion and experience. AI lacks that.', 9, 3, 19, NOW()),
    ('Once you understand RESTful principles, API development gets much easier.', 10, 4, 20, NOW());

INSERT INTO web_final_project_article_likes (article_id, user_id) VALUES
    (1, 2),
    (1, 3),
    (2, 5),
    (2, 6),
    (3, 4),
    (3, 7),
    (4, 1),
    (4, 8),
    (5, 9),
    (5, 10),
    (6, 2),
    (6, 3),
    (7, 5),
    (7, 6),
    (8, 7),
    (8, 8),
    (9, 9),
    (9, 10),
    (10, 1),
    (10, 4);
