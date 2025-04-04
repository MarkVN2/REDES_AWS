const apiUrl = 'http://bananabread.ddns.net:3200';
let movieList = document.getElementById('movie-list');
let movieForm = document.getElementById('movie-form');
let submitMovie = document.getElementById('submit-new-movie');
let movieRefresh = document.getElementById('movie-refresh');

const createMovie = (title, rating, notes) => {
    fetch(`${apiUrl}/movie`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            rating: rating,
            notes: notes
        })
    })
    .then(() => getMovies())
    .catch(error => console.error('Error:', error));
};
const getMovies = () =>{
    fetch(`${apiUrl}/movie`)
    .then(response => response.json())
    .then(data => {
        let movies = data;
        movieList.innerHTML = '';
        movies.forEach(movie => {
            let tr = document.createElement('tr');
            let id = document.createElement('td');
            let title = document.createElement('td');
            let rating = document.createElement('td');
            let note = document.createElement('td');
            let action = document.createElement('td');
            let deleteButton = document.createElement('button');
            let updateButton = document.createElement('button');
            
            id.innerText = movie.id;
            title.innerText = movie.title;
            rating.innerText = movie.rating;
            note.innerText = movie.notes;
            deleteButton.innerText = 'Delete';
            updateButton.innerText = 'Update';
            action.classList.add('text-center');
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', "m-1");
            updateButton.classList.add('btn', 'btn-warning', 'btn-sm', "m-1");

            deleteButton.onclick = ()=>{
                deleteMovie(movie.id);
            }
            updateButton.onclick = ()=>{
                updateMovie(movie.id, movie.rating);
            }

            action.append(deleteButton, updateButton);
            tr.append(id, title, rating, note, action);
            movieList.appendChild(tr);
        });
    })
    .catch(error => console.error('Error:', error));
};
const updateMovie = (movieId, oldRating) => {
    let newRating = prompt('Enter new rating:', oldRating);
    fetch(`${apiUrl}/movie/${movieId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            rating: newRating,
        })
    })
    .then(() => getMovies())
    .catch(error => console.error('Error:', error));
};
const deleteMovie = (movieId) => {
    fetch(`${apiUrl}/movie/${movieId}`, {
        method: 'DELETE'
    })
    .then(() => getMovies())
    .catch(error => console.error('Error:', error));
};
getMovies();

movieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let title = document.getElementById('form-title');
    let rating = document.getElementById('form-rating');
    let note = document.getElementById('form-review');
    createMovie(title.value, rating.value, note.value);
    title.value = "";
    rating.value = "";
    note.value = "";
});
movieRefresh.addEventListener('click', (e) => {
    getMovies();
})