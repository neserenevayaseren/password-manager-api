const router = require('express').Router();
const validate = require('../../middleware/validate');
const apiAuth = require('../../middleware/apiAuth');
const s = require('../../validators/passwords');
const c = require('../../controllers/passwordsController');

// публичные (без токена) — должны идти ДО apiAuth
router.post('/generate', validate({ body: s.generate }), c.generate);
router.post('/check-strength', validate({ body: s.checkStrength }), c.checkStrength);

// всё ниже требует токен
router.use(apiAuth);

router.get('/', validate({ query: s.list }), c.list);
router.post('/', validate({ body: s.create }), c.create);
router.get('/:id', validate({ params: s.id }), c.getOne);
router.put('/:id', validate({ params: s.id, body: s.replace }), c.replace);
router.patch('/:id', validate({ params: s.id, body: s.patch }), c.patch);
router.delete('/:id', validate({ params: s.id }), c.remove);
router.post('/:id/regenerate', validate({ params: s.id, body: s.generate }), c.regenerate);

module.exports = router;