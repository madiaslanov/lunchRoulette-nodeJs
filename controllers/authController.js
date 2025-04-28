import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerController = async (req, res) => {
    try {
        const { username, email, password, phone, address, profile } = req.body;

        console.log('Received data:', req.body);

        if (!username || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ error: "Username, email, and password are required" });
        }


        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        console.log("Existing user:", existingUser);
        console.log("Existing user error:", existingUserError);

        if (existingUserError) {
            console.error("Error checking if user exists:", existingUserError);
            return res.status(500).json({ error: "Error checking if user exists" });
        }

        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([
                { username, email, password: hashedPassword, phone, address, profile }
            ])
            .select();

        console.log("Inserted data:", data);
        console.log("Insert error:", error);

        if (error) {
            console.error("Insert error:", error);
            return res.status(500).json({ error: "Failed to register user" });
        }

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

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: "Failed to fetch user" });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: "Server error during login" });
    }
};

export const deleteController = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Attempting to delete user with ID:', userId);

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', parseInt(userId));

        if (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'User not found or already deleted' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error during deletion' });
    }
};