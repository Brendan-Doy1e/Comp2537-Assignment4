// Array that stores the names of all the pokemon
let pokeName = [];
// Difficulty is set to easy by default
let difficulty = 0;
// Array that stores the difficulty settings and the time limit for each difficulty
let difficultyArray = [{cards:5, time:120}, {cards:7, time:120}, {cards:10, time:120}];
// Variables that store the timer and the pair manager
var timer, pairStats;
// Variable that stores the number of clicks the user has made
var clickCount = 0;
// Variable that stores whether or not the user has activated the power up
var poweredUp = false;


// fetches the names of all the pokemon from the pokeapi
const setup = async () => {
    try {
        let fetch = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=493');
        pokeName = fetch.data.results;
    } catch (error) {
        console.error(error);       
    }
}


// flips the cards over when you lose the game or when you get a powerup
function flipOver(timeLimit){
    //keeps track of each click made by the user
    clickCount = 0;
    // displays the number of clicks made by the user
    $('#clickCounter').empty().append(`Total Clicks: ${clickCount}`);
    // clears the timer and the pair manager
    clearInterval(timer);
    // sets the exact time when the game started
    var startTime = Date.now();
    //sets the time elapsed since the game started to 0
    var timeElapsed = 0;
    // displays the timer
    $('#timer').empty().append(`<h3>Timer: 0 / ${timeLimit}</h3>`);
    // starts the timer
    timer = setInterval(() => {
        // calculates the time elapsed since the game started
        timeElapsed = (Date.now() - startTime) / 1000;
        // displays the time elapsed
        $('#timer').empty().append(`<h3>Timer: ${Math.floor(timeElapsed)} / ${timeLimit}</h3>`);
        // if the time elapsed is greater than the time limit, the user loses the game
        if (timeElapsed >= timeLimit){
            // message that you lost the game
            alert('Try again!');
            // resets the game to the default settings
            resetGame();
        }
        // if the time remaining is less than 1 minute, the user gets a powerup
        var timeRemaining = timeLimit - timeElapsed;
        if (timeRemaining > 57 && timeRemaining <= 60){
            powerUp();
        }
    }, 1000)
}


// starts the game when the user clicks the start button
async function start(){
    // gets the number of cards for the difficulty selected
    var cardNum = difficultyArray[difficulty].cards;
    // sets the number of pairs matched to 0
    var pairsMatched = 0;
    // gets the time limit for the difficulty selected
    var timeLimit = difficultyArray[difficulty].time;
    // creates a local array that stores the pokemon that will be used in the game
    var pokemon = [];
    //gets pokemon from the pokeapi and adds them to the local array to be used in the upcoming game
    for (var i = 0; i < cardNum; i++){
        // gets a random pokemon from the pokeapi
        var index = Math.floor((Math.random() * pokeName.length));
        // adds the pokemon to the local array twice
        pokemon.push(pokeName[index]);
        pokemon.push(pokeName[index]);
    }
    // loads the cards onto the game board
    await loadCards(pokemon);
    // flips the cards over when the timer runs out
    flipOver(timeLimit);


    // displays the stats of the game and whether or not the user has won, reseting the game if the user has won
    pairStats = setInterval(() => {
        var html = `
            <div>Total Pairs: ${cardNum}</div>
            <div>Matched: ${pairsMatched}</div>
            <div>Remaining: ${cardNum - pairsMatched}</div>
            <div>Clicks: ${clickCount}</div>`
        // displays the stats of the game on the game board
        $('#pairStats').empty().append(html);
        // if the user has matched all the pairs, the user wins the game
        if (pairsMatched >= cardNum){
            // message that you won the game
            alert('You Won!');
            // resets the game to the default settings
            resetGame();
        }
    }, 100) 
    


    let firstCard = undefined;
    let secondCard = undefined;
    var inProgress = false;

    // when the user clicks on a card, the card flips over
    $('.card').on('click', function() {
        // if the user has a power up the cards will not flip over
        if (poweredUp) {return;}
        // if the first card has not been selected, the first card is selected and flipped over
        if (firstCard == undefined){
            firstCard = $(this).find(".front")[0];
            $(this).toggleClass('flip');
        // if the second card has not been selected and it is not the first card, the second card is selected and flipped over
        } else if (secondCard == undefined && $(this).find(".front")[0] != firstCard){
            secondCard = $(this).find(".front")[0];
            $(this).toggleClass('flip');
        }
        // if the first and second card have been selected, the cards are compared to see if they match
        if (firstCard && secondCard && !inProgress){
            // if they match, the cards are removed from the game board and the number of pairs matched is increased by 1 and the first and second card are reset
            if (firstCard.src == secondCard.src){
                $(`#${firstCard.id}`).parent().off("click");
                $(`#${firstCard.id}`).parent().css({'background-color': 'green'});
                $(`#${secondCard.id}`).parent().off("click");
                $(`#${secondCard.id}`).parent().css({'background-color': 'green'});
                firstCard = undefined;
                secondCard = undefined;
                pairsMatched++;
            // if they do not match, the cards are flipped back over and the first and second card are reset
            } else {
                // sets the inProgress variable to true so that the user cannot click on other cards while the cards are being flipped back over
                inProgress = true;
                $(`#${firstCard.id}`).parent().css({'background-color': 'red'});
                $(`#${secondCard.id}`).parent().css({'background-color': 'red'});
                // sets a timeout so that the user can see the cards before they are flipped back over
                setTimeout(() => {
                    $(`#${firstCard.id}`).parent().toggleClass("flip");
                    $(`#${secondCard.id}`).parent().toggleClass("flip");
                    $(`#${secondCard.id}`).parent().css({'background-color': 'white'});
                    $(`#${firstCard.id}`).parent().css({'background-color': 'white'});
                    // resets the first and second card and sets the inProgress variable to false so that the user can click on other cards
                    firstCard = undefined;
                    secondCard = undefined;
                    inProgress = false;
                // sets the timeout to 2 seconds
                }, 2000)
            }
        }
    })
}


