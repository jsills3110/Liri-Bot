require("dotenv").config(); // Read and set environment variables using the dotenv node library
var Spotify = require("node-spotify-api"); // Loading the Spotify node library
var moment = require("moment"); // Loading the moment node library
var axios = require("axios"); // Loading the axios node library
var keys = require("./keys.js"); // Loading the API keys from a separate file

var spotify = new Spotify(keys.spotify);

var command = process.argv[2]; // Grab the command from the user input
var searchQuery;

// If there is anything else after the first user argument, grab it.
if (process.argv.length > 3) {
    searchQuery = process.argv.slice(3).join(" ");
}

switch (command) {
    case "concert-this":
        // Search for concerts
        if (searchQuery === undefined) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, but you'll have to tell me what band to search for.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            concertThis();
        }
        break;
    case "spotify-this-song":
        // Search for artists
        if (searchQuery === undefined) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, but you'll have to tell me what song to search for.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            spotifyThis();
        }
        // console.log("You said spotify-this-song.");
        break;
    case "movie-this":
        // Search for movies
        if (searchQuery === undefined) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, but you'll have to tell me what to search for.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            movieThis();
        }
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
        // console.log(response);
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
    } else if (theEvents.length < 1) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: This band doesn't have any upcoming events!");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    } else {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Upcoming events for your search, \"" + searchQuery + "\":");


        // for (var i = 0; i < theEvents.length; i++) {
        //     console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        //     console.log("Venue Name: " + theEvents[i].venue.name);
        //     var location = theEvents[i].venue.city + ", " + theEvents[i].venue.region + ", " + theEvents[i].venue.country;
        //     console.log("Venue Location: " + location);
        //     console.log("Event Time: " + theEvents[i].datetime);
        //     console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // }
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

