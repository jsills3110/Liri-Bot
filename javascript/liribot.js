require("dotenv").config(); // Read and set environment variables using the dotenv node library
var Spotify = require("node-spotify-api"); // Loading the Spotify node library
var moment = require("moment"); // Loading the moment node library
var axios = require("axios"); // Loading the axios node library
var keys = require("./keys.js"); // Loading the API keys from a separate file

var spotify = new Spotify(keys.spotify);

var command = process.argv[2]; // Grab the command from the user input

console.log(command);

// If there is anything else after the first user argument, grab it.
if (process.argv.length > 3) {
    var searchQuery = process.argv.slice(3).join(" ");
    console.log(searchQuery);
}

switch (command) {
    case "concert-this":
        // Search for concerts
        concertThis();
        // console.log("You said concert-this.");
        break;
    case "spotify-this-song":
        // Search for artists
        spotifyThis();
        console.log("You said spotify-this-song.");
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
    console.log(queryURL);

    axios({
        method: "get",
        url: queryURL,
    }).then(function(response) {
        console.log(response.data);
    });
}

function spotifyThis() {
    spotify.search({
        type: "track",
        query: searchQuery
    }, function(err, response) {
        if (err) {
            return console.log("An error occurred: " + err);
        }
        console.log(response.tracks.items);
    });
}

