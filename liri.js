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
function logSpotifySongData(query) {
    spotify.search({type: 'track', query: query, limit: 1}).then(response => {
        if(response.tracks.items.length < 1) {
            console.log("I couldn't find the song you were looking for. Here is The Sign by Ace of Base");
            logSpotifySongData("The Sign Ace of Base");
        }
        else {
            const artistName = response.tracks.items[0].artists[0].name;
            const query = response.tracks.items[0].name;
            const link = response.tracks.items[0].external_urls.spotify;
            const albumName = response.tracks.items[0].album.name;

            let output = "Artist: " + artistName;
            output += "\nSong Name: " + query;
            output += "\nLink: " + link;
            output += "\nAlbum: " + albumName;
            
            // Log to console and to log.txt                
            console.log(output);
            logToFile("spotify-this-song", query, output);
        }
    }).catch(err => {
        console.log(err);
    });
}

// Use axios to log concert data for a band
function logBandsInTownData(query) {
    axios.get("https://rest.bandsintown.com/artists/" + query + "/events?app_id=" + bandsInTownID).then(response => {
        if(!Array.isArray(response.data) || response.data.length < 1) {
            console.log("I couldn't find concerts for the band you were looking for.");
        }
        else {
            let output = "";
            response.data.forEach(concert => {
                output += concert.venue.name;
                output += "\n" + concert.venue.city + ", " + concert.venue.region + " " + concert.venue.country;
                output += "\n" + moment(concert.datetime.substr(0,10), "YYYY-MM-DD").format("MM/DD/YYYY") + "\n\n";
            });
            output = output.trim();
            // Log to console and log.txt
            console.log(output)
            logToFile("concert-this", query, output)
        }
    }).catch(err => {
        console.log(err);
    });
}

// Use axios to log movie data
function logOMDBData(query) {
    axios.get("http://www.omdbapi.com/?t=" + query + "&plot=short&apikey=" + omdbID).then(response => {
        if(response.data.Response === 'False') {
            console.log("I couldn't find the movie you were looking for. Here is Mr. Nobody");
            logOMDBData("Mr. Nobody");
        }
        else {
            let output = "Title: " + response.data.Title;
            output += "\nReleased: " + response.data.Year;
            output += "\nIMDB rating: " + response.data.imdbRating;
            const rottenRating = response.data.Ratings.filter(rating => rating.Source.includes("Rotten Tomatoes"))[0];
            if(rottenRating) {
                output += "\nRotten Tomatoes Rating: " + rottenRating.Value;
            }
            else {
                output += "\nRotten Tomatoes Rating: N/A";
            }
            output += "\nLanguage: " + response.data.Language;
            output += "\nPlot: " + response.data.Plot;
            output += "\nActors: " + response.data.Actors;
            
            // Log to console and log.txt
            console.log(output);
            logToFile("movie-this", query, output);
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
            fs.appendFile("log.txt", "do-what-it-says\n", error => {
                if(error) throw error;
            });
            runCommand(command, query);
        }
    });
}

// Append command and its result to log.txt
function logToFile(command, searchTerm, result) {
    const output = command + " " + searchTerm.replace("+", " ") + "\n" + result + "\n\n" + new Array(75).join("=") + "\n\n";
    fs.appendFile("log.txt", output, error => {
        if(error) throw error;
    });
}