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
				property = typeof property == 'string' ? property : 'item';
				return (this.dict.get(property) || {})[name];
			}
			, set: function (name, value, property) {
				property = property || 'item';
				var val = this.dict.get(property) || {};
				val[name] = value;
				this.dict.set(property, val);
				if (property == 'item') this.validate(name, value);
			}
			, validate: function (name, value, schema) {
				// XXX implement real validation
				// this dummy validation simply marks a field as
				// required if it exists in the schema.
				// XXX check for this.schema.onValidate
				schema = schema || this.schema || {};
				var isValid = (!schema[name] || value);
				this.set(name, !isValid, 'errors');
				return isValid;
			}
			, validateAll: function (throwOnInvalid, schema) {
				var self = this;
				schema = schema || this.schema || {};
				var valid = _.all(schema, function (value, name) {
					return self.validate(name, self.item[name], schema);
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

// XXX We could write events here - this would properly scope the events handlers
// however this makes it hard to customize the event handlers on a per form basis.

//Template.form.events({
//	'submit form': function (e, tmpl) {
//		if (typeof this.onSubmit == "function") {
//			e.preventDefault();
//			this.validateAll();
//			this.onSubmit();
//		}
//	}
//	// XXX update the selector to include all relevant events.
//	, 'change input': function (e, tmpl) {
//		if (typeof this.onChange == "function") {
//			this.onChange(e, tmpl);
//		}
//	}
//	, 'keyup input': function (e, tmpl) {
//		if (typeof this.onChange == "function" && this.changeOnKeyup) {
//			this.onChange(e, tmpl);
//		}
//	}
//});

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

UI.registerHelper('val', function (name, property) {
	if (typeof property != 'string') property = 'item';
	return (typeof this.get == 'function' && this.get(name, property)) || (this[property] || {})[name];
});

Forms = Forms || {};

// XXX these paramaters are backwards compatible
// if we give up on backwards compatability,
// we can convert this to an object.
Forms.handleSubmit = function (
	template
	, formSelector
	, schema
	, onSubmit
	, onChange
	, onInvalid
	) {

	var events = {};
	formSelector = formSelector || 'form';

	// There's a difference between onChange and onInvalid, 
	onInvalid = typeof onInvalid !== "function" ? Forms.defaultErrorHandler : onInvalid;
	onChange = onChange === false || typeof onChange === "function" ? onChange : Forms.defaultChangeHandler;

	if (typeof onSubmit === "function") {
		events["submit " + formSelector] = function (e, tmpl) {
			e.preventDefault();

			var formIsValid = this.validateAll(false, schema);
			if (!formIsValid) {
				// XXX don't return if function returns true? false?
				return onInvalid(this.dict.get('errors'));
			}
			onSubmit.apply(this, [
					this.item
					, null // XXX make this backwards compatable by passing the 'form' object
					, e
					, tmpl
				]);
		};
	}
	if (typeof onChange === "function") {
		var eventSelector = _([
			// XXX move this to Events.defaultChangeSelector
			// populate this array with other input change events, such as
			// ['change', 'select'], ['change', 'checkbox'] etc.
			["change", "input"]
		]).map(function (selector) {
			return [selector[0], formSelector, selector[1]].join(" ");
		}).join(", ");

		events[eventSelector] = function (e, tmpl) {
			var value = Forms.getValue(e.currentTarget);
			onChange.apply(this, [
				e
				, tmpl
				, value.name
				, value.value
				, onInvalid
				]);
			// // XXX we run the value afterwards here
			// var valueIsValid = this.validate(value.name, value.value, schema);
			// if (!valueIsValid) {
			// 	// XXX don't return if function returns true? false?
			// 	return onInvalid(_.pluck(this.dict.get('errors'), value.name));
			// }
		};
	}

	template.events(events);
};

Forms.getValue = function (inputElement) {
	// XXX replace this simplistic code with logic 
	// that checks for element type, etc and correctly returns
	// values for checkboxes, radio buttons, select boxes, etc.
	return {
		name: inputElement.name
		, value: inputElement.value
	};
};

Forms.defaultChangeHandler = function (e, tmpl, name, value, onInvalid) {
	this.set(name, value);
};

Forms.defaultErrorHandler = function (errors) {
	// errors is an object with a key/value pair for every error
	console.log('Errors in form', errors);
	throw new Error('Form is invalid.');
};
