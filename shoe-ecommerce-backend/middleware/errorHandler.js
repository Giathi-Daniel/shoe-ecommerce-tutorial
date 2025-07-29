const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    const status = err.statusCode || 500;
    const message = err.message || 'Server Error';

    res.status(status).json({
        sucess: false,
        status,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : '🔥',
    });
};

module.exports = errorHandler;