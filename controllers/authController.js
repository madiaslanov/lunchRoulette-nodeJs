import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerController = async (req, res) => {
    try {
        // Получаем данные из тела запроса
        const { username, email, password, phone, address, profile } = req.body;

        // Логируем полученные данные, чтобы убедиться, что они приходят правильно
        console.log('Received data:', req.body);

        // Проверяем обязательные поля
        if (!username || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        // Проверяем, существует ли уже пользователь с таким email
        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('id')  // Выбираем только id, чтобы проверить, есть ли такой email
            .eq('email', email) // Сравниваем по email
            .maybeSingle(); // Возвращаем только один результат

        console.log("Existing user:", existingUser);  // Логируем существующего пользователя
        console.log("Existing user error:", existingUserError);  // Логируем ошибку при проверке существующего пользователя

        if (existingUserError) {
            console.error("Error checking if user exists:", existingUserError);
            return res.status(500).json({ error: "Error checking if user exists" });
        }

        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Хешируем пароль с помощью bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Вставка нового пользователя в таблицу
        const { data, error } = await supabase
            .from('users')
            .insert([
                { username, email, password: hashedPassword, phone, address, profile }
            ])
            .select();

        // Логируем данные после вставки
        console.log("Inserted data:", data);
        console.log("Insert error:", error);

        // Обработка ошибок при вставке
        if (error) {
            console.error("Insert error:", error);
            return res.status(500).json({ error: "Failed to register user" });
        }

        // Ответ после успешной регистрации
        if (!data || data.length === 0) {
            return res.status(500).json({ error: "Insert did not return user data" });
        }
        res.status(201).json({ message: "User registered successfully", user: data[0] });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};




export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', req.body);

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Ищем пользователя по email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single(); // Возвращаем только одного пользователя

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: "Failed to fetch user" });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Извлекаем хешированный пароль из базы данных и сравниваем его с введенным пользователем
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Создаем JWT
        const token = jwt.sign(
            { userId: user.id },   // Payload (данные, которые будут храниться в токене)
            process.env.JWT_SECRET, // Секретный ключ для подписи токена
            { expiresIn: '1h' }    // Время жизни токена (например, 1 час)
        );

        // Отправляем токен в ответе
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            token,  // Возвращаем токен клиенту
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: "Server error during login" });
    }
};

export const deleteController = async (req, res) => {
    try {
        const { userId } = req.params;  // Получаем userId из параметров URL

        console.log('Attempting to delete user with ID:', userId);

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Удаление пользователя
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', parseInt(userId));  // Преобразуем userId в целое число

        if (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        // Проверяем, был ли удален пользователь
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'User not found or already deleted' });
        }

        // Успешное удаление
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error during deletion' });
    }
};