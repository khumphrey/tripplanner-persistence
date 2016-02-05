'use strict';
/* global $ attractionsModule */

var daysModule = (function() {

    // state (info that should be maintained)

    var days = [],
        currentDay;

    // jQuery selections

    var $dayButtons, $dayTitle, $addButton, $removeDay;
    $(function() {
        $dayButtons = $('.day-buttons');
        $removeDay = $('#day-title > button.remove');
        $dayTitle = $('#day-title > span');
        $addButton = $('#day-add');
    })

    // Day class
    function Day(dayID, number) {
        this.hotel = null;
        this.restaurants = [];
        this.activities = [];
        this.number = number;
        this.dayID = dayID;
        days.push(this);
        this.buildButton().drawButton();
    }


    Day.prototype.buildButton = function() {
        this.$button = $('<button class="btn btn-circle day-btn"></button>')
            .text(this.number);
        var self = this;
        this.$button.on('click', function() {
            this.blur();
            self.switchTo();
        })
        return this;
    };

    Day.prototype.drawButton = function() {
        this.$button.appendTo($dayButtons);
        return this;
    };

    Day.prototype.switchTo = function() {
        // day button panel changes
        currentDay.$button.removeClass('current-day');

        // itinerary clear
        function erase(attraction) {
            attraction.eraseItineraryItem();
        }
        if (currentDay.hotel) erase(currentDay.hotel);
        currentDay.restaurants.forEach(erase);
        currentDay.activities.forEach(erase);

        // front-end model change
        currentDay = this;

        // day button panel changes
        currentDay.$button.addClass('current-day');
        $dayTitle.text('Day ' + currentDay.number);

        // itinerary repopulation
        function draw(attraction) {
            attraction.drawItineraryItem();
        }
        if (currentDay.hotel) draw(currentDay.hotel);
        currentDay.restaurants.forEach(draw);
        currentDay.activities.forEach(draw);

        return currentDay;
    };

    // private functions in the daysModule

    function addDay() {
        if (this && this.blur) this.blur();

        //post to create a new day
        $.post('/api/days')
            .then(function(day) {
                var newDay = new Day(day._id, day.number);
                if (days.length === 1) currentDay = newDay;
                newDay.switchTo();
            })

    }

    function deleteCurrentDay() {
        console.log('will delete this day:', currentDay);
        $.ajax({
          method: 'DELETE',
          url: '/api/days/' + currentDay.dayID,
          success: function() {
            console.log("deleted!")
          },
          error: function(error) {
            console.error(error.message);
          }
        })
    }

    // jQuery event binding

    $(function() {
        $addButton.on('click', addDay);
        $removeDay.on('click', deleteCurrentDay);
    })

    // globally accessible methods of the daysModule

    var methods = {

      load: function() {
          //populate from Mongoose and add these to [] as well as page
        $.get('/api/days')
          .then(function(mDays) {
            // console.log(mDays);
              //for each mDay make it a Day() 
              if (mDays.length) {
                  mDays.forEach(function(mday) {
                    //first make all attractions new attractions
                    var newDay = new Day(mday._id, mday.number);
                    if (currentDay) {
                      newDay.switchTo();
                    }
                    
                    currentDay = days[days.length-1];
                    
                    if (mday.hotel) {
                      methods.addAttraction(mday.hotel, 'hotel');}

                    if (mday.restaurants.length) {
                      mday.restaurants.forEach(function (restaurant) {
                        methods.addAttraction(restaurant, 'restaurant');
                      })
                    }
                    if(mday.activities.length) {
                      mday.activities.forEach(function (activity) {
                        methods.addAttraction(activity, 'activity');
                      })
                    }
                  })
                  days[0].switchTo();

              } else {
                  $(addDay);
              }
          })

      },

      addAttraction: function(attractionData, type) {
        //need to fix this create call; right now it's not creating right object
        //sometimes--where does it get called from?
        if (type) {
          attractionData.type = type;
        }
        var attraction = attractionsModule.create(attractionData);
        //add attraction to our day
        //current day is identified by number
        // console.log(attraction.type);
        switch (attraction.type) {
          case 'hotel':
              currentDay.hotel = attraction;
              $.post('/api/days/' + currentDay.dayID + '/hotel/' + attractionData._id);
              break;
          case 'restaurant':
              currentDay.restaurants.push(attraction);
               $.post('/api/days/' + currentDay.dayID + '/restaurant/' + attractionData._id)
              break;
          case 'activity':
              currentDay.activities.push(attraction);
               $.post('/api/days/' + currentDay.dayID + '/activity/' + attractionData._id);
              break;
          default:
              console.error(type, 'bad type:', attraction);
        }
      },

      getCurrentDay: function() {
          return currentDay;
      }

    };

    // we return this object from the IIFE and store it on the global scope
    // that way we can use `daysModule.load` and `.addAttraction` elsewhere

    return methods;

}());