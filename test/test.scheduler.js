var algorithm = require('hammerhead-design'),
    should = require('should'),
    async = require('async'),
    fs = require('fs'),
    app = require('../index.js'),
    mongoose = require('mongoose'),
    test_data = require('./test_data.js'),
    test_utils = require('./test_utils.js');

var RequestExecutor = algorithm.HandleRequest;
var AlgoRequest = algorithm.Model.DomainObjects.Request;

var Request = mongoose.model('Request');

var testID = 'Tes1';
var pathToDir = process.cwd()+'/'+testID;

beforeEach(function(done){
    test_utils.rmDirIfExists(pathToDir);
    done();
});

describe('Scheduling pending requests', function(){
    before(function(done){
	test_utils.emptyDb(done);
    });
	
    it('No Request scheduled if none exists', function(done){
	app.launchPendingRequests(function(err, result){
	    if(err){
		done(err);
	    } else {
		result.should.eql("No pending requests exist");
		done();
	    }
	});
    });

    it('Designed request should be launched', function(done){
	var requestData = test_data.longSequence.request;
	async.waterfall(
	    [
		function(callback){
		    callback(null, testID, requestData);
		},
		utils.createPendingRequest,
		function(id, callback){
		    app.launchPendingRequests(callback);
		}
	    ],
	    function(err, result){
		if(err){
		    done(err);
		}
		else {
		    result.should.include("Request");
		    result.should.include(testID);
		    done();
		} 
	    });
    });
});

describe('Stopping blocked request', function(){
    before(function(done){
	test_utils.emptyDb(done);
    });
	
    it('Blocked request should return a remaining duration of 0', function(done){
	var requestData = test_data.longSequence.request;
	async.waterfall(
	    [
		function(callback){
		    callback(null, testID, requestData);
		},
		utils.createRequest,
		utils.saveRequest,
		utils.setRequestBlocked,
		app.handleRunningRequests,
		function(id, callback){
		    app.launchPendingRequests(callback);
		}
	    ],
	    function(err, result){
		if(err){
		    done(err);
		}
		else {
		    result.should.equal(0);
		    done();
		} 
	    });
    });
});

// Always keep last
after(function(done){
    test_utils.rmDirIfExists(pathToDir);
    done();
});
