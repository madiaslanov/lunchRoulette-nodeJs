export const testUserController = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Test user route is working!',
        });
    } catch (error) {
        console.error('Error in testUserController', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};
