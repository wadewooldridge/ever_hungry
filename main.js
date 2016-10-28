/**
 *  @fileOverview Main JavaScript source for WhatEver? food finder app.
 *
 *  Basic layout of file follows basic layout of application:
 *                      Spinner
 *  Help  Location  Settings  Photos  Directions
 */
/**
 *  @type {string[]}    Valid food types (categories).
 */
var gaValidFoodTypes = ['american', 'barbecue', 'buffet', 'burgers', 'chinese', 'fast casual', 'fast food',
                        'indian', 'italian', 'mediterranean', 'mexican', 'pizza', 'pub', 'sandwiches',
                        'seafood', 'sushi', 'tapas', 'teppanyaki', 'thai', 'vegetarian'];

/**
 *  Global data for spinner.
 *  @type {boolean}     Which direction to spin.
 */
var gSpinRight = true;

/**
 *  Global data from the location modal.
 *  @type {object}      Object for current location (contains latitude and longitude).
 */
var gLocation = null;

/**
 *  Global data from the settings modal for selecting food types.
 *  @type {boolean[]}   Array of booleans of whether each food type is checked (enabled).
 *  @type {object[]}    Array of valid food types, filtered from the checkboxes.
 *  @type {number}      Current index in the array.
 */
var gLocalStorageKey = 'HungryEverSettings';
var gaFoodTypesChecked = [];
var gaFoodTypes = [];
var gFoodTypeIndex = null;

/**
 *  Global data from the spin and restaurant search.
 */
var gaRestaurants = [];

var map;
var infowindow;


/**
 *  Global data from the photo modal.
 *  @type {object[]}    Array of objects describing the restaurants for the pictures.
 */
var gaPictures = [];

/**
 *  photosRequest - Start the AJAX call to get photos' information.
 */
function photosRequest(latitude, longitude, foodType) {
    console.log('photosRequest');

    // Set default parameters if not passed.
    if (latitude === undefined || latitude === 0) {
        latitude = gLocation.lat;
    }
    if (longitude === undefined || longitude === 0) {
        longitude = gLocation.lng;
    }

    foodType = gaFoodTypes[gFoodTypeIndex];

    // Build the AJAX call to start the photo search.
    $.ajax({
        data: {
            method: 'flickr.photos.search',
            api_key: 'ae2be88898748811d752637d4c7235c5',
            format: 'json',
            text: foodType + '+food',
            // lat: latitude,
            // lon: longitude,
            has_geo: 1,
            media: 'photos',
            radius: 1,
            radius_unit: 'km',
            per_page: 20,
            page: 1,
            nojsoncallback: 1
        },
        url: 'https://api.flickr.com/services/rest',
        dataType: 'json',
        success: photosSuccess,
        error: photosError
    });
}
/**
 *  photosError - Handle error callback for getting photos information.
 */
function photosError() {
    console.warn('photosError');
}

/**
 *  photosSuccess - Handle success callback for getting photos information.
 */
function photosSuccess(pictures_data) {
    console.log('photosSuccess', pictures_data);
    gaPictures = pictures_data.photos.photo;
    $("#photos-modal-span").text("Searching...")
    setTimeout(function(){
        photosDisplay();
    },1000);

}

/**
 *  photosDisplay - Take the pictures from gaPictures and add them to the photos modal.
 */
function photosDisplay() {
    console.log('photosDisplay: count: ' + gaPictures.length);
    $("#photos-modal-span").text('')
    var containerElem = $("#photos-modal-wrapper");

    // Delete any existing pictures.
    containerElem.find('img').remove();

    // Add each picture in turn.
    for (var i = 0; i < gaPictures.length; i++) {
        var pic = gaPictures[i];
        var url = 'https://farm' + pic.farm + '.staticflickr.com/' + pic.server + '/' + pic.id +
                  '_' + pic.secret + '_q.jpg';
        containerElem.prepend($('<img>').attr('src', url));
    }
}

