/* global mapModule daysModule */

var attractionsModule = (function(){

  // jQuery selections

  var $itinerary, $hotel, $restaurants, $activities;
  $(function(){
    $itinerary = $('#itinerary');
    $hotel = $itinerary.find('ul[data-type="hotel"]');
    $restaurants = $itinerary.find('ul[data-type="restaurants"]');
    $activities = $itinerary.find('ul[data-type="activities"]');
  });

  // helper

  function merge (source, target) {
    Object.keys(source).forEach(function (key) {
      target[key] = source[key];
    });
  }

  // Attraction class

  function Attraction (data) {
    merge(data, this);
    //this function call sometimes fails now because it is just passing an ID
    //to the build (and draw). We need to pass an attractions object.
    //also failing specifically with hotels
    this.buildItineraryItem().drawItineraryItem();
  }

  Attraction.prototype.buildItineraryItem = function() {
    var $title = $('<span class="title"></span>').text(this.name),
        $button = $('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');
    this.$itineraryItem = $('<div class="itinerary-item"></div>')
      .append($title)
      .append($button);
    var self = this;
    $button.on('click', function () {
      self.delete();
    });
    return self;//changed 'this' to 'self'
  };

  Attraction.prototype.drawItineraryItem = function() {
    switch (this.type) {
      case 'hotel': $hotel.empty().append(this.$itineraryItem); break;
      case 'restaurant': $restaurants.append(this.$itineraryItem); break;
      case 'activity': $activities.append(this.$itineraryItem); break;
      default: console.error('bad type:', this);
    }
    this.drawMarker();
    return this;
  };

  Attraction.prototype.eraseItineraryItem = function() {
    console.log(this);
    this.$itineraryItem.detach();
    this.eraseMarker();
    return this;
  };

  Attraction.prototype.drawMarker = function() {
    this.marker = mapModule.drawAttraction(this);
    return this;
  };

  Attraction.prototype.eraseMarker = function() {
    mapModule.removeMarker(this.marker);
    return this;
  };

  // a circular dependency… probably can be improved! Maybe higher-order func?

  Attraction.prototype.delete = function() {
    //need to delete from day in Mongoose

    
    this.eraseItineraryItem().eraseMarker();
    var day = daysModule.getCurrentDay();
    switch (this.type) {
      case 'hotel': day.hotel = null; break;
      case 'restaurant':
        day.restaurants.splice(day.restaurants.indexOf(this), 1);
        break;
      case 'activity':
        day.activities.splice(day.activities.indexOf(this), 1);
        break;
      default: console.error('bad type:', this);
    }
  }

  var methods = {

//need to focus on fixing this!
    create: function (attractionData) {
      return new Attraction(attractionData); //type here
    }

  }

  // this returned object is `attractionsModule` on the global scope

  return methods;

}());
