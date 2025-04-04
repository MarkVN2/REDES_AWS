const controller = require('../controllers/movie.controller.js')
const router = require('express').Router();

router.post('/', controller.createMovie);
router.get('/', controller.getMovies);
router.patch('/:id', controller.updateMovie);
router.delete('/:id', controller.deleteMovie);

module.exports = router;