/*
 * createPhotoUrl - Take the pieces of a flickr photo object and create a valid photo URL
 */
function createPhotoUrl(){
    var url = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg'
}
/**
 *  onSpin - This is currently not a spinner, but it will eventually be.
 */
function onSpin() {
    console.log('onSpin');
    restaurantClearDisplay();
    // TODO: Add some animation for the spinner.
    // Make the wheel spin.
    spinWheel();
    // Select a random food type from the gaFoodTypes[] array.
    gFoodTypeIndex = Math.floor(Math.random()* gaFoodTypes.length);
    $('#display-food-type').text(gaFoodTypes[gFoodTypeIndex]);

    // Call the restaurant lookup to start the next part of the process.
    initMap(gaFoodTypes[gFoodTypeIndex]);
}

/**
 *  onHelpButton - Bring up the help modal.
 */
function onHelpButton() {
    console.log('onHelpButton');
    $('#help-modal-wrapper').toggle('drop', {direction: 'down'}, 1000).addClass('display');
}

/**
 *  onHelpOkButton - Close the help modal.
 */
function onHelpOkButton() {
    console.log('onHelpOkButton');
    $('#help-modal-wrapper').toggle('drop', {direction: 'down'}, 1000);
}

/**
 *  onLocationButton
 */
function onLocationButton() {
    console.log('onLocationButton');
    $('#location-modal-wrapper').toggle('drop', {direction: 'down'}, 1000);
}

/**
 *  onLocationOkButton
 */
function onLocationOkButton() {
    console.log('onLocationOkButton');
    $('#location-modal-wrapper').toggle('drop', {direction: 'down'}, 1000);
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
    gLocation = data.location;
}

/**
 *  locationRequest - Start the AJAX call to get geolocation information.
 */
//second ajax call to get longitude and latitude from a zip code
function locationRequestZip() {
    console.log('locationRequest');
    var userInput = $('.userZip').val();
    if (userInput === '') {
        console.log('locationRequest: empty zip code');
        return;
    }

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
    gLocation = userZipcode;
}

/**
 *  buildSettingsModal - Populate the settings modal based on gaValidFoodTypes.
 */
function buildSettingsModal() {
    console.log('buildSettingsModal');
    var wrapperElems = [$('#settings-left'), $('#settings-right')];

    for (var i = 0; i < gaValidFoodTypes.length; i++) {
        var wrapperElem = wrapperElems[(i < (gaValidFoodTypes.length / 2)) ? 0 : 1];
        var pElem = $('<p>');
        pElem.append($('<input>', {type: 'checkbox', checked: 'checked', id: 'checkbox' + i}));
        pElem.append($('<label>').html('&nbsp;' + gaValidFoodTypes[i]));
        wrapperElem.append(pElem);
    }

    // Add the OK button.
    wrapperElem = $('#settings-modal-wrapper')
    wrapperElem.append($('<br>'));
    wrapperElem.append($('<br>'));
    var buttonElem = $('<button>').text('>').click(onSettingsOkButton).attr('id','settings-ok-button');
    wrapperElem.append(buttonElem);
}

/**
 *  isLocalStorageSupported - returns true if browser supports localStorage functions.
 *  @returns {boolean} - true if supported.
 */
function isLocalStorageSupported() {
    return typeof(localStorage) !== 'undefined';
}

/**
 *  loadSettingsFromLocalStorage - Set checkboxes based on last settings.
 */
