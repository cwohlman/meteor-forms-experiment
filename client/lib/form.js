Forms = Forms || {};

Forms.helpers = {
	get: function (property, name) {
		// returns this.dict[property][name] || this[property][name]
		// includes null checks, property defaults to 'item'
		// pass null for name to return the entire this.dict[property]
		// will extend this[property] with values from dict[property]
		if (arguments.length === 0) {
			name = null;
			prop = "item";
		} else if (arguments.length == 1) {
			name = property;
			property = "item";
		}
		if (!property) throw new Error("No property name specified - can't get value.");

		var dictEntry = this.dict.get(property);
		var itemObject = this[property];

		if (!name) {
			return _({}).chain().extend(itemObject || {}).extend(dictEntry || {}).value();
		}

		return (dictEntry && dictEntry[name]) || (itemObject && itemObject[name]);
	}
	, set: function (property, name, value) {
		if (arguments.length == 1) {
			value = property
			name = null;
			property = 'item';
		} else if (arguments.length == 2) {
			value = name;
			name = property;
			property = 'item';
		}
		if (!property) throw new Error("No property name specified - can't get value.");
		// it's perfectly acceptable to set the value to null or undefined.

		var dictEntry = this.dict.get(property) || {};
		
		if (name) dictEntry[name] = value;
		else dictEntry = value;

		this.dict.set(property, dictEntry);

		if (property == "item") {
			if (name) return this.validate(name, value);
			else return this.validateAll();
		}
	}
	, validate: function (name, value, schema) {
		var self = this;
		schema = schema || this.get('schema', name);

		var errors = _.map(schema, function (options, key) {
			var validator = self.get('validators', key);
			
			try {
				return typeof validator === "function" && validator.call(self, value, options, name);
			} catch (error) {
				return error;
			}
			
		});
		
		errors = _.values(errors);

		errors = _.filter(errors, _.identity);

		this.set('errors', name, errors.length ? errors : null);

		return errors.length === 0;
	}
	, validateAll: function (item, schema) {
		var self = this;
		if (arguments.length === 0) {
			schema = this.dict.get('schema') || this.schema;
			item = null;
		} else if (arguments.length == 1) {
			schema = item || this.dict.get('schema') || this.schema;
			item = null;
		}
		var errors = _.map(schema, function (options, key) {
			return self.validate(key, self.get(key), options);
		});
		
		errors = _.values(errors);

		errors = _.filter(errors, function (e) {
			return !e;
		});

		return errors.length === 0;
	}
	, inputValue: function (element) {
		return {
			name: element.name
			, value: element.value
		};
	}
	// constants
	, validators: {
		required: function (value, options) {
			if (!value && options) {
				return "This field is required";
			}
		}
		, number: function(val, options, fieldName){
			// Validate that val is a valid number
			if(!_.isFinite(val)){
				return (fieldName + ' must be a number.');
			}

			// Validate that val meets given criteria (e.g. {larger: 4, smaller: 8})
			if ( _.isObject(options) ) {
				for (var key in options) {
					var num =options[key];
					switch (key) {
						case 'smaller':
							if (!(val < num)) return (fieldName + ' must be smaller than ' + num);
							break;
						case 'smallerOrEqual':
							if (!(val <= num)) return (fieldName + ' must be smaller than or equal to ' + num);
							break;
						case 'equal':
							if (!(val === num)) return (fieldName + ' must be equal to ' + num);
							break;
						case 'largerOrEqual':
							if (!(val >= num)) return (fieldName + ' must be larger than or equal to ' + num);
							break;
						case 'larger':
							if (!(val > num)) return (fieldName + ' must be larger than ' + num);
							break;
					}
				}
			}
		}
		, minLength: function(val, length, fieldName){
			if(!_.isString(val) || val.length < length){
				return (fieldName + ' must be at least ' + length + ' characters.')
			}
		}
		, maxLength: function(val, length, fieldName){
			if(!_.isString(val) || val.length > length){
				return (fieldName + ' must be ' + length + ' characters or less.')
			}
		}
		, isOneOf: function(val, options, fieldName){
			if(!_.contains(options, val)){
				return (fieldName + ' must be one of ' + options.join(', '));
			}
		}
		, usPhoneNumber: function(val, options, fieldName){
			val = val.replace(/[^0-9]/g, '');
			if(val.length !== 10){
				return (fieldName + ' must be a valid phone number.');
			}
		}
		, positiveNumber: function(val, options, fieldName){
			val = Number(val);
			if(val <= 0 || !_.isFinite(val)){
				return (fieldName + ' must be a positive number.');
			}
		}
		, negativeNumber: function(val, options, fieldName){
			val = Number(val);
			if(val >= 0 || !_.isFinite(val)){
				return (fieldName + ' must be a negative number.');
			}
		}
		, email: function(val, options, fieldName){
			if(!emailRegex.test(val) || val.indexOf('.', val.indexOf('@')) == -1){
				return (fieldName + ' must be a valid email address.');
			}
		}
		, url: function(val, options, fieldName){
			if(!urlRegex.test(val)){
				return (fieldName + ' must be a valid url.');
			}
		}
	}
};

Forms.handlers = {
	onSubmit: function () {}
	, onChange: function (e, tmpl, name, value) {
		this.set(name, value);
	}
	, onInvalid: function (errors) {
		console.log('Errors in form', errors);
		alert('Errors in form');
		throw new Error('Form is invalid.');
	}
};

