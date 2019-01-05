require("dotenv").config();
const Spotify = require("node-spotify-api");
const keys = require("./keys.js");
const spotify = new Spotify(keys.spotify);





spotify.search({type: 'track', query: 'All the Small things', limit: 1}).then(response => {
    const artistName = response.tracks.items[0].artists[0].name;
    const songName = response.tracks.items[0].name;
    const link = response.tracks.items[0].external_urls.spotify;
    const albumName = response.tracks.items[0].album.name;
    console.log("Artist: " + artistName +
                "\nSong Name: " + songName +
                "\nLink: " + link +
                "\nAlbum: " + albumName);
}).catch(err => {
    console.log(err);
});

// COMMANDS
// concert-this
// spotify-this-song
// movie-this
// do-what-it-says
// console.log(spotify);