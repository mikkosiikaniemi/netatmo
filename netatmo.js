(function ($) {
	'use strict';

	var weekDays = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
	//var weekDays = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

	function updateClock() {
		var currentTime = new Date();

		var currentDay = currentTime.getDate();
		//var currentMonthName = months[ currentTime.getMonth() ];
		var currentMonth = currentTime.getMonth() + 1;

		var currentYear = currentTime.getFullYear();
		var currentWeekDay = weekDays[currentTime.getDay()];

		var currentHours = currentTime.getHours();
		var currentMinutes = currentTime.getMinutes();
		var currentSeconds = currentTime.getSeconds();
		currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
		currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

		var currentDateString = currentWeekDay + ' ' + currentDay + '.' + currentMonth + '.' + currentYear;
		var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds;
		document.getElementsByClassName('date-and-time')[0].innerHTML = '<span class="date">' + currentDateString + '</span><span class="time">' + currentTimeString + '</span>';
	}

	function updateTemperatures() {
		var placeholder = document.getElementById('temperatures');

		var request = new XMLHttpRequest();
		// Make an AJAX request to handler PHP file
		request.open('GET', 'temperatures.php', true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

		request.onload = function () {
			if (request.status === 200) {
				placeholder.innerHTML = request.response;
				drawCharts();
			}
			else {
				console.log('server error');
			}
		};

		request.onerror = function () {
			console.log('something went wrong');
		};

		request.send();
	}

	function updateTimeDifferences() {
		var time_difference_placeholders = document.getElementsByClassName('module__details--time');
		for (var i = 0; i < time_difference_placeholders.length; i++) {
			var time_measured = time_difference_placeholders[i].getAttribute('data-time-measured') * 1000;
			time_difference_placeholders[i].innerHTML = timeSince( time_measured );
		}
	}

	function timeSince(timestamp) {

		var seconds = Math.floor( ( new Date() - timestamp ) / 1000 );

		var interval = Math.floor(seconds / 31536000);

		if (interval > 1) {
			return interval + " vuotta";
		}
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) {
			return interval + " kuukautta";
		}
		interval = Math.floor(seconds / 86400);
		if (interval > 1) {
			return interval + " päivää";
		}
		interval = Math.floor(seconds / 3600);
		if (interval > 1) {
			return interval + " tuntia";
		}
		interval = Math.floor(seconds / 60);
		if (interval > 1) {
			return interval + " minuuttia";
		}
		if (interval >= 1) {
			return "Minuutti";
		}
		return Math.floor(seconds) + " sekuntia";
	}

	function array_min(array) {
		return Math.min.apply(Math, array);
	}

	function array_max(array) {
		return Math.max.apply(Math, array);
	}

	function drawCharts() {

		var progress_bar = $('.update-timer__bar');

		progress_bar.stop().width(0);
		progress_bar.animate({
			width: '100%',
		}, netatmo.update_interval * 1000, 'linear' );

		var data_points;

		//var data_points, outdoor_options, indoor_options;
		// Put all indoor temperatures to an array
		var indoor_temps = [];
		var indoor_modules = document.querySelectorAll('div[data-module-type="indoor"]');
		if (indoor_modules.length >= 1) {
			for (var k = 0; k < indoor_modules.length; k++) {
				data_points = JSON.parse(indoor_modules[k].getAttribute('data-points'));
				for (var l = 0; l < data_points.length; l++) {
					indoor_temps.push(data_points[l][1]);
				}
			}
		}

		// Put all outdoor temperatures to an array
		var outdoor_temps = [];
		var outdoor_modules = document.querySelectorAll('div[data-module-type="outdoor"]');
		if (outdoor_modules.length >= 1) {
			for (var m = 0; m < outdoor_modules.length; m++) {
				data_points = JSON.parse(outdoor_modules[m].getAttribute('data-points'));
				for (var n = 0; n < data_points.length; n++) {
					outdoor_temps.push(data_points[n][1]);
				}
			}
		}

		// Find the highest/lowest temperatures and set them as Y-axis options
		var outdoor_options = {
			low: array_min(outdoor_temps) - 0.5,
			high: array_max(outdoor_temps) + 0.5,
		};

		var indoor_options = {
			low: array_min(indoor_temps) - 0.5,
			high: array_max(indoor_temps) + 0.5,
		};

		var line_color, xaxis_options, yaxis_options, font_spec;

		var d = new Date();
		var startOfDay = d.setUTCHours(0,0,0,0);
		startOfDay = startOfDay + d.getTimezoneOffset() * 60 * 1000;

		$('.flot-chart').each(function (index, element) {
			var element_id = '#' + $(element).attr('id');
			var element_data = $(element).data('points');
			var element_type = $(element).data('module-type');

			font_spec = {
				size: 11,
				lineHeight: 13,
				family: "HelveticaNeue",
				color: "#aaaaaa"
			};

			xaxis_options = {
				mode: 'time',
				timeformat: '%H',
				timezone: 'browser',
				twelveHourClock: false,
				timebase: 'seconds',
				font: font_spec,
			};

			yaxis_options = {
				position: 'right',
				font: font_spec,
				tickDecimals: 0,
				showTicks: true,
				showMinorTicks: true
			};

			if (element_type === 'outdoor') {
				yaxis_options.min = outdoor_options.low;
				yaxis_options.max = outdoor_options.high;
				line_color = '#29abe2';
				yaxis_options.tickSize = 2;
				xaxis_options.ticks = 12;
			}
			if (element_type === 'indoor') {
				yaxis_options.min = indoor_options.low;
				yaxis_options.max = indoor_options.high;
				line_color = '#29abe2';
				yaxis_options.tickSize = null;
				xaxis_options.ticks = 6;

				if(index > 1) {
					yaxis_options.show = false;
				}
			}

			$.plot(element_id, [{
				data: element_data,
				color: line_color,
				threshold: {
					below: 0,
					color: "rgb(200, 20, 30)"
				},
				shadowSize: 0,
				lines: {
					show: true,
					fill: true,
					fillColor: { colors: [{ opacity: 0.2 }, { opacity: 0.5 }] }
				}
			}],
			{
				xaxis: xaxis_options,
				yaxis: yaxis_options,
				grid: {
					borderWidth: 0,
					color: 'rgba(41,171,226,0.7)',
					backgroundColor: '#020202',
					markings: [ { xaxis: { from: startOfDay, to: startOfDay }, color: "rgba(41,171,226,.2" } ]
				},
			});
		});
	}

	$(function () {

		updateClock();

		drawCharts();

		setInterval(updateClock, 1000);
		setInterval(updateTemperatures, netatmo.update_interval * 1000);
		setInterval(updateTimeDifferences, 5000);

	});

})(jQuery);
