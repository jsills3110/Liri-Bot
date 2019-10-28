require("dotenv").config(); // Read and set environment variables using the dotenv node library
var Spotify = require("node-spotify-api"); // Loading the Spotify node library
var moment = require("moment"); // Loading the moment node library
var axios = require("axios"); // Loading the axios node library
var keys = require("./keys.js"); // Loading the API keys from a separate file
var fs = require("fs"); // Loading the file system library

var spotify = new Spotify(keys.spotify);

var command = process.argv[2]; // Grab the command from the user input
var searchQuery;

// If there is anything else after the first user argument, grab it.
if (process.argv.length > 3) {
    searchQuery = process.argv.slice(3).join(" ");
}

switch (command) {
    // Search for concerts
    case "concert-this":
        if (searchQuery === undefined) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, but you'll have to tell me what band to search for.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            concertThis();
        }
        break;
    // Search for artists
    case "spotify-this-song":
        if (searchQuery === undefined) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, but you'll have to tell me what song to search for.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            spotifyThis();
        }
        // console.log("You said spotify-this-song.");
        break;
    // Search for movies
    case "movie-this":
        movieThis();
        break;
    // Read from the random.txt file
    case "do-what-it-says":
        // doThis();
        // console.log("You said do-what-it-says.");
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
    }).catch(function(err) {
        axiosError(err);
    });
}

function formatConcertData(theEvents) {
    if (theEvents === "\n{warn=Not found}\n") {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: I'm sorry, I couldn't find \"" + searchQuery + "\". Try again.");
        console.log("For more information, you can find the error logs in logs.txt.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    } else if (theEvents.length < 1) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: \"" + searchQuery + "\" doesn't have any upcoming events!");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    } else {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        console.log("Upcoming events for your search, \"" + searchQuery + "\":");
        for (var i = 0; i < theEvents.length; i++) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
            console.log("Venue Name: " + theEvents[i].venue.name);
            var location = theEvents[i].venue.city + ", " + theEvents[i].venue.region + ", " + theEvents[i].venue.country;
            console.log("Venue Location: " + location);
            console.log("Event Time: " + theEvents[i].datetime);
        }
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    }
}

function spotifyThis() {
    spotify.search({
        type: "track",
        query: searchQuery
    }, function (err, response) {
        if (err) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: Hmmmm, there's something wrong with that search. Try again.");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

            return console.log(err);
        }

        formatSpotifyData(response.tracks.items);
    });
}

function formatSpotifyData(theSongs) {
    if (theSongs.length < 1) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: \"" + searchQuery + "\" didn't result in any songs from Spotify!");
        console.log("You should try listening to \"The Sign\" by Ace of Base.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    } else {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        console.log("Results for your search, \"" + searchQuery + "\":");
        for (var i = 0; i < theSongs.length; i++) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
            console.log("Song Name: " + theSongs[i].name);
            console.log("Artist: " + theSongs[i].artists[0].name);
            console.log("Album: " + theSongs[i].album.name);
            console.log("Preview Link: " + theSongs[i].preview_url);
        }
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
    }
}

function movieThis() {
    if (searchQuery === undefined) {
        // Return Mr.Nobody
    } else {
        axios({
            method: "get",
            url: queryURL,
        }).then(function (response) {
            // console.log(response);
            formatConcertData(response.data);
        }).catch(function(err) {
            axiosError(err);
        });
    }
}

function axiosError(error) {
    // The request was made and the server responded with a status code that falls out of the range of 2xx.
    if (error.response) {
        if (error.response.status === 404) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, I couldn't find \"" + searchQuery + "\". Try again.");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, but the search returned a bad status code. Try again or reword your search.");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        }

        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);

        // The request was made but no response was received `error.request` is an instance of XMLHttpRequest in 
        // the browser and an instance of http.ClientRequest in node.js
    } else if (error.request) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: I'm sorry, it looks like the API I tried to use is unreachable. Try again later.");
        console.log("For more information, you can find the error logs in logs.txt.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

        // console.log(error.request);

        // Something happened in setting up the request that triggered an Error
    } else {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: Hmmmm, there's something wrong with that search. Perhaps try rewording it?");
        console.log("For more information, you can find the error logs in logs.txt.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

        // console.log('Error', error.message);
    }
    // console.log(error.config);
}
