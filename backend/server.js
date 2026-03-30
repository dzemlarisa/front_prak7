const express = require('express');
const { nanoid } = require("nanoid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const port = 8000;

const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Секреты подписи
const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";

// Время жизни токенов
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// { id, email, first_name, last_name, role, password, isBlocked }
let users = [];
let products = [];

// Хранилище refresh-токенов в памяти
const refreshTokens = new Set();

async function initializeUsers() {
    if (users.length === 0) {
        const adminPassword = await hashPassword("admin");
        const admin = {
            id: nanoid(),
            email: "admin@example.com",
            first_name: "Larisa",
            last_name: "Admin",
            password: adminPassword,
            role: "admin",
            isBlocked: false
        };
        users.push(admin);

        const sellerPassword = await hashPassword("seller");
        const seller = {
            id: nanoid(),
            email: "seller@example.com",
            first_name: "Larisa",
            last_name: "Seller",
            password: sellerPassword,
            role: "seller",
            isBlocked: false         
        };
        users.push(seller);
    }
}

function initializeProducts() {
    if (products.length === 0) {
        const initialProducts = [
            { id: nanoid(6), title: 'Кокакола', category: 'Напитки', description: 'Напиток безалкогольный сильногазированный', price: 200 },
            { id: nanoid(6), title: 'Мармеладки Фансы', category: 'Сладости', description: 'Жевательный мармелад с кислой посыпкой', price: 150 },
            { id: nanoid(6), title: 'Помидоры черри', category: 'Овощи', description: '24 штуки в упаковке. Страна производства: Азербайджан', price: 300 },
            { id: nanoid(6), title: 'Крупа гречневая', category: 'Крупы', description: 'Ядрица 250г', price: 50 },
            { id: nanoid(6), title: 'Яблоки', category: 'Фрукты', description: 'Сорт: Белый налив', price: 155 }
        ];
        products.push(...initialProducts);
    }
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      isBlocked: user.isBlocked
    },
    ACCESS_SECRET,
    {
      expiresIn: ACCESS_EXPIRES_IN,
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      isBlocked: user.isBlocked
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_EXPIRES_IN,
    }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);

    if (payload.isBlocked) {
      return res.status(403).json({ error: "User account is blocked" });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        const user = users.find(u => u.id === req.user.sub);
        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
}

function findProductById(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "product not found" });
        return null;
    }
    return product;
}

function findUserById(id, res) {
    const user = users.find(u => u.id === id);
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}

async function hashPassword(password) {  
    const rounds = 10;
    return bcrypt.hash(password, rounds);  
}

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API управления товарами',
            version: '1.0.0',
            description: 'API для регистрации пользователей и управления товарами',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           example: ab12cd
 *         email:
 *           type: string
 *           format: email
 *           example: example@mail.ru
 *         first_name:
 *           type: string
 *           example: Иван
 *         last_name:
 *           type: string
 *           example: Петров
 *         password:
 *           type: string
 *           description: Хешированный пароль
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           example: xy78zw
 *         title:
 *           type: string
 *           example: Кокакола
 *         category:
 *           type: string
 *           example: Напитки
 *         description:
 *           type: string
 *           example: Напиток безалкогольный сильногазированный
 *         price:
 *           type: number
 *           example: 200
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Петров
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: ab12cd
 *                 email:
 *                   type: string
 *                   example: ivan@example.com
 *                 first_name:
 *                   type: string
 *                   example: Иван
 *                 last_name:
 *                   type: string
 *                   example: Петров
 *       400:
 *         description: Некорректные данные
 *       409:
 *         description: Пользователь с таким email уже существует
 */

