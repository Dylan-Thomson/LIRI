// Include modules
require("dotenv").config();
const Spotify = require("node-spotify-api");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

// Get API keys
const keys = require("./keys.js");
const spotify = new Spotify(keys.spotify);
const bandsInTownID = keys.bandsInTown.id;
const omdbID = keys.omdb.id;

// Parse argument data
const command = process.argv[2];
let query = process.argv[3];
for(let i = 4; i < process.argv.length; i++) {
    query += "+" + process.argv[i];
}

// Use arguments to run a command
runCommand(command, query);

// Determine appropriate command and run
function runCommand(command, query) {
    if(command === "spotify-this-song") {
        if(query) {
            logSpotifySongData(query);
        }
        else {
            console.log("Please enter a song name.\nExample: spotify-this-song chop suey");
        }
    }
    else if(command === "concert-this") {
        if(query) {
            logBandsInTownData(query);
        }
        else {
            console.log("Please enter a band name.\nExample: concert-this system of a down");
        }
    }
    else if(command === "movie-this") {
        if(query) {
            logOMDBData(query);
        }
        else {
            console.log("Please enter a movie name.\nExample: movie-this the shawshank redemption");
        }
    }
    else if(command === "do-what-it-says") {
        doWhatItSays();
    }
    else {
        console.log("Valid commands:\nconcert-this\nspotify-this-song\nmovie-this\ndo-what-it-says")
    }
}

// Use node-spotify-api to log song data
function logSpotifySongData(songName) {
    spotify.search({type: 'track', query: songName, limit: 1}).then(response => {
        if(response.tracks.items.length < 1) {
            console.log("Song not found. Here's a default song.");
            logSpotifySongData("The Sign Ace of Base");
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

// Use axios to log concert data for a band
function logBandsInTownData(query) {
    axios.get("https://rest.bandsintown.com/artists/" + query + "/events?app_id=" + bandsInTownID).then(response => {
        if(!Array.isArray(response.data) || response.data.length < 1) {
            console.log("Concerts not found.");
        }
        else {
            response.data.forEach(concert => {
                console.log("------------------------------------------------------------------------------");
                console.log(concert.venue.name);
                console.log(concert.venue.city + ", " + concert.venue.region + " " + concert.venue.country);
                console.log(moment(concert.datetime.substr(0,10), "YYYY-MM-DD").format("MM/DD/YYYY"));
            });
        }
    }).catch(err => {
        console.log(err);
    });
}

// Use axios to log movie data
function logOMDBData(query) {
    axios.get("http://www.omdbapi.com/?t=" + query + "&plot=short&apikey=" + omdbID).then(response => {
        if(response.data.Response === 'False') {
            console.log("Movie not found.");
        }
        else {
            console.log("Title: " + response.data.Title);
            console.log("Released: " + response.data.Year);
            console.log("IMDB rating: " + response.data.imdbRating);
            console.log("Rotten Tomatoes Rating: " + response.data.Ratings[1].Value); // TODO Dont assume place in array
            console.log("Language: " + response.data.Language);
            console.log("Plot: " + response.data.Plot);
            console.log("Actors: " + response.data.Actors);
        }
    }).catch(err => {
        console.log(err);
    });
}

// Run command located in random.txt
function doWhatItSays() {
    fs.readFile("random.txt", "utf8", (error, data) => {
        if(error) throw error;
        const dataArr = data.split(",");
        const command = dataArr[0];
        const query = dataArr[1];
        if(command !== "do-what-it-says") { // We don't ever want to run this command because it will loop forever
            runCommand(command, query);
        }
    });
}