require("dotenv").config();
const Spotify = require("node-spotify-api");
const keys = require("./keys.js");
const spotify = new Spotify(keys.spotify);

// Parse argument data
const command = process.argv[2];
let query = process.argv[3];
for(let i = 4; i < process.argv.length; i++) {
    query += "+" + process.argv[i];
}

if(command === "spotify-this-song") {
    getSpotifySongData(query);
}
else if(command === "concert-this") {
    console.log("concert-this coming soon!");
}
else if(command === "movie-this") {
    console.log("movie-this coming soon!");
}
else if(command === "do-what-it-says") {
    console.log("do-what-it-says coming soon!");
}
else {
    console.log("Valid commands:\nconcert-this\nspotify-this-song\nmovie-this\ndo-what-it-says")
}

// COMMANDS
// concert-this
// spotify-this-song DONE
// movie-this
// do-what-it-says

// TODO If no song is provided then your program will default to "The Sign" by Ace of Base.
function getSpotifySongData(songName) {
    spotify.search({type: 'track', query: songName, limit: 1}).then(response => {
        const artistName = response.tracks.items[0].artists[0].name;
        const songName = response.tracks.items[0].name;
        const link = response.tracks.items[0].external_urls.spotify;
        const albumName = response.tracks.items[0].album.name;
        console.log("Artist: " + artistName +
                    "\nSong Name: " + songName +
                    "\nLink: " + link +
                    "\nAlbum: " + albumName);
    }).catch(err => {
        // getSpotifySongData("The Sign");
        console.log(err);
    });
}