app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "email, first_name, last_name and password are required" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        if (existingUser.isBlocked) {
            return res.status(409).json({ error: "user with this email is blocked" });
        }
        return res.status(409).json({ error: "user with this email already exists" });
    }

    const newUser = {
        id: nanoid(),
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: 'user',
        password: await hashPassword(password),
        isBlocked: false
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет email и пароль пользователя, возвращает JWT токены
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: example@mail.ru
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 */

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.isBlocked) {
        return res.status(403).json({ error: "User account is blocked" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление access-токена
 *     description: Получает новую пару токенов по refresh-токену
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Отсутствует refreshToken
 *       401:
 *         description: Недействительный или просроченный refresh токен
 */

app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: "refreshToken is required",
    });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({
      error: "Invalid refresh token",
    });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    refreshTokens.delete(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.add(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     description: Возвращает данные авторизованного пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *       401:
 *         description: Отсутствует или недействителен токен
 *       404:
 *         description: Пользователь не найден
 */

app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;

    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     description: Возвращает список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

app.get("/api/users", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
    res.status(200).json(usersWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по id
 *     description: Возвращает пользователя по его идентификатору
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Отсутствует или недействителен токен
 *       404:
 *         description: Пользователь не найден
 */

app.get("/api/users/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = findUserById(req.params.id, res);
    if (!user) return;
    
    res.status(200).json(user);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить параметры пользователя
 *     description: Обновляет существующего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@mail.ru
 *               first_name:
 *                 type: string
 *                 example: Larisa
 *               last_name:
 *                 type: string
 *                 example: Jam
 *               password:
 *                 type: string
 *                 example: 123
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Отсутствует или недействителен токен
 *       404:
 *         description: Пользователь не найден
 */

app.put("/api/users/:id", authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const user = findUserById(req.params.id, res);
    if (!user) return;

    const { first_name, last_name, role, password } = req.body; 

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role) user.role = role;
    if (password) {
        user.password = await hashPassword(password);
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя
 *     description: Блокирует пользователя по идентификатору
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно заблокирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       401:
 *         description: Отсутствует или недействителен токен
 *       404:
 *         description: Пользователь не найден
 */

app.delete("/api/users/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = findUserById(req.params.id, res);
    if (!user) return;

    if (user.id === req.user.sub) {
        return res.status(403).json({ error: "Cannot block your own account" });
    }

    user.isBlocked = true;
    
    const tokensToRemove = Array.from(refreshTokens).filter(token => {
        try {
            const payload = jwt.verify(token, REFRESH_SECRET);
            return payload.sub === user.id;
        } catch {
            return true;
        }
    });
    
    tokensToRemove.forEach(token => refreshTokens.delete(token));
    
    res.status(200).json({ 
        message: "User blocked successfully",
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            isBlocked: user.isBlocked
        }
    });
});


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     description: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Кокакола
 *               category:
 *                 type: string
 *                 example: Напитки
 *               description:
 *                 type: string
 *                 example: Напиток безалкогольный сильногазированный
 *               price:
 *                 type: number
 *                 example: 200
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные
 */

app.post("/api/products", authMiddleware, roleMiddleware(['seller']), (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: "title, category, description and price are required" });
    }

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: "price must be a positive number" });
    }

    const newProduct = {
        id: nanoid(),
        title: title,
        category: category,
        description: description,
        price: price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     description: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

app.get("/api/products", (req, res) => {
    res.status(200).json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id
 *     description: Возвращает товар по его идентификатору
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Отсутствует или недействителен токен
 *       404:
 *         description: Товар не найден
 */

app.get("/api/products/:id", (req, res) => {
    const product = findProductById(req.params.id, res);
    if (!product) return;
    
    res.status(200).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить параметры товара
 *     description: Обновляет существующий товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Кокакола
 *               category:
 *                 type: string
 *                 example: Напитки
 *               description:
 *                 type: string
 *                 example: Напиток безалкогольный сильногазированный
 *               price:
 *                 type: number
 *                 example: 200
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Отсутствует или недействителен токен
 *       404:
 *         description: Товар не найден
 */

app.put("/api/products/:id", authMiddleware, roleMiddleware(['seller']), (req, res) => {
    const product = findProductById(req.params.id, res);
    if (!product) return;

    const { title, category, description, price } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        return res.status(400).json({ error: "price must be a positive number" });
    }

    if (title) product.title = title;
    if (category) product.category = category;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;

    res.status(200).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Удаляет товар по идентификатору
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       401:
 *         description: Отсутствует или недействителен токен
 *       404:
 *         description: Товар не найден
 */

app.delete("/api/products/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    products.splice(productIndex, 1);
    res.status(200).json({ message: "Product deleted successfully" });
});

app.listen(port, async () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
    await initializeUsers();
    await initializeProducts();
});