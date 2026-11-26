const express = require('express');
const router = express.Router();
const apiAuth = require('../../middleware/apiAuth');
const apiErrorHandler = require('../../middleware/apiErrorHandler');
const ApiError = require('../../utils/ApiError');

router.use(express.json({ limit: '10kb' }));

router.get('/health', (req, res) => res.json({ data: { status: 'ok' } }));

router.use('/passwords', require('./passwords'));
router.use('/categories', apiAuth, require('./categories'));
router.use('/users', apiAuth, require('./users'));

// неизвестный маршрут внутри /api/v1 -> 404 в формате JSON
router.use((req, res, next) => {
    next(ApiError.notFound(`Маршрут ${req.method} ${req.originalUrl} не найден`));
});

router.use(apiErrorHandler);

module.exports = router;