'use strict';
(function() {

	var params = {
		numberOfUsers: 8,
		avatarNumbers: [],
		title: [
			'Большая уютная квартира',
			'Маленькая неуютная квартира',
			'Огромный прекрасный дворец',
			'Маленький ужасный дворец',
			'Красивый гостевой домик',
			'Некрасивый негостеприимный домик',
			'Уютное бунгало далеко от моря',
			'Неуютное бунгало по колено в воде'
		],
		priceMin: 1000,
		priceMax: 1000000,
		roomQuantity: 5,
		guestsMax: 10,
		checkin: [
			'12:00',
			'13:00',
			'14:00'
		],
		checkout: [
			'12:00',
			'13:00',
			'14:00'
		],
		features: [
			'wifi',
			'dishwasher',
			'parking',
			'washer',
			'elevator',
			'conditioner'
		],
		photos: [
			'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
			'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
			'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
		],
	};
	// создаем порядковый номер в виде строки для аватарки каждого пользователя:
	for (var i = 1; i <= params.numberOfUsers; i++) {
		if (i < 10) {
			params.avatarNumbers.push('0' + i);
		} else {
			params.avatarNumbers.push(i);
		}
	}
	// клонируем массивы, чтобы вносимые в них изменения не коснулись исходных массивов:
	var avatarNumbersClone = params.avatarNumbers.slice();
	var titleClone = params.title.slice();
	// создаем массив из объектов-объявлений:
	var randomAdverts = createAdvertsArr(params.numberOfUsers);

	Object.defineProperty(window, 'randomAdverts', {
		value: randomAdverts
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИИ:
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЧИСЕЛ:
	function getRandomNumber(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// КОНСТРУКТОР ОБЪЯВЛЕНИЙ:
	function RandomAdvert() {
		var randomIndex;
		var features = params.features.slice().sort(function(a, b) {
			return Math.random() - 0.5;
		});

		features.length = getRandomNumber(0, features.length);

		this.location = {
			x: getRandomNumber(0 + window.data.pinWidth / 2,
				window.data.mapWidth - window.data.pinWidth / 2),
			y: getRandomNumber(window.data.yMin, window.data.yMax)
		};

		randomIndex = getRandomNumber(0, avatarNumbersClone.length);
		this.author = {
			avatar: 'img/avatars/user'
		};
		this.author.avatar += avatarNumbersClone[randomIndex] + '.png';
		avatarNumbersClone.splice(randomIndex, 1);

		randomIndex = getRandomNumber(0, titleClone.length);
		this.offer = {
			title: titleClone[randomIndex],
			address: this.location.x + ', ' + this.location.y,
			price: Math.round(getRandomNumber(params.priceMin, params.priceMax) / 100) * 100,
			rooms: getRandomNumber(1, params.roomQuantity),
			guests: getRandomNumber(1, params.guestsMax),
			checkin: params.checkin[getRandomNumber(0, params.checkin.length)],
			checkout: params.checkout[getRandomNumber(0, params.checkout.length)],
			features: features,
			description: '',
			photos: params.photos.slice().sort(function(a, b) {
				return Math.random() - 0.5;
			})
		};

		var title = this.offer.title.slice().split(' ');

		if (~title.indexOf('квартира')) {
			this.offer.type = 'flat';
		} else if (~title.indexOf('дворец')) {
			this.offer.type = 'palace';
		} else if (~title.indexOf('домик')) {
			this.offer.type = 'house';
		} else if (~title.indexOf('бунгало')) {
			this.offer.type = 'bungalo';
		}

		titleClone.splice(randomIndex, 1);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// СОЗДАНИЕ МАССИВА ИЗ ОБЪЕКТОВ-ОБЪЯВЛЕНИЙ:
	function createAdvertsArr(numberOfUsers) {
		var arr = [];

		for (var i = 0; i < numberOfUsers; i++) {
			arr.push(new RandomAdvert());
		}

		return arr;
	}

})();
