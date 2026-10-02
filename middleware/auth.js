function checkAuth(req, res, next) {
    // Имитация: query-параметр ?auth=1 означает "вошёл"
    if (req.query.auth === '1') {
        req.user = { name: 'Администратор', role: 'admin' };
    } else {
        req.user = { name: 'Гость', role: 'guest' };
    }
    next();
}

module.exports = checkAuth;