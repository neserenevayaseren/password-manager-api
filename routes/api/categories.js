const router = require('express').Router();
const validate = require('../../middleware/validate');
const s = require('../../validators/categories');
const sp = require('../../validators/passwords');
const c = require('../../controllers/categoriesController');

router.get('/', validate({ query: s.list }), c.list);
router.post('/', validate({ body: s.create }), c.create);
router.get('/:id', validate({ params: s.id }), c.getOne);
router.get('/:id/passwords', validate({ params: s.id, query: sp.list }), c.passwords);
router.put('/:id', validate({ params: s.id, body: s.replace }), c.replace);
router.patch('/:id', validate({ params: s.id, body: s.patch }), c.patch);
router.delete('/:id', validate({ params: s.id }), c.remove);

module.exports = router;