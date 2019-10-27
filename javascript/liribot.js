require("dotenv").config(); // Read and set environment variables using the dotenv node library
var Spotify = require("node-spotify-api"); // Loading the Spotify node library
var moment = require("moment"); // Loading the moment node library
var axios = require("axios"); // Loading the axios node library
var keys = require("./keys.js"); // Loading the API keys from a separate file

var spotify = new Spotify(keys.spotify);

var command = process.argv[2]; // Grab the command from the user input

// If there is anything else after the first user argument, grab it.
if (process.argv.length > 3) {
    var searchQuery = process.argv.slice(3).join(" ");
}

switch (command) {
    case "concert-this":
        // Search for concerts
        concertThis();
        break;
    case "spotify-this-song":
        // Search for artists
        spotifyThis();
        // console.log("You said spotify-this-song.");
        break;
    case "movie-this":
        // Search for movies
        // movieThis();
        console.log("You said movie-this.");
        break;
    case "do-what-it-says":
        // Read from the random.txt file
        // doThis();
        console.log("You said do-what-it-says.");
        break;
    default:
        console.log("You have not entered a valid command. Please try again.");
}

function concertThis() {
    var queryURL = "https://rest.bandsintown.com/artists/" + searchQuery + "/events?app_id=codingbootcamp";

    axios({
        method: "get",
        url: queryURL,
    }).then(function (response) {
        formatConcertData(response.data);
    }).catch(function (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            if (error.response.status === 404) {
                console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                console.log("Liri Says: I'm sorry, I couldn't find that band. Try again.");
                console.log("For more information, you can find the error logs in logs.txt.");
                console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            }

            // console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, it looks like Bands in Town is unreachable. Try again later.");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            
            // console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: Hmmmm, there's something wrong with that search. Perhaps try rewording it?");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            
            // console.log('Error', error.message);
        }
        // console.log(error.config);
    });
}

function formatConcertData(theEvents) {
    if (theEvents === "\n{warn=Not found}\n") {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: I'm sorry, I couldn't find that band. Try again.");
        console.log("For more information, you can find the error logs in logs.txt.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    }
}

function spotifyThis() {
    spotify.search({
        type: "track",
        query: searchQuery
    }, function (err, response) {
        if (err) {
            return console.log("An error occurred: " + err);
        }
        console.log(response.tracks.items);
    });
}

