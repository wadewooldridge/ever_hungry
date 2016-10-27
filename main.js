/**
 *  @fileOverview Main JavaScript source for WhatEver? food finder app.
 *
 *  Basic layout of file follows basic layout of application:
 *                      Spinner
 *  Help  Location  Settings  Camera  Directions  Exit
 */
/**
 *  @type {string[]}    Valid food types (categories).
 */
var gaValidFoodTypes = ['barbecue', 'burgers', 'italian', 'mediterranean', 'mexican', 'pizza', 'sandwiches',
                        'seafood', 'sushi', 'thai'];

/**
 *  Global data from the location modal.
 *  @type {boolean}     True for use current location, false for use zip code.
 *  @type {object}      Object for current location (contains latitude and longitude).
 *  @type {string}      String with current zip code.
 */
var gUseCurrentLocation = false;
var gCurrentLocation = null;
var gZipCode = null;

/**
 *  Global data from the settings modal for selecting food types.
 *  @type {object[]}    Array of valid food types.
 *  @type {number}      Current index in the array.
 */
var gFoodTypesConfigured = false;
var gaFoodTypes = [];
var gFoodTypeIndex = null;

/**
 *  Global data from the spin and restaurant search.
 */
var gaRestaurants = [];

var map;
var infowindow;


/**
 *  Global data from the camera modal.
 *  @type {object[]}    Array of objects describing the restaurants for the pictures.
 */
var gaPictures = [];

/**
 *  onSpin - This is currently not a spinner, but it will eventually be.
 */
function onSpin() {
    console.log('onSpin');

    // TODO: Add some animation for the spinner.

    // Select a random food type from the gaFoodTypes[] array.
    gFoodTypeIndex = Math.floor(Math.random()* gaFoodTypes.length);
    $('#display-food-type').text(gaFoodTypes[gFoodTypeIndex]);

    // Call the restaurant lookup to start the next part of the process.
    initMap(gaFoodTypes[gFoodTypeIndex]);
}

/**
 *  onHelpButton
 */
function onHelpButton() {
    console.log('onHelpButton');

    // TODO: Show the modal div for the initial help page.
    $('#help-modal-wrapper').addClass('display');
}

/**
 *  Button handlers for navigating the help menu.
 */
function onHelpPreviousButton() {
    console.log('onHelpPreviousButton');
}

function onHelpNextButton() {
    console.log('onHelpNextButton');
}

function onHelpExitButton() {
    console.log('onHelpExitButton');
}

/**
 *  onLocationButton
 */
function onLocationButton() {
    console.log('onLocationButton');
    $('#location-modal-wrapper').addClass('display');
    // TODO: Show the modal div for selecting a zip code or the current location.
    }

/**
 *  locationRequest - Start the AJAX call to get geolocation information.
 */

//first ajax call to get longitude and latitude from current location
function locationRequestCurrent(){
    $.ajax({
        url: 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCJClzDDzSQKXcCAw9UlCm2C8L4ypBj-tg',
        dataType: 'json',
        method: 'post',
        success: locationSuccessCurrent,
        error: locationErrorCurrent
        }
    )
}
/**
 *  locationError - Handle error callback for getting geolocation information.
 */
function locationErrorCurrent(){
    console.log('locationErrorCurrent');
}

/**
 *  locationSuccess - Handle success callback for getting geolocation information.
 *  @param {object} data    Data returned from API.
 */
function locationSuccessCurrent(data){
    console.log('locationSuccessCurrent');
    console.log(data.location);
    gCurrentLocation = data.location;
}

/**
 *  locationRequest - Start the AJAX call to get geolocation information.
 */
//second ajax call to get longitude and latitude from a zip code
function locationRequestZip() {
    console.log('locationRequest called');
    var userInput = $('.userZip').val();
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAs52LcfkFdoztNiIHaSzj14C_td0CSK3w&address=' + userInput,
        dataType: 'json',
        method: 'post',
        success: locationSuccessZip,
        error: locationErrorZip
        }
    )
}
/**
 *  locationError - Handle error callback for getting geolocation information.
 */
function locationErrorZip() {
    console.warn('locationErrorZip');
}

/**
 *  locationSuccess - Handle success callback for getting geolocation information.
 *  @param {object} data    Data returned from API.
 */
function locationSuccessZip(data) {
    console.log('locationSuccessZip');
    var userZipcode = data.results[0].geometry.location;
    console.log(userZipcode);
    gZipCode = userZipcode;
}

/**
 *  onSettingsButton
 */
function onSettingsButton() {
    console.log('onSettingsButton');
    var wrapperElem = $('#settings-modal-wrapper');

    // TODO: Load the last settings from localStorage.

    // Go through gaValidFoodTypes and set the checkboxes on the settings-modal.
    if (!gFoodTypesConfigured) {
        // Add checkboxes for each valid type of food.
        for (var i = 0; i < gaValidFoodTypes.length; i++) {
            var pElem = $('<p>');
            pElem.append($('<input>', {type: 'checkbox', checked: 'checked', id: 'checkbox' + i}));
            pElem.append($('<label>').html('&nbsp;' + gaValidFoodTypes[i]));
            wrapperElem.append(pElem);
        }

        // Add the OK button.
        var buttonElem = $('<button>').text('OK').click(onSettingsOkButton);
        wrapperElem.append(buttonElem);
    }

    gFoodTypesConfigured = true;

    // Display the settings modal.
    wrapperElem.addClass('display');

    // TODO: Save the settings to localStorage.

}

