Template.form.helpers({
	context: function () {
		this.dict = this.dict || new ReactiveDict();
		this.item = this.item || {};
		this.schema = this.schema || {};
		return _({}).chain().extend(this).extend({
			dict: this.dict
			, item: _({})
				.chain()
				.extend(this.item)
				.extend(this.dict.get('item') || {})
				.value()
			, source: this.item
			, get: function (name, property) {
				property = property || 'item';
				return (this.dict.get(property) || {})[name];
			}
			, set: function (name, value, property) {
				property = property || 'item';
				var val = this.dict.get(property) || {};
				val[name] = value;
				this.dict.set(property, val);
				if (property == 'item') validate(name, value);
			}
			, validate: function (name, value) {
				// XXX implement real validation
				// this dummy validation simply marks a field as
				// required if it exists in the schema.
				// XXX check for this.schema.onValidate
				var isValid = (!this.schema[name] || value);
				this.set(name, isValid, 'errors');
				return isValid;
			}
			, validateAll: function (throwOnInvalid) {
				var self = this;
				var valid = _.all(self.item, function (value, name) {
					return self.validate(name, value);
				});
				if (throwOnInvalid && !valid) {
					// XXX we should check this.dict.get('errors') for errors.
					throw new Error('Form is invalid');
				} else {
					return valid;
				}
			}
			, change: function (inputElement) {
				// XXX check for checkbox, etc.
				// XXX check for this.schema.onChange
				this.set(inputElement.name, inputElement.value);
			}
		}).value();
	}
});

Template.form.events({
	'submit form': function (e, tmpl) {
		if (typeof this.onSubmit == "function") {
			e.preventDefault();
			this.validateAll();
			this.onSubmit();
		}
	}
	// XXX update the selector to include all relevant events.
	, 'change input': function (e, tmpl) {
		if (typeof this.onChange == "function") {
			this.onChange(e, tmpl);
		}
	}
});

UI.registerHelper('withField', function (as, field) {
	if (typeof as != 'string') {
		field = as;
		as = 'field';
	}
	if (typeof as != 'string' || typeof field != 'object') {
		// XXX just return {} instead?
		throw new Error('Invalid arguments to withField helper.');
	}
	var extender = {};
	extender[as] = field.hash;
	var result = _.extend(_.extend({}, this), extender);
	return result;
});

UI.registerHelper('val', function (name, property) {
	if (typeof property != 'string') property = 'item';
	return this[property][name];
});

Forms = Forms || {};


