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

// Perform an action based on the command from the user.
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
        break;
    // Search for movies
    case "movie-this":
        movieThis();
        break;
    // Read from the random.txt file
    case "do-what-it-says":
        // doThis();
        break;
    default:
        console.log("You have not entered a valid command. Please try again.");
}

// Query the Bands in Town API with the user's search query.
function concertThis() {
    // First find the band, then search for events.
    var bandURL = "https://rest.bandsintown.com/artists/" + searchQuery + "?app_id=codingbootcamp";

    axios({
        method: "get",
        url: bandURL,
    }).then(function (response) {
        // If the band doesn't exist in the Bands in Town database...
        if (response.data === '') {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, \"" + searchQuery + "\" doesn't seem to exist. Try rewording your search.");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // If the band does exist in the Bands in Town database...
        } else {
            // Search for their events using their band name.
            searchQuery = response.data.name;
            var queryURL = "https://rest.bandsintown.com/artists/" + searchQuery + "/events?app_id=codingbootcamp";

            axios({
                method: "get",
                url: queryURL,
            }).then(function (response) {
                formatConcertData(response.data);
            }).catch(function (err) {
                axiosError(err);
            });
        }
    }).catch(function (err) {
        axiosError(err);
    });
}

// Format the data received from the Bands in Town API.
function formatConcertData(theEvents) {
    // Bands in Town couldn't find a band...
    if (theEvents === "\n{warn=Not found}\n") {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: I'm sorry, I couldn't find \"" + searchQuery + "\". Try again.");
        console.log("For more information, you can find the error logs in logs.txt.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // If Bands in Town doesn't have any events for a band...
    } else if (theEvents.length < 1) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: " + searchQuery + " doesn't have any upcoming events!");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // If we received a response with data from Bands in Town...
    } else {
        // console.log(theEvents);
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        console.log("Upcoming events for " + searchQuery + ":");
        for (var i = 0; i < theEvents.length; i++) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
            console.log("Venue Name: " + theEvents[i].venue.name);
            var location = theEvents[i].venue.city;
            // If the venue has a region, add it to the location. Otherwise, omit it because it is just ''.
            if (theEvents[i].venue.region !== '') {
                location += ", " + theEvents[i].venue.region;
            }
            location += ", " + theEvents[i].venue.country;
            console.log("Venue Location: " + location);
            console.log("Event Time: " + theEvents[i].datetime);
        }
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    }
}

// Query the Spotify API with the user's search query.
function spotifyThis() {
    spotify.search({
        type: "track",
        query: searchQuery
    }, function (err, response) {
        // If we receive an error from the Spotify API...
        if (err) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: Hmmmm, there's something wrong with that search. Try again.");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            // ********* Send this to log.txt *************
            return console.log(err);
        }
        formatSpotifyData(response.tracks.items);
    });
}

// Format the data received from the Spotify API.
function formatSpotifyData(theSongs) {
    // If Spotify couldn't find any songs with the search...
    if (theSongs.length < 1) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: \"" + searchQuery + "\" didn't result in any songs from Spotify!");
        console.log("You should try listening to \"The Sign\" by Ace of Base.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // If we received a response with data from Spotify...
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

// Query the OMDB API with the user's search query.
function movieThis() {
    var queryURL;

    // If the user didn't search for anything, search for Mr. Nobody.
    if (searchQuery === undefined) {
        queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=mr.nobody";
        // Otherwise, search for the user's query.
    } else {
        queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=" + searchQuery;
    }

    axios({
        method: "get",
        url: queryURL,
    }).then(function (response) {
        formatMovieData(response.data);
    }).catch(function (err) {
        axiosError(err);
    });
}

// Format the data received from the OMDB API.
function formatMovieData(theMovie) {
    // If OMDB returns a "False" response...
    if (theMovie.Response === "False") {
        // If the error was that the moview was not found...
        if (theMovie.Error === "Movie not found!") {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: \"" + searchQuery + "\" didn't result in any movies from OMDB!");
            console.log("Try rewording your search.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            // If there was some other error...
        } else {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: \"" + searchQuery + "\" resulted in an error from OMDB.");
            console.log("Try rewording your search. For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        }
        // If we received a "True" response from OMDB...
    } else {

        // Retrieve the IMDB and Rotten Tomatoes ratings, if they are part of the response.
        var imdb;
        var rottenTomatoes;
        if (theMovie.Ratings.length > -1) {
            for (var i = 0; i < theMovie.Ratings.length; i++) {
                if (theMovie.Ratings[i].Source === "Internet Movie Database") {
                    imdb = theMovie.Ratings[i].Value;
                } else if (theMovie.Ratings[i].Source === "Rotten Tomatoes") {
                    rottenTomatoes = theMovie.Ratings[i].Value;
                }
            }
        }

        // Console log the response from Liri
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        if (searchQuery === undefined) {
            console.log("Liri Says: You didn't search for a movie title, so here's a suggestion...");
        } else {
            console.log("Result for your search, \"" + searchQuery + "\":");
        }
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

        // Console log the movie information
        console.log("Title: " + theMovie.Title);
        console.log("Release Year: " + theMovie.Year);
        // If the IMDB rating was not found...
        if (imdb === undefined) {
            console.log("IMDB Rating: No rating was found.");
        } else {
            console.log("IMDB Rating: " + imdb);
        }
        // If the Rotten Tomatoes rating was not found...
        if (rottenTomatoes === undefined) {
            console.log("Rotten Tomatoes Rating: No rating was found.");
        } else {
            console.log("Rotten Tomatoes Rating: " + rottenTomatoes);
        }
        console.log("Produced In: " + theMovie.Country);
        console.log("Language(s): " + theMovie.Language);
        console.log("Plot: " + theMovie.Plot);
        console.log("Actor(s): " + theMovie.Actors);
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    }
}

// Handle the error response from Axios.
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
