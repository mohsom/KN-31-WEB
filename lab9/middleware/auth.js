// Middleware для перевірки авторизації
function isAuthenticated(req, res, next) {
    if (req.session?.userId) {
        return next();
    }
    req.flash('error', 'Будь ласка, увійдіть у систему');
    res.redirect('/login');
}

// Middleware для захисту маршрутів від залогінених користувачів
function isNotAuthenticated(req, res, next) {
    if (req.session?.userId) {
        return res.redirect('/dashboard');
    }
    next();
}

module.exports = {
    isAuthenticated,
    isNotAuthenticated
};

