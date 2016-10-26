/**
 *  @fileOverview Main JavaScript source for WhatEver? food finder app.
 *
 *  Basic layout of file follows basic layout of application:
 *                      Spinner
 *  Help  Location  Settings  Camera  Directions  Exit
 */

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
var gaFoodTypes = ['Mexican','Thai','Japanese'];
var gFoodTypeIndex = null;

/**
 *  Global data from the camera modal.
 *  @type {object[]}    Array of objects describing the restaurants for the pictures.
 */
var gaPictures = [];

/**
 *  onSpin - This is currently not a spinner, but it will eventually be.
 */
function onSpin() {
    console.log('onSpin called');
    // TODO: Add some animation for the spinner.

    // Select a random food type from the gaFoodTypes[] array.
    gFoodTypeIndex = Math.floor(Math.random()* gaFoodTypes.length);
    return $('#display-food-type').text(gaFoodTypes[gFoodTypeIndex]);
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

    // TODO: Show the modal div for selecting a zip code or the current location.
    $('#location-modal-wrapper').addClass('display');
}

/**
 *  locationRequest - Start the AJAX call to get geolocation information.
 */
function locationRequest() {
    console.log('locationRequest');
}

/**
 *  locationError - Handle error callback for getting geolocation information.
 */
function locationError() {
    console.warn('locationError');
}

/**
 *  locationSuccess - Handle success callback for getting geolocation information.
 */
function locationSuccess() {
    console.log('locationSuccess');
}

/**
 *  onSettingsButton
 */
function onSettingsButton() {
    console.log('onSettingsButton');

    // TODO: Show the modal div for selecting which types of food to select from.
    $('#settings-modal-wrapper').addClass('display');

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
 *  restaurantRequest - Start the AJAX call to get restaurant information.
 */
function restaurantRequest() {
    console.log('restaurantRequest');
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
}

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

});
