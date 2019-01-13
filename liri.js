// Include modules
require("dotenv").config();
const Spotify = require("node-spotify-api");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

// Gets API keys from .env file
const keys = require("./keys.js");
const spotify = new Spotify(keys.spotify);
const bandsInTownID = keys.bandsInTown.id;
const omdbID = keys.omdb.id;

// Get command to run from arguments
const command = process.argv[2];

// Get the rest of the elements in process.argv and join them with "+" to build our query for API calls
const query = process.argv.slice(3).join("+");

// Define Command class
class Command {
    constructor(run) {
        this.run = run;
    }
}

// Define commands
const commands = {
    "spotify-this-song": new Command(logSpotifySongData),
    "movie-this": new Command(logOMDBData),
    "concert-this": new Command(logBandsInTownData),
    "do-what-it-says": new Command(doWhatItSays)
}

// Use arguments to run a command
if(commands[command]) {
    commands[command].run(query);
}
else {
    printUsage();
}

// Use node-spotify-api to log song data
function logSpotifySongData(query) {
    if(!query) {
        query = "The Sign Ace of Base";
    }
    spotify.search({type: 'track', query: query, limit: 1}).then(response => {
        if(response.tracks.items.length < 1) {
            throw "I couldn't find the song you were looking for.";
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
    }).catch(error => {
        console.log(error);
    });
}

// Use axios to log concert data for a band
function logBandsInTownData(query) {
    if(!query) {
        query = "Red Hot Chili Peppers";
    }
    axios.get("https://rest.bandsintown.com/artists/" + query + "/events?app_id=" + bandsInTownID).then(response => {
        if(!Array.isArray(response.data) || response.data.length < 1) {
            throw "I couldn't find concerts for the band you were looking for.";
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
    }).catch(error => {
        console.log(error);
    });
}

// Use axios to log movie data
function logOMDBData(query) {
    if(!query) {
        query = "Mr. Nobody";
    }
    axios.get("http://www.omdbapi.com/?t=" + query + "&plot=short&apikey=" + omdbID).then(response => {
        if(response.data.Response === 'False') {
            throw "I couldn't find the movie you were looking for.";
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
    }).catch(error => {
        console.log(error);
    });
}

// Run command located in random.txt
function doWhatItSays(fileName) {
    if(!fileName) {
        fileName = "random.txt";
    }
    try {
        fs.readFile(fileName, "utf8", (error, data) => {
            if(error) throw error;
            const dataArr = data.split(",");
            const command = dataArr[0];
            const query = dataArr[1];
            if(command !== "do-what-it-says") { // We don't ever want to run this command because it will loop forever
                fs.appendFile("log.txt", "do-what-it-says\n", error => {
                    if(error) throw error;
                });
                commands[command].run(query);
            }
        });
    }
    catch(error) {
        console.log(error);
    }
}

// Append command and its result to log.txt
function logToFile(command, searchTerm, result) {
    // Build presentable output to append by adding the command, searchTerm with + replaced by spaces, the result, and a divider
    const output = command + " " + searchTerm.replace(/\+/g, " ") + "\n" + result + "\n\n" + new Array(75).join("=") + "\n\n";
    try {
        fs.appendFile("log.txt", output, error => {
            if(error) throw error;
        });
    }
    catch(error) {
        console.log(error);
    }
}

// Print information on how to use commands to console
function printUsage() {
    console.log("USAGE:");
    console.log("node liri.js concert-this <artist/band name here>");
    console.log("node liri.js spotify-this-song <song name here>");
    console.log("node liri.js movie-this <movie name here>");
    console.log("node liri.js do-what-it-says");
}