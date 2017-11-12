// const YELP_PROXY_URL = 'http://localhost:8080/'
const YELP_PROXY_URL = 'https://picnic-yelp-backend-ehoqpjnyse.now.sh/'
let startingLocation = {};
let selectedPark = {};
let selectedPicnic = {};
let bounds = new google.maps.LatLngBounds();

function helloWorld(string) {
	console.log (`hello world, I got passed ${string}`);
}

function showSection (section) {
	$('section').not(section).addClass('hidden');
	$(section).removeClass('hidden');
}

function renderParkPopup(park) {
	let lat = park.coordinates.latitude;
	let lng = park.coordinates.longitude;
	selectedPark = park;
	let parkImage = park.image_url;
	if (parkImage === "") { parkImage = 'park-image.jpg' };
	$('.js-confirm-section').html(`
		<div class="popup">
			<div class="confirm-box">
				<img src="${parkImage}" alt="Image of ${park.name}" title="Image of ${park.name}">
				<p class="title">${park.name}</p>
				<p class="address">${park.location.display_address[0]}, ${park.location.display_address[1]}</p>
				<button onclick="pickLunch(${lat},${lng})">Confirm Park</button>
			</div>
		</div>
	`);
	$('.js-confirm-section').removeClass('hidden');
	$('.js-confirm-section').click(() => $('.js-confirm-section').addClass('hidden'));
	$('.pick.lunch h2').html(`Pick a lunch spot near ${park.name}`);
}

function renderLunchPopup(lunch) {
	let latLng = `{ lat : ${lunch.coordinates.latitude}, lng : ${lunch.coordinates.longitude} }`
	selectedLunch = lunch;
	$('.js-confirm-section').html(`
		<div class="popup">
			<div class="confirm-box">
				<img src="${lunch.image_url}" alt="Image of ${lunch.name}" title="Image of ${lunch.name}">
				<p class="title">${lunch.name}</p>
				<p class="address">${lunch.location.display_address[0]}, ${lunch.location.display_address[1]}</p>
				<button onclick='displayPlans()'>Confirm Lunch</button>
			</div>
		</div>
	`);
	$('.js-confirm-section').removeClass('hidden');
	$('.js-confirm-section').click(() => $('.js-confirm-section').addClass('hidden'));
}

function yelpDetails(elementId, callback) {
	let settings = {
		"async": true,
		"crossDomain": true,
		"url": `${YELP_PROXY_URL}https://api.yelp.com/v3/businesses/${elementId}`,
		"method": "GET",
		"headers": {
			"authorization": "Bearer yzvfmEeIjLbTGkUD0BH96kqjoY53lS-oXCvBC_kc1lO9d1g6jSYuV3tjQXwJmbjK88sCr_VP6irssyn6LqGWqEz6lHjig6ba1NdThIjxssBoT2H5-8EmIRNB6-j8WXYx",
			"cache-control": "no-cache",
			"postman-token": "b3e4b9d9-0798-422f-72f8-8808438c1947"
			}
		}	
	$.ajax(settings).done(function (response) {
 		 callback(response);
	});
}

function confirmPark(parkId) {
	yelpDetails(parkId, renderParkPopup);
}

function loadParkResults(park) {
	let results = park.businesses.map((park) => {
		let parkImage = park.image_url;
		if (parkImage === "") { parkImage = 'park-image.jpg' };
		return (`
			<div class="result" onclick=confirmPark("${park.id}")>
				<img src="${parkImage}" alt="Image of ${park.name}" title="Image of ${park.name}">
				<span class="title">${park.name}</span>
				<span class="address">${park.location.display_address[0]}, ${park.location.display_address[1]}</span>
			</div>
			`)
	});
	$('.park.results').html(results);
}

function confirmLunch(lunchId) {
	yelpDetails(lunchId, renderLunchPopup)
}


function loadLunchResults(lunch, parkId) {
	let results = lunch.businesses.map((lunch) => {
		return (`
			<div class="result" onclick="confirmLunch('${lunch.id}')">
				<img src="${lunch.image_url}" alt="Image of ${lunch.name}" title="Image of ${lunch.name}">
				<span class="title">${lunch.name}</span>
				<span class="address">${lunch.location.display_address[0]}, ${lunch.location.display_address[1]}</span>
			</div>
			`)
	});
	$('.lunch.results').html(results);
}

function loadParkMap(latLng) {
	bounds = new google.maps.LatLngBounds();
	let options = {
		center : latLng
		}
	let map = new google.maps.Map(document.getElementById('parkMap'), options);
	return map;
}

function loadLunchMap(latLng) {
	bounds = new google.maps.LatLngBounds();
	let options = {
		center : latLng
		}
	let map = new google.maps.Map(document.getElementById('lunchMap'), options);
	return map;
}

function addParkMarker(park, parkMap) {
	let latLng = { lat : park.coordinates.latitude, lng : park.coordinates.longitude };
	let markerIcon = 'park-marker.png';
	let parkImage = park.image_url;
	if (parkImage === "") { parkImage = 'park-image.jpg' };
	let contentString = (`
			<div class="info-window" onclick=confirmPark("${park.id}")>
				<img src="${parkImage}" alt="Image of ${park.name}" title="Image of ${park.name}">
				<span class="title">${park.name}</span>
				<span class="address">${park.location.display_address[0]}, ${park.location.display_address[1]}</span>
			</div>
			`);
	let infowindow = new google.maps.InfoWindow({ content: contentString });
	let options = {
		icon : markerIcon,
		map : parkMap,
		position : new google.maps.LatLng(latLng),
		title : park.name
		}
	let marker = new google.maps.Marker(options);
	marker.addListener('click', function() {
		infowindow.open(parkMap, marker);
		});
	bounds.extend(latLng);
	parkMap.fitBounds(bounds);
}