// Loads the cards onto the game board in a random order
async function loadCards(pokemon){
    // empties the game board of any cards
    $('#gamespace').empty();

    // gets the pokemon from the pokeapi and adds them to the game board in a random order
    while (pokemon.length != 0){
        var i = Math.floor((Math.random() * pokemon.length));
        var givenPokemon = await axios.get(pokemon[i].url);
        // creates a card with the pokemon's image on the front and a pokeball on the back
        var card = `<div class="card">
                        <img src="${givenPokemon.data.sprites.front_default}" class="front" id="${givenPokemon.data.name + pokemon.length}">
                        <img src="/public/Poke_Ball.webp" class="back">
                    </div>`
        // adds the card to the game board and removes the pokemon from the local array
        $('#gamespace').append(card);
        pokemon.splice(i, 1);
    }
}


// Sets the difficulty of the game and selects the difficulty button
function selectDifficulty(buttonId) {
    // removes the selected class from all the difficulty buttons and adds it to the button that was clicked
    $('#easy, #medium, #hard').removeClass('selected');
    // adds the selected class to the button that was clicked
    $(buttonId).addClass('selected');
}


// sets the difficulty of the game to easy
$('#easy').on('click', function() {
    difficulty = 0;
    // selects the difficulty button for styling to easy
    selectDifficulty('#easy');
})


// sets the difficulty of the game to medium
$('#medium').on('click', function() {
    difficulty = 1;
    // selects the difficulty button for styling to medium
    selectDifficulty('#medium');
})


// sets the difficulty of the game to hard
$('#hard').on('click', function() {
    difficulty = 2;
    // selects the difficulty button for styling to hard
    selectDifficulty('#hard');
})



// starts the game when the start button is clicked
$('#start').on('click', () => {
    // calls the start function to start the game
    start();
})


// calls the reset when clicked, the game when the reset button is clicked and clears the timer, stats, and game board
$('#reset').on('click', resetGame);


// function to reset the game board and stats and clear the timer
function resetGame(){
    // clears the timer
    clearInterval(timer);
    // clears the stats
    clearInterval(pairStats);
    // empties the stats div
    $('#headsup').children().empty();
    // empties the game board
    $('#gamespace').empty();
}


// Keeps track of the number of number of clicks the user has made
$('#gamespace').on('click', () => {
    clickCount++;
    $('#clickCounter').empty().append(`Total Clicks: ${clickCount}`);
})


// changes the theme to dark mode when clicked
$('#darkmode').on('click', function() {
    $('body').removeClass('light-mode').addClass('dark-mode');
    $('button').removeClass('btn-light').addClass('btn-dark');
})


// changes the theme to light mode when clicked
$('#lightmode').on('click', function() {
    $('body').removeClass('dark-mode').addClass('light-mode');
    $('button').removeClass('btn-dark').addClass('btn-light');
})


// function for the power up that happens halfway through the game
function powerUp(){
    // if the power up has not been used yet, the power up is used
    if (!poweredUp) {
        // sets the poweredUp variable to true so that the power up cannot be used again until the power up is over
        poweredUp = true;
        // flips all the cards over for 3 seconds
        $('#gamespace').find('.card:not(.flip)').toggleClass('powered-up flip');
        // sets a timeout so that the cards are flipped back over after 3 seconds
        setTimeout(() => {
            // flips all the cards back over
            $('#gamespace').find('.powered-up').toggleClass('powered-up flip');
            // sets the poweredUp variable to false so that the power up can be used again
            poweredUp = false;
            // 3 seconds long so that the user can see the cards before they are flipped back over
        }, 3000)
    }
}


// sets up the game
$(document).ready(function(){
    setup();
    // set default difficulty to 'easy'
    difficulty = 0;
    selectDifficulty('#easy');
});
