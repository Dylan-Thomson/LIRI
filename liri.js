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

runCommand(command, query);

// COMMANDS
// concert-this
// spotify-this-song DONE
// movie-this
// do-what-it-says

function runCommand(command, query) {
    if(command === "spotify-this-song") {
        if(query) {
            getSpotifySongData(query);
        }
        else {
            console.log("Please enter a song name.\nspotify-this-song song name");
        }
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
}

function getSpotifySongData(songName) {
    spotify.search({type: 'track', query: songName, limit: 1}).then(response => {
        if(response.tracks.items.length < 1) {
            console.log("Song not found. Here's a default song.");
            getSpotifySongData("The Sign Ace of Base");
        }
        else {
            const artistName = response.tracks.items[0].artists[0].name;
            const songName = response.tracks.items[0].name;
            const link = response.tracks.items[0].external_urls.spotify;
            const albumName = response.tracks.items[0].album.name;
            console.log("Artist: " + artistName +
                        "\nSong Name: " + songName +
                        "\nLink: " + link +
                        "\nAlbum: " + albumName);
        }
    }).catch(err => {
        console.log(err);
    });
}