/**
 *  onSettingOkButton - Save settings after the user clicks OK on the setting modal.
 */
function onSettingsOkButton() {
    console.log('onSettingsOkButton');
    $('#settings-modal-wrapper').removeClass('display');
    gaFoodTypes = [];

    // Check each checkbox in turn.
    for (var i = 0; i < gaValidFoodTypes.length; i++) {
        var checked = $('#checkbox' + i).prop('checked');

        if (checked) {
            gaFoodTypes.push(gaValidFoodTypes[i]);
        }
    }
    // console.log('onSettingsOkButton: ' + gaFoodTypes);
}

/**
 *  onCameraButton
 */
function onCameraButton() {
    console.log('onCameraButton');

    // TODO: Show the modal div for the images.
    $('#camera-modal-wrapper').addClass('display');

    // TODO: Kick off photo lookup for the restaurants.

}

/**
 *  initMap - Create the Google map to search for matching local restaraunts.
 *  @param {string} food    Food type to search for, e.g. 'mexican'.
 */
function initMap(food) {
    var pyrmont = {lat: 33.6305353, lng: -117.74319};

    map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 15
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: pyrmont,
        rankBy: google.maps.places.RankBy.DISTANCE,
        types: ['food'],
        keyword:food
    }, restaurantCallback);
}

/**
 *  restaurantError - Handle error callback for getting restaurant information.
 */
function restaurantError() {
    console.warn('restaurantError');
}

/**
 *  restaurantSuccess - Handle success callback for getting restaurant information.
 */
function restaurantSuccess() {
    console.log('restaurantSuccess');
    restaurantClearDisplay();
    restaurantDisplay();
}

/**
 *  restaurantClearDisplay - Remove any old restaurants from the DOM.
 */
function restaurantClearDisplay() {
    console.log('restaurantClearDisplay');
    $('.restaurant').remove();
}
/**
 *  restaurantDisplay - Update the DOM with the restaurants in gaRestaurants.
 */
function restaurantDisplay() {
    console.log('restaurantDisplay');
    var count = Math.min(gaRestaurants.length, 5);
    var containerElem = $('.wheel-right');

    for (var i = 0; i < count; i++) {
        var r = gaRestaurants[i];
        var restaurantElem = $('<div>').addClass('restaurant');
        restaurantElem.append($('<p>').addClass('restaurant-name').text(r.name));
        restaurantElem.append($('<p>').text(r.address));
        containerElem.append(restaurantElem);
    }
}

/**
 * restaurantCallback - Called from Google maps when we get restaurant data.
 * @param {object[]}    results
 * @param {boolean}     status  // TODO: Check this status?
 */
function restaurantCallback(results, status) {
    console.log('restaurantCallback: ' + results);
    gaRestaurants=[];
    for (var i=0;i<5;i++){
        var restaurant={};
        restaurant.name=results[i].name;
        restaurant.address=results[i].vicinity;
        gaRestaurants.push(restaurant);
    }
    if(gaRestaurants.length!==0)
        restaurantSuccess();
    else{
        restaurantError();
    }
    /*
     if (status === google.maps.places.PlacesServiceStatus.OK) {
     for (var i = 0; i < results.length; i++) {
     createMarker(results[i]);
     }
     }*/
}
/*
 function createMarker(place) {
 var placeLoc = place.geometry.location;
 var marker = new google.maps.Marker({
 map: map,
 position: place.geometry.location
 });
 google.maps.event.addListener(marker, 'click', function() {
 infowindow.setContent(place.name);
 infowindow.open(map, this);
 });
 }
 */


/**
 *  onDirectionsButton
 */
function onDirectionsButton() {
    console.log('onDirectionsButton');

    // TODO: Show the modal div for directions.
    $('#directions-modal-wrapper').addClass('display');

}

/**
 *  directionsRequest - Start the AJAX call to get directions information.
 */
function directionsRequest() {
    console.log('directionsRequest');
}

/**
 *  directionsError - Handle error callback for getting directions information.
 */
function directionsError() {
    console.warn('directionsError');
}

/**
 *  directionsSuccess - Handle success callback for getting directions information.
 */
function directionsSuccess() {
    console.log('directionsSuccess');
}

/**
 *  onExitButton
 */
function onExitButton() {
    console.log('onExitButton');

    // TODO: Show the modal div for 'Are you sure?'  Exit if so.
    $('#exit-modal-wrapper').addClass('display');

}

/**
 *  Document ready.
 */
$(document).ready(function () {
    console.log('Document ready');
    // Attach click handler for the main spin button.
    $('#spin-button').click(onSpin);
    // Attach click handlers for the bottom menu buttons.
    $('.help-button').click(onHelpButton);
    $('.location-button').click(onLocationButton);
    $('.settings-button').click(onSettingsButton);
    $('.camera-button').click(onCameraButton);
    $('.directions-button').click(onDirectionsButton);
    $('.exit-button').click(onExitButton);

    // Attach click handlers for the help modal.
    $('.help-previous-button').click(onHelpPreviousButton);
    $('.help-next-button').click(onHelpNextButton);
    $('.help-exit-button').click(onHelpExitButton);

    //click handlers for the location module
    $('#buttonLocationCurrent').click(locationRequestCurrent);
    $('#buttonLocationZip').click(locationRequestZip);
});
