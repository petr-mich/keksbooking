'use strict';
(function() {

	var data = {
		mapWidth: 1200,
		mapHeight: 750,
		yMin: 130,
		yMax: 630,
		pinWidth: 40,
		pinHeight: 44,
		pinPointerHeight: 15, // с учетом значения 'padding-bottom' элемента '.map__pin': 18 - 3 = 15
		pinMainPointerHeight: 12,
		pinMainStartLeft: 600,
		pinMainStartTop: 375
	};

	Object.defineProperty(window, 'data', {
		value: data
	});

	Object.freeze(window.data);

})();
