const { Movie } = require("../models");
class requestHandler {
  // POST
  createMovie = (req, res) => {
    let { body } = req;
    let movie = {
      title: body.title,
      rating: body.rating,
      notes: body.notes,
    }
    
    Movie.create(movie).then((response)=>{
      res.status(201).send();
    }).catch((err) => {
      console.log(err);
      res.status(400).send();
    });
  };
  // GET
  getMovies = (req, res) => {
    Movie.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    }).then((response) => {
      res.status(200).send(response);
    }).catch((err) => {
      console.log(err);
      res.status(400).send();
    });
  };
  // PATCH
  updateMovie = (req, res) => {
    let { body, params } = req;

    Movie.findByPk(params.id).then((response) => {

      Movie.update({
        title: body.title,
        rating: body.rating,
        notes: body.notes,
      }, {
        where: {
          id: params.id,
        },
      }).then(() => {
        res.status(200).send();
      }).catch((err) => {
        console.log(err);
        res.status(400).send();
      });
    
    }).catch((err) => {
      console.log(err);
      res.status(400).send();
    });

  };
  // DELETE
  deleteMovie = (req, res) => {
    let { params } = req;
    Movie.destroy({
      where: {
        id: params.id,
      },
    }).then(() => {
      res.status(200).send();
    }).catch((err) => {
      console.log(err);
      res.status(400).send();
    });
  };
}

module.exports = new requestHandler();
