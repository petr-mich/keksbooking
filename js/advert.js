'use strict';
(function() {

	// определяем шаблон:
	var templ = document.querySelector('template').content;
	// определяем блок разметки, куда будет вставляться объявление:
	var map = document.querySelector('.map');
	// применим делегирование для назначения обработчиков событий для меток '.map__pin',
	// при наступлении которых будет показывается развернутый блок объявления '.map__card':
	var pinsMap = map.querySelector('.map__pins');

	pinsMap.addEventListener('click', showAdvert);
	// определим обработчик событий
	// для показа увеличенного изображения фотографий жилья в блоке '.popup__pictures':
	map.addEventListener('mouseover', showBigPhoto);
	map.addEventListener('mouseout', removeBigPhoto);

	Object.defineProperty(window, 'advert', {
		value: {
			closeAdvert: closeAdvert
		}
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИИ:
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// СОЗДАНИЕ ДОМ-ЭЛЕМЕНТА ОБЪЯВЛЕНИЯ:
	function createAdvert(obj, template) {
		var advElem = template.querySelector('.map__card').cloneNode(true);

		advElem.classList.add('map__pin--active');
		advElem.querySelector('.popup__avatar').src = obj.author.avatar;
		advElem.querySelector('.popup__title').textContent = obj.offer.title;
		advElem.querySelector('.popup__text--address').textContent = obj.offer.address;
		advElem.querySelector('.popup__price').textContent = obj.offer.price + '\u20B4/ночь';
		advElem.querySelector('.popup__type').textContent = createEstate();
		advElem.querySelector('.popup__text--capacity').textContent =
			obj.offer.rooms + createRoomsWord() + ' для ' + obj.offer.guests + createGuestsWord();
		advElem.querySelector('.popup__text--time').textContent =
			'Заезд после ' + obj.offer.checkin + ', выезд до ' + obj.offer.checkout;
		advElem.querySelector('.popup__description').textContent = obj.offer.description;
		advElem.querySelector('.popup__close').tabIndex = 0;

		renderFeatures();
		renderPhotos();

		return advElem;

		function createEstate() {
			var estate;

			switch (obj.offer.type) {
				case 'flat':
					estate = 'Квартира';
					break;
				case 'bungalo':
					estate = 'Бунгало';
					break;
				case 'house':
					estate = 'Дом';
					break;
				case 'palace':
					estate = 'Дворец';
					break;
			}

			return estate;
		}

		function createRoomsWord() {
			var roomsWord;

			if (obj.offer.rooms < 2) {
				roomsWord = ' комната';
			} else if (1 < obj.offer.rooms < 5) {
				roomsWord = ' комнаты';
			} else {
				roomsWord = ' комнат';
			}

			return roomsWord;
		}

		function createGuestsWord() {
			var guestsWord;

			if (obj.offer.guests < 2) {
				guestsWord = ' гостя';
			} else {
				guestsWord = ' гостей';
			}

			return guestsWord;
		}

		function renderFeatures() {
			var featuresList = advElem.querySelector('.popup__features');
			// убираем элементы разметки, если их нет в объекте:
			label: for (var i = 0; i < featuresList.children.length; i++) {
				var feature = featuresList.children[i].className.slice(
					featuresList.children[i].className.indexOf('feature--') + 'feature--'.length);

				for (var j = 0; j < obj.offer.features.length; j++) {
					if (feature === obj.offer.features[j]) {
						continue label;
					}
				}

				featuresList.children[i].remove();
				i--;
			}
		}

		function renderPhotos() {
			if (obj.offer.photos.length) {

				for (var k = 0; k < obj.offer.photos.length; k++) {
					var li = document.createElement('li');
					var img = document.createElement('img');
					img.src = obj.offer.photos[k];
					// временно укажем размеры фотографии:
					img.width = '40';
					img.alt = 'фотография жилья ' + (k + 1);
					img.title = 'фотография жилья ' + (k + 1);
					img.dataset.statePhoto = '';
					li.append(img);
					advElem.querySelector('.popup__pictures').append(li);
					li.style.fontSize = 0;
				}

			}
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ВСТАВКА ОБЪЯВЛЕНИЙ В HTML-РАЗМЕТКУ:
	function insertAdvert(obj, template, block) {
		template = template || templ;
		block = block || map;

		var advert = createAdvert(obj, template);

		block.querySelector('.map__filters-container').before(advert);

		return advert;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ОБРАБОТЧИК СОБЫТИЯ: ВЫВОД ОБЪЯВЛЕНИЯ:
	function showAdvert(evt) {
		var target = evt.target.closest('.map__pin:not(.map__pin--main)');

		if (!target) {
			return;
		}

		closeAdvert();

		var advert = insertAdvert(window.filterForm.advertsFiltered[target.indexOfObjInArr]);

		advert.querySelector('.popup__close').addEventListener('click', closeAdvert);

		document.addEventListener('keydown', closeAdvertWithEsc);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ВСТАВКА УВЕЛИЧЕННОГО ИЗОБРАЖЕНИЯ В HTML-РАЗМЕТКУ:
	function showBigPhoto(evt) {
		var target = evt.target.closest('[data-state-photo]');

		if (!target || !this.contains(target)) {
			return;
		}

		var photoContainer = document.createElement('div');
		photoContainer.style = 'display: block; position: fixed; z-index: 1000; max-width: 500px;';
		photoContainer.style.border = '2px solid #ccc';
		photoContainer.style.borderRadius = '5px';
		photoContainer.style.overflow = 'hidden';

		var photo = document.createElement('img');
		photo.style = 'display: block; max-width: 500px;';
		photo.src = target.src;

		photoContainer.append(photo);

		target.after(photoContainer);

		var left = target.getBoundingClientRect().right;
		var top = target.getBoundingClientRect().top - photoContainer.offsetHeight;

		photoContainer.style.left = left + 'px';

		if (top < 0) {
			photoContainer.style.top = 0 + 'px';
		} else {
			photoContainer.style.top = top + 'px';
		}

		target.photoContainer = photoContainer;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УДАЛЕНИЕ УВЕЛИЧЕННОГО ИЗОБРАЖЕНИЯ ИЗ HTML-РАЗМЕТКИ:
	function removeBigPhoto(evt) {
		var target = evt.target.closest('[data-state-photo]');

		if (!target && !this.contains(target)) {
			return;
		}

		target.photoContainer.remove();
		delete target.photoContainer;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ЗАКРЫТИЕ АКТИВНОГО ОБЪЯВЛЕНИЯ '.map__pin--active' С ПОМОЩЬЮ КЛАВИШИ 'Escape':
	function closeAdvertWithEsc(evt) {
		if (evt.key === 'Escape') {
			closeAdvert();
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ЗАКРЫТИЕ АКТИВНОГО ОБЪЯВЛЕНИЯ '.map__pin--active':
	function closeAdvert() {
		if (map.querySelector('.map__pin--active')) {
			map.querySelector('.map__pin--active').remove();
			document.removeEventListener('keydown', closeAdvertWithEsc);
		}
	}

})();
