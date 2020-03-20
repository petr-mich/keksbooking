'use strict';
(function() {

	// определяем шаблон:
	var templ = document.querySelector('template').content;
	// определяем блок разметки, куда будут вставляться метки:
	var pinsMap = document.querySelector('.map__pins');

	Object.defineProperty(window, 'pin', {
		value: {
			insertPins: insertPins,
			removePins: removePins
		}
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИИ:
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// СОЗДАНИЕ ДОМ-ЭЛЕМЕНТА МЕТКИ:
	function createPin(obj, indexOfObjInArr, template) {
		var pinElem = template.querySelector('.map__pin').cloneNode(true);

		pinElem.style.left = obj.location.x + 'px';
		pinElem.style.top = obj.location.y - window.data.pinHeight / 2 -
			window.data.pinPointerHeight + 'px';
		pinElem.firstElementChild.src = obj.author.avatar;
		pinElem.firstElementChild.alt = obj.offer.title;
		// свойство со значением индекса объекта в массиве 'Adverts':
		pinElem.indexOfObjInArr = indexOfObjInArr;

		return pinElem;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ВСТАВКА МЕТОК В HTML-РАЗМЕТКУ:
	function insertPins(arrOfObj, template, block) {
		template = template || templ;
		block = block || pinsMap;

		var fragment = document.createDocumentFragment();

		for (var i = 0; i < arrOfObj.length; i++) {
			fragment.append(createPin(arrOfObj[i], i, template));
		}

		block.append(fragment);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// УДАЛЕНИЕ МЕТОК ИЗ HTML-РАЗМЕТКИ:
	function removePins(block) {
		block = block || pinsMap;

		var pins = block.querySelectorAll('.map__pin:not(.map__pin--main)');

		for (var i = 0; i < pins.length; i++) {
			pins[i].remove();
		}
	}

})();