function addLunchMarker(park, parkMap) {
	let latLng = { lat : park.coordinates.latitude, lng : park.coordinates.longitude };
	let marIcon = 'lunch-marker.png';
	let parkImage = park.image_url;
	if (parkImage === "") { parkImage = 'park-image.jpg' };
	let contentString = (`
			<div class="info-window" onclick=confirmLunch("${park.id}")>
				<img src="${parkImage}" alt="Image of ${park.name}" title="Image of ${park.name}">
				<span class="title">${park.name}</span>
				<span class="address">${park.location.display_address[0]}, ${park.location.display_address[1]}</span>
			</div>
			`);
	let infowindow = new google.maps.InfoWindow({ content: contentString });
	let options = {
		icon : marIcon,
		map : parkMap,
		position : new google.maps.LatLng(latLng),
		title : park.name
	}
	let marker = new google.maps.Marker(options);
	marker.addListener('click', function() {
		infowindow.open(parkMap, marker);
		});
		bounds.extend(latLng);
		parkMap.fitBounds(bounds);
}


function callYelp(params, callback) {
	let paramString = jQuery.param(params);
	let callUrl = `${YELP_PROXY_URL}https://api.yelp.com/v3/businesses/search?${paramString}`
	let settings = {
		"url": callUrl,
		"async": true,
		"crossDomain": true,
		"method": "GET",
		"headers": {
			"authorization": "Bearer yzvfmEeIjLbTGkUD0BH96kqjoY53lS-oXCvBC_kc1lO9d1g6jSYuV3tjQXwJmbjK88sCr_VP6irssyn6LqGWqEz6lHjig6ba1NdThIjxssBoT2H5-8EmIRNB6-j8WXYx",
		    "cache-control": "no-cache",
    		"postman-token": "72799fba-d338-1008-1b50-d06f62818db8"
			}
		};
$.ajax(settings).done(function (response) {
	callback(response);
	progressCursor('off');
});
}

function renderParks(data) {
	let latLng = { lat : data.region.center.latitude, lng : data.region.center.longitude };
	loadParkResults(data);
	showSection('.js-pick-park-section');
	bounds = new google.maps.LatLngBounds();
	let map = loadParkMap(latLng);
	let marker = new google.maps.Marker({
		map : map,
		position : latLng,
		title : 'Starting Location'
	});
	data.businesses.forEach((data) => addParkMarker(data, map));
}

function pickAPark(location) {
	// let data = YELP_PARK_RESULTS;
	let params = {
		"location" : location,
		"limit" : 10,
		"categories" : "parks",
		"radius" : 16000,
		"sort_by" : "distance"
		};
	callYelp(params, renderParks);
}

function pickAParkAlt(lat, lng) {
	let params = {
		"latitude" : lat,
		"longitude" : lng,
		"limit" : 10,
		"categories" : "parks",
		"radius" : 16000,
		"sort_by" : "distance"
		};
	callYelp(params, renderParks);
}

function lunchCallback(data) {
	let latLng = { lat : data.region.center.latitude, lng : data.region.center.longitude };
	loadLunchResults(data);
	showSection('.js-pick-lunch-section');
	let map = loadLunchMap(latLng);
	let marker = new google.maps.Marker({
		map : map,
		position : latLng,
		title : data.name
	});
	data.businesses.forEach((data) => addLunchMarker(data, map));
}

function pickLunch(lat, lng) {
	let params = {
		"latitude" : lat,
		"longitude" : lng,
		"limit" : 10,
		"categories" : "foodtrucks, foodstands",
		"radius" : 16000,
		"sort_by" : "distance"
		};
	callYelp(params, lunchCallback);
}

function watchLocationSubmit() {
	$('.js-location-form').submit(event => {
		event.preventDefault();
		let locationTarget = $(event.currentTarget).find('.js-starting-location');
		let entryLocation = locationTarget.val();
		locationTarget.val("");
		progressCursor('on');
		pickAPark(entryLocation);
	}
)}

function getLocation() {
	progressCursor('on');
	navigator.geolocation.getCurrentPosition(function(position) {
		let lat = position.coords.latitude;
		let lng = position.coords.longitude;
		pickAParkAlt(lat, lng);
});
}

function displayPlans() {
	let plans = `
		<h1>Your picnic plans</h1>
		<p>First, you are going to pick up food from:</p>
		<p class="title"><a href="${selectedLunch.url}" title="${selectedLunch.name}">${selectedLunch.name}</a></p>
		<p class="address">${selectedLunch.location.display_address[0]}, ${selectedLunch.location.display_address[0]}</p>
		<p>and take it to:</p>
		<p class="title"><a href="${selectedPark.url}" title="${selectedPark.name}">${selectedPark.name}</a></p>
		<p class="address">${selectedPark.location.display_address[0]}, ${selectedPark.location.display_address[0]}</p>
		<h3>Have a fabulous Picnic!</h3>
		<br>
		<button onclick="picnicInThePark()">Start Over</button>
	`;
	$('.js-plans .box').html(plans);
	showSection('.js-plans');
}

function progressCursor(state) {
	if ( state === "on" ) $('body').addClass('progress-cursor')
	else if ( state === "off" ) $('body').removeClass('progress-cursor');
}

function picnicInThePark() {
	showSection('.start-section');
	watchLocationSubmit();
	let options = {'types' : ['geocode']};
	let input = document.getElementById('starting-location');
	let autocomplete = new google.maps.places.Autocomplete(input);
}

picnicInThePark();