'use strict';

var client = require('scp2');
var waterfall = require('async-waterfall');
var fileUtils = require('./file');
var fs = require('fs');
var colors = require('colors')

exports.sftp = function(port, host, username, password, from, to) {
	client.defaults({
		port: port,
		host: host,
		username: username,
		password: password
	});
	var queue = []
	var stats = fs.statSync(from)
	if (stats.isDirectory()) {
		fileUtils.eachFileSync(from, function(filename, stats) {
			queue.push(
				function(callback) {
					client.upload(filename, to, function(err) {
						callback()
					})
				}
			)
		});
	} else {
		queue.push(
			function(callback) {
				client.upload(from, to, function(err) {
					callback()
				})
			}
		)
	}
	queue.push(
		function(callback) {
			client.close()
			callback()
		}
	)
	waterfall(queue, function(err, result) {
		if (err) {
			console.info(err)
		} else {
			console.info("Files ( ".yellow+from + " ) uploaded".yellow)
		}
	})

}