function loadSettingsFromLocalStorage() {
    console.log('loadSettingsFromLocalStorage');
    var retArray = null;
    var i;

    if (!isLocalStorageSupported()) {
        console.log('loadSettingsFromLocalStorage: not supported on this platform');
    } else {
        retArray = JSON.parse(localStorage.getItem(gLocalStorageKey));
    }

    // If it failed for either reason, or this is the wrong length, assume the settings are all enabled.
    if (retArray === null || retArray.length != gaValidFoodTypes.length) {
        console.log('loadSettingsFromLocalStorage: defaulting settings');
        gaFoodTypesChecked = [];

        for (i = 0; i < gaValidFoodTypes.length; i++) {
            gaFoodTypesChecked.push(true);
        }
    } else {
        console.log('loadSettingsFromLocalStorage: succeeded');
        gaFoodTypesChecked = retArray;
    }

    // Now take the current array and check/uncheck the boxes, and build the list of current types.
    for (i = 0; i < gaFoodTypesChecked.length; i++) {
       $('#checkbox' + i).prop('checked', gaFoodTypesChecked[i]);
        if (gaFoodTypesChecked[i]) {
            gaFoodTypes.push(gaValidFoodTypes[i]);
        }
    }
}

/**
 *  saveSettingsToLocalStorage - Save array of checkbox settings.
 */
function saveSettingsToLocalStorage() {
    console.log('saveSettingsToLocalStorage');
    if (!isLocalStorageSupported()) {
        return;
    }

    localStorage.setItem(gLocalStorageKey, JSON.stringify(gaFoodTypesChecked));
}


/**
 *  onSettingsButton
 */
function onSettingsButton() {
    console.log('onSettingsButton');
    var wrapperElem = $('#settings-modal-wrapper');

    // TODO: Load the last settings from localStorage.

    // Display the settings modal.
    wrapperElem.show('drop', {direction: 'down'}, 1000);

    // TODO: Save the settings to localStorage.

}

/**
 *  onSettingOkButton - Save settings after the user clicks OK on the setting modal.
 */
function onSettingsOkButton() {
    console.log('onSettingsOkButton');
    $('#settings-modal-wrapper').toggle('drop', {direction: 'down'}, 1000);
    gaFoodTypes = [];

    // Check each checkbox in turn.
    for (var i = 0; i < gaValidFoodTypes.length; i++) {
        var checked = $('#checkbox' + i).prop('checked');
        gaFoodTypesChecked[i] = checked;

        if (checked) {
            gaFoodTypes.push(gaValidFoodTypes[i]);
        }
    }
    // console.log('onSettingsOkButton: ' + gaFoodTypes);

    // Update local storage based on the settings selected.
    saveSettingsToLocalStorage();
}

/**
 *  onPhotosButton - Bring up the photos modal.
 */
function onPhotosButton() {
    console.log('onPhotosButton');

    // TODO: Show the modal div for the images.
    $('#photos-modal-wrapper').toggle('drop', {direction: 'right'}, 750).addClass('display');

    // TODO: Kick off photo lookup for the restaurants.

}

/**
 *  onPhotosOkButton - Close the help modal.
 */
function onPhotosOkButton() {
    console.log('onPhotosOkButton');
    $('#photos-modal-wrapper').toggle('drop', {direction: 'right'}, 750).removeClass('display');
}

/**
 *  initMap - Create the Google map to search for matching local restaraunts.
 *  @param {string} food    Food type to search for, e.g. 'mexican'.
 */
function initMap(food) {
    // var pyrmont = {lat: 33.6305353, lng: -117.74319};

    map = new google.maps.Map(document.getElementById('map'), {
        center: gLocation,
        zoom: 15
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: gLocation,
        rankBy: google.maps.places.RankBy.DISTANCE,
        types: ['food'],
        keyword:food
    }, restaurantCallback);

}

/**
 *  restaurantError - Handle error callback for getting restaurant information.
 */
function restaurantError() {
    console.log("Error");
    setTimeout(function(){
        $("#display-food-type").text("Sorry, no matches. Please try again.");
    },1000)

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
        // Build a div with the basic information from the restaurant.
        var restaurantElem = $('<div>').addClass('restaurant');
        restaurantElem.append($('<p>').addClass('restaurant-name').text(r.name));
        restaurantElem.append($('<p>').addClass('restaurant-address').text(r.address));


        // Add buttons for the photos and directions.
        restaurantElem.append($('<button>').text('Photos').click(function () {
            photosRequest();
            onPhotosButton();
        }));
        restaurantElem.append($('<button>').text('Directions').click(function () {

            onDirectionsButton();
            direction(gLocation["lat"],gLocation["lng"],$(this).parent().find(".restaurant-address").text());
        }));
        // Append the formatted restaurant div to its container.
        containerElem.append(restaurantElem);
    }
}

