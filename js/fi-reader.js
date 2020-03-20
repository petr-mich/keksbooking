'use strict';
(function() {

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ФУНКЦИЯ-КОНСТРУКТОР ЧТЕНИЯ ФАЙЛА ИЗ 'input' type="file":
	function FIReader(options) {
		this._fileInput = options.fileInput;
		this._resultHandler = options.resultHandler;
		this._fileTypes = options.fileTypes;

		this._fileInput.addEventListener('change', this.onFileInputChange.bind(this));
	}


	FIReader.prototype.onFileInputChange = function() {
		this.handleFiles(this._fileInput.files);
	};

	FIReader.prototype.handleFiles = function(files) {
		var results = [];
		var self = this;

		for (var i = 0; i < files.length; i++) {

			if (this._fileTypes) {
				var matches = this._fileTypes.some(function(item) {
					return files[i].name.slice(files[i].name.lastIndexOf('.') + 1) === item;
				});

				if (!matches) {
					continue;
				}
			}

			var reader = new FileReader();

			reader.onload = function(evt) {
				results.push(evt.currentTarget.result);

				if (results.length === files.length) {
					self._resultHandler(results);
				}
			};

			reader.readAsDataURL(files[i]);
		}
	};

	FIReader.prototype.reset = function() {
		this._fileInput.files = new DataTransfer().files;
	};
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// РАСШИРЕННАЯ ФУНКЦИЯ-КОНСТРУКТОР ЧТЕНИЯ ФАЙЛА ИЗ 'input' type="file" (С ТЕХНОЛОГИЕЙ 'drag & drop'):
	function DropFIReader(options) {
		FIReader.apply(this, arguments);

		this._dropbox = options.dropbox;
		this._dropbox.addEventListener('dragenter', this.onDrag.bind(this));
		this._dropbox.addEventListener('dragover', this.onDrag.bind(this));
		this._dropbox.addEventListener('drop', this.onDrop.bind(this));
	}

	DropFIReader.prototype = Object.create(FIReader.prototype);
	DropFIReader.prototype.constructor = DropFIReader;

	DropFIReader.prototype.onDrag = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
	};

	DropFIReader.prototype.onDrop = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		if (this._fileInput.disabled ||
			this._fileInput.closest('fieldset') && this._fileInput.closest('fieldset').disabled) {
			return;
		}

		var files = evt.dataTransfer.files;

		if (files.length > 1 && !this._fileInput.multiple) {
			return;
		}

		this._fileInput.files = files;

		this.handleFiles(files);
	};

	Object.defineProperty(window, 'fIReaders', {
		value: {
			FIReader: FIReader,
			DropFIReader: DropFIReader
		}
	});

})();
