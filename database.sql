-- DROP DATABASE ONEPIECE;
CREATE DATABASE onepiece;
USE onepiece;

CREATE TABLE users (
    user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    contact BIGINT UNIQUE,
    profile_pic VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT
);

---------------------------------------------------

CREATE TABLE roles (
    role_id INT NOT NULL PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL
);

INSERT INTO roles (role_id, role_name)
VALUES
    (1, 'BUYER'),
    (2, 'SELLER'),
    (3, 'ADMIN');

---------------------------------------------------

CREATE TABLE user_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL DEFAULT 1,
    version BIGINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
    ON DELETE CASCADE 
);

---------------------------------------------------

CREATE TABLE products (
    product_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    product_model VARCHAR(255) NOT NULL,
    model_year YEAR NOT NULL,
    start_price INT NOT NULL,
    price_jump INT NOT NULL,
    detail VARCHAR(255),
    auction_date DATE NOT NULL,
    auction_start_time DATETIME NOT NULL,
    auction_duration TIME NOT NULL,
    product_img VARCHAR(255) NOT NULL,
    category ENUM('Antique','Vintage','Classic','Sports','Luxury'),
    product_status ENUM('PENDING','APPROVED','DECLINED'),
    seller_id INT NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT NOT NULL,
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
		ON DELETE CASCADE
);
---------------------------------------------------
CREATE TABLE Product_Images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_data longblob NOT NULL,
    
    FOREIGN KEY (product_id) REFERENCES Products(product_id) 
        ON DELETE CASCADE
);
---------------------------------------------------

CREATE TABLE auction (
    auction_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL UNIQUE,
    curr_price INT NOT NULL,
    bid_count INT NOT NULL,
    curr_status ENUM('SCHEDULED','ONGOING','COMPLETED'),
    version BIGINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
		ON DELETE CASCADE
);

---------------------------------------------------

CREATE TABLE bidding (                     
    bid_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    buyer_id INT NOT NULL,
    new_bid_amount INT NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT NOT NULL,
    FOREIGN KEY (auction_id) REFERENCES auction(auction_id)
		ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);

---------------------------------------------------

CREATE TABLE payments (
    payment_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    product_id INT NOT NULL,
    auction_id INT NOT NULL,
    final_amount INT NOT NULL,
    payment_method ENUM('UPI','CARD','NEFT'),
    transaction_status ENUM('SUCCESFUL','FAILED'),
    payment_time DATETIME NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
		ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
		ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auction(auction_id)
    ON DELETE CASCADE
);

---------------------------------------------------

CREATE TABLE reviews (
    review_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    auction_id INT NOT NULL,
    review VARCHAR(1000),
    rating FLOAT,
    -- AUDIT AND VERSION
    version BIGINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auction(auction_id)
    ON DELETE CASCADE
);

---------------------------------------------------