/**
 * restaurantCallback - Called from Google maps when we get restaurant data.
 * @param {object[]}    results
 * @param {boolean}     status  // TODO: Check this status?
 */
function restaurantCallback(results, status) {
    console.log('restaurantCallback: ', results);
    gaRestaurants=[];

    console.log(gaRestaurants.length);
    if(results.length!==0) {
        for (var i = 0; i < 5; i++) {
            var restaurant = {};
            restaurant.name = results[i].name;
            restaurant.address = results[i].vicinity;
            gaRestaurants.push(restaurant);
        }

        setTimeout(function(){
            $("#display-food-type").text("Searching...");
            setTimeout(function(){
                restaurantSuccess();
                $('#display-food-type').text(gaFoodTypes[gFoodTypeIndex]);
            },1000)
        },1000)

    }
    else{
        setTimeout(function(){
            $("#display-food-type").text("Searching...");
            setTimeout(function(){
                restaurantError();
            },1000)
        },1000)
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
 *  onDirectionsOkButton - Close the help modal.
 */
function onDirectionsOkButton() {
    console.log('onDirectionsOkButton');
    $('#directions-modal-wrapper').removeClass('display');
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
 * Spin wheel
 */
function spinWheel(){
    console.log('spinWheel');
    imgElem = $('#color-wheel');

    // Clear the existing style setting.
    imgElem.removeAttr('style');

    // Set a new style setting to make it take place.
    var degrees = 500 + (Math.floor(Math.random() * 500));
    if (gSpinRight) {
        gSpinRight = false;
    } else {
        degrees = 0 - degrees;
        gSpinRight = true;
    }

    var css = '-webkit-transform: rotate(' + degrees + 'deg);';

    imgElem.attr('style', css);
}
/*direction*/
var address = {};

/*
 * Get the json file from Google Geo
 */
function Convert_LatLng_To_Address(lat, lng,destination) {
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=false";
    jQuery.getJSON(url, function (json) {
        Create_Address(json);
        test(address,destination);
    });
}

/*
 * Create an address out of the json
 */
function Create_Address(json) {
    if (!check_status(json)) // If the json file's status is not ok, then return
        return 0;
    address['country'] = google_getCountry(json);
    address['province'] = google_getProvince(json);
    address['city'] = google_getCity(json);
    address['street'] = google_getStreet(json);
    address['postal_code'] = google_getPostalCode(json);
    address['country_code'] = google_getCountryCode(json);
    address['formatted_address'] = google_getAddress(json);

}

/*
 * Check if the json data from Google Geo is valid
 */
function check_status(json) {
    if (json["status"] == "OK") return true;
    return false;
}

/*
 * Given Google Geocode json, return the value in the specified element of the array
 */

function google_getCountry(json) {
    return Find_Long_Name_Given_Type("country", json["results"][0]["address_components"], false);
}
function google_getProvince(json) {
    return Find_Long_Name_Given_Type("administrative_area_level_1", json["results"][0]["address_components"], true);
}
function google_getCity(json) {
    return Find_Long_Name_Given_Type("locality", json["results"][0]["address_components"], false);
}
function google_getStreet(json) {
    return Find_Long_Name_Given_Type("street_number", json["results"][0]["address_components"], false) + ' ' + Find_Long_Name_Given_Type("route", json["results"][0]["address_components"], false);
}
function google_getPostalCode(json) {
    return Find_Long_Name_Given_Type("postal_code", json["results"][0]["address_components"], false);
}
function google_getCountryCode(json) {
    return Find_Long_Name_Given_Type("country", json["results"][0]["address_components"], true);
}
function google_getAddress(json) {
    return json["results"][0]["formatted_address"];
}

/*
 * Searching in Google Geo json, return the long name given the type.
 * (if short_name is true, return short name)
 */

function Find_Long_Name_Given_Type(t, a, short_name) {
    var key;
    for (key in a ) {
        if ((a[key]["types"]).indexOf(t) != -1) {
            if (short_name)
                return a[key]["short_name"];
            return a[key]["long_name"];
        }
    }
}

function direction(lat,lng,destination) {
    Convert_LatLng_To_Address(lat,lng,destination);
}
function test(address,destination) {
    console.log("-----------------------------")
    console.log("Where I am:",address.formatted_address);
    console.log("Place to go:",destination);
    var origin_place_id = null;
    var destination_place_id = null;
    var travel_mode = 'WALKING';
    var map = new google.maps.Map(document.getElementById('directions-modal-wrapper'), {
        mapTypeControl: false,
        center: gLocation,
        zoom: 10
    });
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    $('#origin-input').val(address.formatted_address);
    var origin_input = document.getElementById('origin-input');
    $("#destination-input").val(destination);
    var destination_input = document.getElementById('destination-input');
    var modes = document.getElementById('mode-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(destination_input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);


    var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
    origin_autocomplete.bindTo('bounds', map);
    var destination_autocomplete =
        new google.maps.places.Autocomplete(destination_input);
    destination_autocomplete.bindTo('bounds', map);
    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    /*
    function setupClickListener(id, mode) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function () {
            travel_mode = mode;
        });
    }

    setupClickListener('changemode-walking', 'WALKING');
    setupClickListener('changemode-transit', 'TRANSIT');
    setupClickListener('changemode-driving', 'DRIVING');
    */
    function expandViewportToFitPlace(map, place) {
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
    }

    origin_autocomplete.addListener('place_changed', function () {

        var place = origin_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map, place);
        // If the place has a geometry, store its place ID and route if we have
        // the other place ID
        origin_place_id = place.place_id;
        route(origin_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });
    destination_autocomplete.addListener('place_changed', function () {
        var place = destination_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map, place);
        // If the place has a geometry, store its place ID and route if we have
        // the other place ID
        destination_place_id = place.place_id;
        route(origin_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });

    function route(origin_place_id, destination_place_id, travel_mode,
                   directionsService, directionsDisplay) {
        if (!origin_place_id || !destination_place_id) {
            return;
        }
        directionsService.route({
            origin: {'placeId': origin_place_id},
            destination: {'placeId': destination_place_id},
            travelMode: travel_mode
        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
}




/**
 *  Document ready.
 */
$(document).ready(function () {
    // Enable the following line to disable console.log() for release.
    console.log = function() {};

    console.log('Document ready');
    // Attach click handler for the main spin button.
    $('#color-wheel').click(onSpin);

    // Attach click handlers for the bottom menu buttons.
    $('.help-button').click(onHelpButton);
    $('#location-icon').click(onLocationButton);
    $('#settings-icon').click(onSettingsButton);

    // Attach click handlers for the help modal.
    $('#help-ok-button').click(onHelpOkButton);

    // Attach click handlers for the location modal.
    $('#location-current-button').click(locationRequestCurrent);
    $('#location-zip-button').click(locationRequestZip);
    $('#location-ok-button').click(onLocationOkButton);

    // Attach click handlers for the photos modal.
    $('#photos-ok-button').click(onPhotosOkButton);

    // Attach click handlers for the directcions modal.
    $('#directions-ok-button').click(onDirectionsOkButton);

    // Start by getting the current location as the default.
    locationRequestCurrent();

    // Build the settings modal from the valid food type.
    buildSettingsModal();

    // Load the saved settings from local storage.
    loadSettingsFromLocalStorage();
});


