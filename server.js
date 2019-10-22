require('dotenv').config()

const express = require('express');
const morgan = require('morgan')
const cors = require('cors');
const helmet = require('helmet');
const MOVIES = require('./movies.json');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganSetting))
app.use(helmet());
app.use(cors());

app.use(function validateBarerToker(req, res, next){
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN;
    if(!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(401).json({ error: 'Unauthorized Request'})
    }
    next()
});


function getMovieTypes(req, res){
    const { genre, country, vote } = req.query;

    let filteredMovies = MOVIES;

    if(genre){
        filteredMovies = MOVIES.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()))
    }

    if(country){
        filteredMovies = MOVIES.filter(movie => movie.country.split(' ').join('').toLowerCase().includes(country.toLowerCase()))
    }

    if(vote){
        filteredMovies = MOVIES.filter(movie => Number(movie.avg_vote) >= Number(vote));
    }

    res.send(filteredMovies)
}


app.get('/movies', getMovieTypes);



app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })


const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})