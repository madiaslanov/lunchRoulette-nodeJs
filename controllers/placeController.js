import supabase from '../config/supabaseClient.js';

export const createPlace = async (req, res) => {
    try {
        const {
            name,
            rating,
            address,
            cuisine,
            price_range,
            wait_time,
            avg_price_range,
            seats,
            wifi,
            music,
            kids_friendly,
            parking,
            working_hours
        } = req.body;

        if (!name || !cuisine || !price_range) {
            return res.status(400).json({ error: 'Required fields: name, cuisine, price_range' });
        }

        const { data, error } = await supabase
            .from('places')
            .insert([
                {
                    name,
                    rating,
                    address,
                    cuisine,
                    price_range,
                    wait_time,
                    avg_price_range,
                    seats,
                    wifi,
                    music,
                    kids_friendly,
                    parking,
                    working_hours
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Failed to create place' });
        }

        res.status(201).json({ message: 'Place created successfully', place: data[0] });

    } catch (err) {
        console.error('Create place error:', err);
        res.status(500).json({ error: 'Server error while creating place' });
    }
};


export const getPlaces = async (req, res) => {
    try {
            const { price_range, cuisine, max_wait_time } = req.query;

        let query = supabase.from('places').select('*');

        if (price_range) {
            query = query.eq('price_range', price_range);
        }

        if (cuisine) {
            query = query.ilike('cuisine', `%${cuisine}%`);
        }

        if (max_wait_time) {
            query = query.lte('wait_time', parseInt(max_wait_time));
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching places:', error);
            return res.status(500).json({ error: 'Failed to fetch places' });
        }

        res.status(200).json({ places: data });
    } catch (err) {
        console.error('Get places error:', err);
        res.status(500).json({ error: 'Server error while fetching places' });
    }
};