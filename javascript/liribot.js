require("dotenv").config(); // Read and set environment variables using the dotenv node library
var Spotify = require("node-spotify-api"); // Loading the Spotify node library
var moment = require("moment"); // Loading the moment node library
var axios = require("axios"); // Loading the axios node library
var keys = require("./keys.js"); // Loading the API keys from a separate file
var fs = require("fs"); // Loading the file system library

var spotify = new Spotify(keys.spotify);

var command = process.argv[2]; // Grab the command from the user input
var searchQuery;
var responsesArray = [];
var newlineDivider = "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
var divider = "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";

// If there is anything else after the first user argument, grab it.
if (process.argv.length > 3) {
    searchQuery = process.argv.slice(3).join(" ");
}

function doCommand(theCommand, theSearch) {
    // Perform an action based on the command from the user.
    switch (theCommand) {
        // Search for concerts
        case "concert-this":
            if (theSearch === undefined) {
                var liri = "Liri Says: I'm sorry, but you'll have to tell me what band to search for.";
                
                responsesArray.push(newlineDivider);
                responsesArray.push(liri);
                responsesArray.push(divider);
                
                console.log(newlineDivider);
                console.log(liri);
                console.log(divider);
            } else {
                concertThis(theSearch);
            }
            break;
        // Search for artists
        case "spotify-this-song":
            if (theSearch === undefined) {
                var liri = "Liri Says: I'm sorry, but you'll have to tell me what song to search for.";
                
                responsesArray.push(newlineDivider);
                responsesArray.push(liri);
                responsesArray.push(divider);
                
                console.log(newlineDivider);
                console.log(liri);
                console.log(divider);
            } else {
                spotifyThis(theSearch);
            }
            break;
        // Search for movies
        case "movie-this":
            movieThis(theSearch);
            break;
        // Read from the random.txt file
        case "do-what-it-says":
            doThis();
            break;
        default:
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, I don't understand that. Please try again.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    }
}

// Query the Bands in Town API with the user's search query.
function concertThis(theBandSearch) {
    // First find the band, then search for events.
    var bandURL = "https://rest.bandsintown.com/artists/" + theBandSearch + "?app_id=codingbootcamp";

    axios({
        method: "get",
        url: bandURL,
    }).then(function (response) {
        // If the band doesn't exist in the Bands in Town database...
        if (response.data === '') {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: I'm sorry, \"" + theBandSearch + "\" doesn't seem to exist. Try rewording your search.");
            console.log("For more information, you can find the error logs in logs.txt.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            // If the band does exist in the Bands in Town database...
        } else {
            // Search for their events using their band name.
            theBandSearch = response.data.name;
            var queryURL = "https://rest.bandsintown.com/artists/" + theBandSearch + "/events?app_id=codingbootcamp";

            axios({
                method: "get",
                url: queryURL,
            }).then(function (response) {
                formatConcertData(response.data, theBandSearch);
            }).catch(function (err) {
                axiosError(err);
            });
        }
    }).catch(function (err) {
        axiosError(err);
    });
}

// Format the data received from the Bands in Town API.
function formatConcertData(theEvents, theBandName) {
    // Bands in Town couldn't find a band...
    if (theEvents === "\n{warn=Not found}\n") {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: I'm sorry, I couldn't find \"" + theBandName + "\". Try again.");
        console.log("For more information, you can find the error logs in logs.txt.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // If Bands in Town doesn't have any events for a band...
    } else if (theEvents.length < 1) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: " + theBandName + " doesn't have any upcoming events!");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // If we received a response with data from Bands in Town...
    } else {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        console.log("Upcoming events for " + theBandName + ":");
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
            console.log("Event Time: " + moment(theEvents[i].datetime).format('MM/DD/YYYY'));
        }
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    }
}

// Query the Spotify API with the user's search query.
function spotifyThis(theSongSearch) {
    spotify.search({
        type: "track",
        query: theSongSearch
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
        formatSpotifyData(response.tracks.items, theSongSearch);
    });
}

// Format the data received from the Spotify API.
function formatSpotifyData(theSongs, theSongQuery) {
    // If Spotify couldn't find any songs with the search...
    if (theSongs.length < 1) {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Liri Says: \"" + theSongQuery + "\" didn't result in any songs from Spotify!");
        console.log("You should try listening to \"The Sign\" by Ace of Base.");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        // If we received a response with data from Spotify...
    } else {
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        console.log("Results for your search, \"" + theSongQuery + "\":");
        for (var i = 0; i < theSongs.length; i++) {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
            console.log("Song Name: " + theSongs[i].name);
            console.log("Artist: " + theSongs[i].artists[0].name);
            console.log("Album: " + theSongs[i].album.name);
            // If there is no preview link available...
            if (theSongs[i].preview_url === null) {
                console.log("Preview Link: No preview available on Spotify.");
            } else {
                console.log("Preview Link: " + theSongs[i].preview_url);
            }
        }
        console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
    }
}

// Query the OMDB API with the user's search query.
function movieThis(theMovieSearch) {
    var queryURL;

    // If the user didn't search for anything, search for Mr. Nobody.
    if (theMovieSearch === undefined) {
        queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=mr.nobody";
        // Otherwise, search for the user's query.
    } else {
        queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=" + theMovieSearch;
    }

    axios({
        method: "get",
        url: queryURL,
    }).then(function (response) {
        formatMovieData(response.data, theMovieSearch);
    }).catch(function (err) {
        axiosError(err);
    });
}

// Format the data received from the OMDB API.
function formatMovieData(theMovie, theMovieQuery) {
    // If OMDB returns a "False" response...
    if (theMovie.Response === "False") {
        // If the error was that the moview was not found...
        if (theMovie.Error === "Movie not found!") {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: \"" + theMovieQuery + "\" didn't result in any movies from OMDB!");
            console.log("Try rewording your search.");
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            // If there was some other error...
        } else {
            console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log("Liri Says: \"" + theMovieQuery + "\" resulted in an error from OMDB.");
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
        if (theMovieQuery === undefined) {
            console.log("Liri Says: You didn't search for a movie title, so here's a suggestion...");
        } else {
            console.log("Result for your search, \"" + theMovieQuery + "\":");
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

function doThis() {
    var thingsToDo = [];
    fs.readFileSync('random.txt', 'utf-8').split(/\r?\n/).forEach(function (line) {
        thingsToDo.push(line);
    });

    for (var i = 0; i < thingsToDo.length; i++) {
        textCommand = thingsToDo[i].substring(0, thingsToDo[i].indexOf(","));
        textSearchQuery = thingsToDo[i].substring(thingsToDo[i].indexOf(",") + 1);

        if (textSearchQuery[0] === "\"") {
            textSearchQuery = textSearchQuery.substring(1);
        }
        if (textSearchQuery[textSearchQuery.length - 1] === "\"") {
            textSearchQuery = textSearchQuery.substring(0, textSearchQuery.length - 1);
        }

        doCommand(textCommand, textSearchQuery);
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

doCommand(command, searchQuery);
