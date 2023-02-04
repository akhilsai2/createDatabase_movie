const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB is obtained an ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertMovieObjectIntoCamelCase = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  };
};

const convertDirectObjectIntoCamelCase = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieNames = `SELECT movie_name FROM movie;`;
  const movieList = await db.all(getMovieNames);
  response.send(
    movieList.map((eachMovie) => convertMovieObjectIntoCamelCase(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovie = `INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  await db.run(postMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieID/", async (request, response) => {
  const { movieID } = request.params;
  const getMovie = `
  SELECT
   * 
 FROM movie 
 WHERE 
 movie_id = ${movieID};`;
  const movieName = await db.get(getMovie);
  response.send(convertMovieObjectIntoCamelCase(movieName));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieUpdate = request.body;
  const { directorId, movieName, leadActor } = movieUpdate;
  const updateMovie = `
    UPDATE movie
    SET director_id = ${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM movie
    WHERE movie_id=${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirector = `
    SELECT * FROM director;`;
  const directorList = await db.all(getDirector);
  response.send(
    directorList.map((eachDirector) =>
      convertDirectObjectIntoCamelCase(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirector = `SELECT movie_name FROM movie WHERE
    director_id=${directorId};`;
  const directorList = await db.all(getMovieDirector);
  response.send(
    directorList.map((eachMovie) => convertMovieObjectIntoCamelCase(eachMovie))
  );
});

module.exports = app;
