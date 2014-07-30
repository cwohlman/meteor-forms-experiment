Template.Home.helpers({
	item: function () {
		return {
			name: 'Joe'
		};
	}
	, nameField: function () {
		return {
			name: 'name'
			, type: 'text'
		};
	}
	, withField: function (field) {
		var result = _.extend(_.extend({}, this), {
			field: field.hash
		});
		return result;
	}
});

Template.Home.events({

});

Template.input.helpers({
	val: function (name) {
		return this.item[name];
	}
});

Template.input.events({
	'keyup input': function (e, tmpl) {
		var name = e.currentTarget.name;
		var value = e.currentTarget.value;
		var item = this.dict.get('item') || {};
		item[name] = value;
		this.dict.set('item', item);
	}
});