Forms.events = {
	'submit': function (e, tmpl) {
		if (typeof this.onSubmit == 'function') {
			e.preventDefault();

			var formIsValid = this.validateAll();
			if (formIsValid) {
					this.onSubmit(
						_.chain(this.item).clone().extend(this.dict.get('item') || {}).value()
						, null // XXX make this backwards compatable by passing the 'form' object
						, e
						, tmpl
					);
			} else if (typeof this.onInvalid == 'function') {
				this.onInvalid(this.get('errors', null));
			}
		}
	}
	, 'change': function (e, tmpl) {
		if (typeof this.onChange == 'function') {
			var value = Forms.helpers.inputValue(e.currentTarget);
			this.onChange(e, tmpl, value.name, value.value);
		}
		if (typeof this.onSubmit == 'function' && this.liveSubmit) {
			Forms.events.submit.apply(this, arguments);
		}
	}
	, 'liveChange': function (e, tmpl) {
		var value;
		if (typeof this.onLiveChange == 'function') {
			value = Forms.helpers.inputValue(e.currentTarget);
			this.onLiveChange(e, tmpl, value.name, value.value);
		}
		if (typeof this.onChange == 'function' && this.liveChange) {
			value = Forms.helpers.inputValue(e.currentTarget);
			this.onChange(e, tmpl, value.name, value.value);
		}
	}
};

Forms.eventSelectors = {
	'submit': [
		['submit', 'form']
	]
	, 'change': [
		["change", "input"]
		, ["change", "select"]
		, ["change", "textarea"]
		, ["change", "checkbox"]
		, ["change", "radio"]
	]
	, 'liveChange': [
		["keydown", "input"]
		, ["keydown", "textarea"]
	]
};

Template.form.helpers({
	context: function () {
		this.dict = this.dict || new ReactiveDict();

		_.extend(this, Forms.helpers);

		if (typeof this.onSubmit == "function") {
			// XXX I actually think we should do this regardless
			// - but for backwards compatablility we need
			// a way to flag the form as being a legacy .handleSubmit
			// style.
			_.defaults(this, Forms.handlers);
		}

		if (typeof this.onSubmit == "function" && typeof this.onChange != "function" && this.onChange !== false) {
			this.onChange = Forms.defaultChangeHandler;
		}

		return this;
	}
});

Template.form.events(
	_.chain(Forms.eventSelectors)
	.pairs()
	.map(function (a) {
		var selector = a[1];
		selector = _.map(selector, function (part) {
			return part.join(" ");
		}).join(", ");
		var handler = Forms.events[a[0]];
		return [selector, handler];
	})
	.object()
	.value()
);

UI.registerHelper('withField', function () {

	var args = _.toArray(arguments);
	var objs = _.filter(args, function (a) {
		return typeof a === "object" &&
		(
			!a.hash ||
			_.keys(a.hash).length
		);
	});
	var strs = _.filter(args, function (a) {return typeof a === "string";});

	var as = strs[0] || 'field';
	var field = objs.length > 1 ? objs[1] : objs[0];
	var self = objs.length > 1 ? objs[0] : this;

	if (typeof as != 'string' || typeof field != 'object' || typeof self != 'object') {
		// XXX just return {} instead?
		throw new Error('Invalid arguments to withField helper.');
	}
	var extender = {};
	extender[as] = field.hash || field;
	var result = _.extend(_.extend({}, self), extender);
	return result;
});

UI.registerHelper('val', function (property, name) {
	var args = _.toArray(arguments).slice(0, -1);
	if (typeof this.get === "function") return this.get.apply(
		this
		, args
		);
	else {
		if (args.length == 1) {
			name = property;
			property = "item";
		}
		return this[property] && this[property][name];
	}
});

// XXX these paramaters are backwards compatible
// if we give up on backwards compatability,
// we can convert this to an object.
Forms.handleSubmit = function (
	template
	, formSelector
	, schema
	, onSubmit
	, onChange
	, onLiveChange
	, onInvalid
	) {

	var handlers = _.clone(Forms.handlers)
		, events = {};

	if (typeof onSubmit == 'function') handlers.onSubmit = onSubmit;
	if (typeof onChange == 'function') handlers.onChange = onChange;
	if (typeof onLiveChange == 'function') handlers.onLiveChange = onLiveChange;
	if (typeof onInvalid == 'function') handlers.onInvalid = onInvalid;

	formSelector = formSelector || 'form';

	if (schema) {
		console.log('Better to specify schema as an argument to the form block helper - this allows schema to be used on change');
	}

	var makeHandler = function (func) {
		return function () {
			var self = _({}).extend(this);
				self = _(self).extend(handlers);
			return func.apply(self, arguments);
		};
	};

	if (typeof handlers.onSubmit === "function") {
		events["submit " + formSelector] = makeHandler(Forms.events.submit);
	}
	if (typeof handlers.onChange === "function") {
		var eventSelector = _(Forms.eventSelectors.change).map(function (selector) {
			return [selector[0], formSelector, selector[1]].join(" ");
		}).join(", ");

		events[eventSelector] = makeHandler(Forms.events.change);
	}
	if (typeof handlers.onLiveChange === "function" || onLiveChange === true) {
		var eventSelector = _(Forms.eventSelectors.liveChange).map(function (selector) {
			return [selector[0], formSelector, selector[1]].join(" ");
		}).join(", ");

		events[eventSelector] = makeHandler(Forms.events.liveChange);
	}

	template.events(events);
};


