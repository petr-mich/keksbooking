'use strict';
(function() {

	var prices = {
		bungalo: 0,
		flat: 1000,
		house: 5000,
		palace: 10000
	};
	// главная метка:
	var pinMain = document.querySelector('.map__pin--main');
	// переведем все поля в неактивное состояние:
	var noticeForm = document.forms.notice;
	var avatarImg = noticeForm.querySelector('.notice__preview img');

	var avatarFIReader = new window.fIReaders.DropFIReader({
		fileInput: noticeForm.avatar,
		resultHandler: insertAvatarImage,
		fileTypes: ['jpeg', 'jpg', 'png', 'gif', 'svg'],
		dropbox: noticeForm.avatar.labels[0]
	});
	var photosContainer = noticeForm.querySelector('.form__photo-container');
	// используем метод 'getElementsByClassName' для нахождения 'живой' коллекции:
	var addedImages = photosContainer.getElementsByClassName('upload-photo-image');

	var estateFIReader = new window.fIReaders.DropFIReader({
		fileInput: noticeForm.images,
		resultHandler: insertEstatePhotos,
		fileTypes: ['jpeg', 'jpg', 'png', 'gif'],
		dropbox: noticeForm.images.labels[0]
	});
	// при запуске страницы форма 'noticeForm' не доступна для пользователя:
	disableNoticeForm();
	// первоначальные значения селекта 'rooms' и селекта 'capacity' должны изменяться синхронно:
	matchRoomsWithCapacity(noticeForm.elements.rooms.value);
	// первоначальные координаты адреса метки 'pinMain':
	enterCurrentAddressCoords();
	// в зависимости от значения элемента 'type' формы 'notice' меняется значение плейсхолдера элемента 'price':
	noticeForm.elements.type.addEventListener('change', matchEstateWithPricePlaceholder);
	// изменения в поле 'timein' формы 'notice__form' синхронно меняют значение в поле 'timeout' и на оборот:
	noticeForm.elements.timein.addEventListener('change', function() {
		noticeForm.elements.timeout.selectedIndex = this.selectedIndex;
	});
	noticeForm.elements.timeout.addEventListener('change', function() {
		noticeForm.elements.timein.selectedIndex = this.selectedIndex;
	});
	// при изменении значения в селекте 'rooms' синхронно изменяется значение селекта 'capacity':
	noticeForm.elements.rooms.addEventListener('change', function() {
		var capacities = noticeForm.elements.capacity.options;
		// сбросим по умолчанию значения свойства 'disabled' каждого элемента 'option' селекта 'capacity':
		Array.prototype.forEach.call(capacities, function(item) {
			if (item.hidden) {
				item.hidden = false;
			}
		});

		for (var i = 0; i < this.options.length; i++) {
			if (this.value === i + 1 + '') {
				matchRoomsWithCapacity(this.value);
				break;
			}
			if (this.value === '100') {
				matchRoomsWithCapacity(0, null);
				break;
			}
		}
	});
	// перед отправкой формы 'notice__form' проводится её валидация для нового объявления:
	noticeForm.addEventListener('submit', function(evt) {
		evt.preventDefault();

		var isValid = true;

		resetAllFieldsErrors(this);

		switch (true) {
			case this.elements.title.value === '':
				isValid = false;
				addErrorMessage(this.elements.title, 'Обязательное поле');
				break;
			case this.elements.title.value.length <= 30 || this.elements.title.value.length >= 100:
				isValid = false;
				addErrorMessage(this.elements.title, 'Поле должно содержать от 30 до 100 символов');
				break;
		}

		switch (true) {
			case this.elements.price.value === '':
				isValid = false;
				addErrorMessage(this.elements.price, 'Обязательное поле');
				break;
			case this.elements.price.value > 1000000:
				isValid = false;
				addErrorMessage(this.elements.price, 'Значение не должно превышать<br>1 000 000');
				break;
			case +this.elements.price.value < this.elements.price.placeholder:
				isValid = false;
				addErrorMessage(this.elements.price, 'Значение не должно быть меньше ' + this.elements.price.placeholder);
				break;
		}

		if (isValid) {
			var formData = new FormData(noticeForm);

			window.backend.save('https://js.dump.academy/keksobooking', formData, setMapAndFormByDefault);
		}
	});
	// при нажатии кнопки '.form__reset' формы 'notice__form'
	// происходит установка карты '.map', форм 'notice' и 'filter' в исходное состояние:
	noticeForm.querySelector('.form__reset').addEventListener('click', function(evt) {
		evt.preventDefault();
		setMapAndFormByDefault();
		resetAllFieldsErrors(noticeForm);
	});

	Object.defineProperty(window, 'noticeForm', {
		value: {
			enableNoticeForm: enableNoticeForm,
			enterCurrentAddressCoords: enterCurrentAddressCoords
		}
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИИ:
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ВСТАВКА АВАТАРКИ-ИЗОБРАЖЕНИЯ:
	function insertAvatarImage(images) {
		avatarImg.src = images[0];
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ВСТАВКА ФОТОГРАФИЙ ЖИЛЬЯ ДЛЯ ОБЪЯВЛЕНИЯ:
	function insertEstatePhotos(photos) {
		// удаление ранее вставленных фотографий:
		if (addedImages.length > 0) {
			removePrevAddedImages();
		}

		for (var i = 0; i < photos.length; i++) {
			photosContainer.insertAdjacentHTML('beforeend',
				'<div class="upload-photo-image"><img src="' + photos[i] + '" alt=""></div>');

			if (addedImages.length >= photosContainer.dataset.imgMaxnumber) {
				return;
			}
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УДАЛЕНИЕ ВСЕХ ФОТОГРАФИЙ ЖИЛЬЯ ДЛЯ ОБЪЯВЛЕНИЯ:
	function removePrevAddedImages() {
		for (var i = addedImages.length - 1; addedImages.length > 0; i--) {
			addedImages[i].remove();
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// СИНХРОННАЯ УСТАНОВКА ЗНАЧЕНИЙ СЕЛЕКТОВ 'ROOMS' И 'CAPACITY':
	function matchRoomsWithCapacity(roomsAmount, zero) {
		var capacities = noticeForm.elements.capacity.options;

		if (zero === undefined) {
			zero = '0';
		}

		for (var i = 0; i < capacities.length; i++) {
			if (capacities[i].value > roomsAmount || capacities[i].value === zero) {
				capacities[i].hidden = true;
			}
		}
		// синхронно выбирается значение селекта 'capacity' в соответствии с выбранным значением селектора 'rooms':
		for (i = 0; i < capacities.length; i++) {
			if (!capacities[i].hidden) {
				noticeForm.elements.capacity.value = capacities[i].value;
				break;
			}
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// СИНХРОННАЯ УСТАНОВКА ЗНАЧЕНИЯ СЕЛЕКТА 'TYPE' И ПЛЕЙСХОЛДЕРА ИНПУТА 'PRICE':
	function matchEstateWithPricePlaceholder() {
		var estate = noticeForm.elements.type;
		noticeForm.elements.price.placeholder = prices[estate.value];
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  РАЗБЛОКИРОВКА ФОРМЫ 'notice':
	function enableNoticeForm() {
		noticeForm.classList.remove('notice__form--disabled');

		for (var i = 0; i < noticeForm.querySelectorAll('fieldset').length; i++) {
			noticeForm.querySelectorAll('fieldset')[i].disabled = false;
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  БЛОКИРОВКА ФОРМЫ 'notice':
	function disableNoticeForm() {
		noticeForm.classList.add('notice__form--disabled');

		for (var i = 0; i < noticeForm.querySelectorAll('fieldset').length; i++) {
			noticeForm.querySelectorAll('fieldset')[i].disabled = true;
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ВСТАВКА ТЕКУЩИХ КООРДИНАТ МЕТКИ В ПОЛЕ ФОРМЫ 'ADDRESS':
	function enterCurrentAddressCoords() {
		var pinMainCenterX = pinMain.offsetLeft;
		var pinMainBottomY = Math.round(pinMain.offsetTop + pinMain.offsetHeight / 2 +
			window.data.pinMainPointerHeight);

		noticeForm.address.value = pinMainCenterX + ', ' + pinMainBottomY;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УСТАНОВКА КАРТЫ '.map', ФОРМ 'notice' и 'filter' И В ИСХОДНОЕ СОСТОЯНИЕ:
	function setMapAndFormByDefault() {
		resetNoticeForm();
		window.filterForm.resetFilterForm();
		enterCurrentAddressCoords();
		matchEstateWithPricePlaceholder();
		window.map.disableMap();
		window.map.resetPinMain();
		window.filterForm.disableFilterForm();
		window.pin.removePins();
		window.advert.closeAdvert();
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УСТАНОВКА ЗНАЧЕНИЙ ПОЛЕЙ ФОРМЫ ПО УМОЛЧАНИЮ:
	function resetNoticeForm() {
		noticeForm.reset();
		// аватарка по умолчанию:
		insertAvatarImage([avatarImg.dataset.imgSrc]);

		removePrevAddedImages();
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ДОБАВЛЕНИЕ СООБЩЕНИЯ ОБ ОШИБКЕ ДЛЯ ПОЛЯ ФОРМЫ:
	function addErrorMessage(field, errorMessage) {
		var errorIntervalLeft = 4;
		var errorIntervalTop = 1;
		var error = document.createElement('span');
		var fieldLeft = field.getBoundingClientRect().left - field.parentNode.getBoundingClientRect().left;
		var fieldBottom = field.getBoundingClientRect().bottom - field.parentNode.getBoundingClientRect().top;

		field.classList.add('error');
		field.parentNode.style.position = 'relative';

		error.classList.add('error-message');
		error.innerHTML = errorMessage;
		error.style.left = fieldLeft + errorIntervalLeft + 'px';
		error.style.top = fieldBottom + errorIntervalTop + 'px';
		error.style.width = field.offsetWidth - errorIntervalLeft + 'px';

		field.parentNode.append(error);
		field.error = error;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УДАЛЕНИЕ СООБЩЕНИЯ ОБ ОШИБКЕ ДЛЯ ПОЛЯ ФОРМЫ:
	function resetFieldError(field) {
		if (field.classList.contains('error')) {
			field.classList.remove('error');
			field.error.remove();
			delete field.error;
			field.parentNode.style.position = '';
		}
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УДАЛЕНИЕ ВСЕХ СООБЩЕНИИЙ ОБ ОШИБКЕ ДЛЯ ВСЕХ ПОЛЕЙ ФОРМЫ:
	function resetAllFieldsErrors(form) {
		for (var i = 0; i < form.elements.length; i++) {
			resetFieldError(form.elements[i]);
		}
	}

})();
