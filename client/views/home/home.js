Template.Home.helpers({
	item: function () {
		return {
			name: 'Joe'
			, children: [
				{
					name: 'sam'
				}
				, {
					name: 'betsy'
				}
			]
		};
	}
	, nameField: function () {
		return {
			name: 'name'
			, type: 'text'
		};
	}
	, schema: function () {
		return {
			name: {
				required: true
				, type: "text"
			}
			, age: {
				required: true
				, type: "number"
			}
			, child: {
				required: true
				, type: 'text'
			}
		};
	}
});

Template.Home.events({
	'click .btn-iamjoe': function (e, tmpl) {
		this.set('name', 'Joe Bloh');
	}
	, 'submit .form-simple': function (e, tmpl) {
		e.preventDefault();
		alert("I am: " + this.item.name + "\n" + JSON.stringify(this.item));
	}
	, 'change .form-simple input': function (e, tmpl) {
		this.set("name", e.currentTarget.value);
	}
	, 'click [type="radio"]': function (e, tmpl) {

	}
});

Template.autoForm.helpers({
	schemaFields: function () {
		return _.map(this.schema, function (value, key) {
			return _.chain({}).extend(value).extend({
				name: key
			}).value();
		});
	}
});

Template.inputGroup.helpers({
	controlClass: function () {
		return 'form-control';
	}
	, inputLabel: function () {
		return this.field.label || this.field.title || this.field.name;
	}
	, groupClass: function () {
		return this.get('errors', this.field.name) ? 'has-error' : '';
	}
});

Forms.handleSubmit(
	Template.Home
	, '.form-basic'
	, {
		name: {
			required: true
		}
	}
	, function (values) {
		alert(JSON.stringify(values));
	}
	);

Forms.handleSubmit(
	Template.Home
	, '.form-complex'
	, null
	, function (values) {
		alert(JSON.stringify(values));
	}
	);


