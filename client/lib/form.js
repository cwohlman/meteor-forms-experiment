Template.form.helpers({
	context: function () {
		this.dict = this.dict || new ReactiveDict();
		this.item = this.item || {};
		return {
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
			}
		};
	}
});

UI.registerHelper('withField', function (as, field) {
	if (typeof as != 'string' && typeof field == 'object') {
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