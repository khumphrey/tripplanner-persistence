var router = require('express').Router();
var models = require('../../models');
var Day = models.Day;
var Promise = require('bluebird');

//get all days
router.get('/', function(req, res, next) {
    Day.find()
	.populate("restaurants activities hotel")
    .then(function(days) {
        res.json(days);
    }).then(null, next);
});

//get one day
router.get('/:id', function(req, res, next) {
    Day.findById({
            _id: req.params.id
        })
        .populate("restaurants hotel activities")
        .then(function(day) {
            res.json(day);
        }).then(null, next);
});

//delete a day
router.delete('/:id', function(req, res, next) {
    Day.findOneAndRemove({
        _id: req.params.id
        })
        .then(function(data) {
            res.json(data);
        })
        .then(null, next);
});

router.delete('/:id/activity/:activityid', function(req, res, next) {
    Day.findOneAndUpdate({_id: req.params.id}, {$pull: {activities: req.params.activityid}} )
        .then(function(data) {
          res.json(data);
        }).then(null, next);
});

router.delete('/:id/restaurant/:restaurantid', function(req, res, next) {
    Day.findOneAndUpdate({_id: req.params.id}, {$pull: {restaurants: req.params.restaurantid}} )
        .then(function(data) {
          res.json(data);
        })
        .then(null, next);

});

router.delete('/:id/hotel/:hotelid', function(req, res, next) {
    Day.findOneAndUpdate({_id: req.params.id}, {$unset: {hotel: req.params.hotelid}})
        .then(function(data) {
          res.json(data);
        })
        .then(null, next);
});

//add a day
router.post('/', function(req, res, next) {
    Day.count({})
        .then(function(number) {
            var newDay = new Day({
                number: (number + 1)
            });
            newDay.save()
                .then(function(savedDay) {
                    res.json(savedDay);
                });
        })
        .then(null, next);
});

//update hotel
router.post('/:id/hotel/:hotelid', function(req, res, next) {
    Day.findOneAndUpdate({_id: req.params.id}, {$set: {hotel: req.params.hotelid}})
        .then(function(data) {
          res.json(data);
        })
        .then(null, next);
});

//update restaurant
router.post('/:id/restaurant/:restaurantid', function(req, res, next) {
    Day.findOneAndUpdate({_id: req.params.id}, {$addToSet: {restaurants: req.params.restaurantid}} )
        .then(function(data) {
          res.json(data);
        })
        .then(null, next);

});

// update activity
router.post('/:id/activity/:activityid', function(req, res, next) {
    Day.findOneAndUpdate({_id: req.params.id}, {$addToSet: {activities: req.params.activityid}} )
        .then(function(data) {
          res.json(data);
        }).then(null, next);
});


module.exports = router;


