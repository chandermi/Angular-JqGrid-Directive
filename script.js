	// create the module and name it jqGridApp
	var jqGridApp = angular.module('jqGridApp', ['data-grid']);

	
	

	// create the controller and inject Angular's $scope
	jqGridApp.controller('mainController', function($scope) {
	
	 $scope.patientdata = [];
    $scope.gridapi = {};

		$scope.config = {
        datatype: "local",
        height: 'auto',
        width: 'auto',
        colNames: ['Inv No', 'Date', 'Client', 'Amount','State', 'Tax', 'Total', 'Notes', 'Action'],
        colModel: [
            { name: 'actions', index: '', width: 80, formatoptions: { keys: false, editbutton: true, delbutton: true }, formatter: 'actions' },
     		{ name: 'id', index: 'id', width: 60, sorttype: "int", editable: true, },
     		{
     		    name: 'invdate', index: 'invdate', width: 90, sorttype: "date", editable: true, formatter: "date", editoptions: {
     		        size: 12, dataInit: function (el) {
     		            setTimeout(function () { $(el).datepicker(); $(el).datepicker("option", "dateFormat", "mm/dd/y"); }, 300);
     		        }
     		    }, sorttype: "date", datefmt: "Y-m-d", searchoptions: { sopt: ["eq", "ne", "lt", "le", "gt", "ge"] },
     		},
            {
                name: 'name', index: 'name', width: 90, sorttype: "text", editable: true, formatter: "text", editoptions: {
                    size: 12, dataInit: function (elem) {
                        setTimeout(function () {
                            $(elem).kendoAutoComplete({
                                minLength: 3,
                                ignoreCase: true,
                                placeholder: "Type patient name..",
                                suggest: true,
                                dataTextField: "FullName",
                                dataValueField: 'Id',
                                dataSource: {
                                    sync: function () {
                                        this.read();
                                    },

                                    type: "json",
                                    serverFiltering: true,
                                    transport: {
                                        read: "PatientsEdit/GetList",
                                        parameterMap: function (e) {

                                            return {
                                                startsWith: $('#patientId').val()
                                            };
                                        },
                                        success: function (response) {
                                            o.success(response);
                                        }
                                    }
                                },

                                select: function (e) {
                                    var item = e.item;
                                    var DataItem = this.dataItem(e.item.index());
                                    schedulerFactory.getPatientModelServices(DataItem.Id).then(function (data) {
                                        $('#birthDateDiv').html(DataItem.BirthDateString + " &nbsp;&nbsp;" + ((DataItem.BirthDateString) ? "(" + schedulerFactory.getAge(DataItem.BirthDateString) + ")" : ""));
                                        if (data.model.contact.phoneNumbers.length > 0) {
                                            $('#patientContactNoWorkSpan').html(data.model.contact.phoneNumbers[0] != undefined ? data.model.contact.phoneNumbers[0].number : " ");
                                            $('#patientContactNoSpan').html(data.model.contact.phoneNumbers[1] != undefined ? data.model.contact.phoneNumbers[1].number : " ");
                                            $('#patientContactNoHomeSpan').html(data.model.contact.phoneNumbers[2] != undefined ? data.model.contact.phoneNumbers[2].number : " ");
                                        }
                                        //$('#patientNoSpan').html(DataItem.SocialSecurityNumber);
                                        switch (DataItem.Gender) {
                                            case 0: $('#patientSexSpan').html("Unspecfied");
                                                break;
                                            case 1: $('#patientSexSpan').html("Male");
                                                break;
                                            case 2: $('#patientSexSpan').html("Female");
                                                break;
                                        }
                                    })



                                    $scope.patientId = DataItem.Id;
                                    console.log('Name : ' + DataItem.FullName + ', Id : ' + DataItem.Id);
                                    $scope.GetPatientHistory();

                                },
                                change: function (e) {

                                    if (e == 'save') {
                                        schedulerFactory.getPatient($('#patientId').val()).success(function (data) {

                                            $scope.patientId = data[0].Id;

                                        });
                                    }
                                    if ($scope.patientId == "") {
                                        $(elm).val('');
                                    } else {

                                    }
                                }
                            });;
                        }, 300);
                    }
                }, sorttype: "date", datefmt: "Y-m-d", searchoptions: { sopt: ["eq", "ne", "lt", "le", "gt", "ge"] },
            },
     		{
     		    name: 'name', index: 'name', width: 200,
     		    sortable: true,
     		    align: 'center',
     		    editable: true,
     		    cellEdit: true,
     		    edittype: 'select',
     		    formatter: 'select',

     		    editoptions: { value: getAllSelectOptions() }
     		},
     		{ name: 'amount', index: 'amount', width: 80, align: "right", sorttype: "float", editable: true, },
     		{ name: 'tax', index: 'tax', width: 80, align: "right", sorttype: "float", editable: true, },
     		{ name: 'total', index: 'total', width: 80, align: "right", sorttype: "float", editable: true, },
     		{ name: 'note', index: 'note', width: 150, sortable: false },
        ],
        multiselect: true,
        caption: "Patient Area",
        loadComplete: function () {
            var table = this;
            setTimeout(function () {
                styleCheckbox(table);

                updateActionIcons(table);
                updatePagerIcons(table);

            }, 0);
        },
        viewrecords: true,
        rowNum: 10,
        rowList: [10, 20, 30],
        autowidth: true,
        formatter: 'actions',
        formatoptions: {
            keys: true,
            editformbutton: true
        }
    };
    function getAllSelectOptions() {
        var states = {
            '1': 'Alabama', '2': 'California', '3': 'Florida',
            '4': 'Hawaii', '5': 'London', '6': 'Oxford'
        };

        return states;

    }

    function updatePagerIcons(table) {
        var replacement =
        {
            'ui-icon-seek-first': 'ace-icon fa fa-angle-double-left bigger-140',
            'ui-icon-seek-prev': 'ace-icon fa fa-angle-left bigger-140',
            'ui-icon-seek-next': 'ace-icon fa fa-angle-right bigger-140',
            'ui-icon-seek-end': 'ace-icon fa fa-angle-double-right bigger-140'
        };
        $('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function () {
            var icon = $(this);
            var $class = $.trim(icon.attr('class').replace('ui-icon', ''));

            if ($class in replacement) icon.attr('class', 'ui-icon ' + replacement[$class]);
        })
    }
    function styleCheckbox(table) {

        $(table).find('input:checkbox').addClass('ace')
        .wrap('<label />')
        .after('<span class="lbl align-top" />')


        $('.ui-jqgrid-labels th[id*="_cb"]:first-child')
        .find('input.cbox[type=checkbox]').addClass('ace')
        .wrap('<label />').after('<span class="lbl align-top" />');

    }
    function updateActionIcons(table) {

        var replacement =
        {
            'ui-ace-icon fa fa-pencil': 'ace-icon fa fa-pencil blue',
            'ui-ace-icon fa fa-trash-o': 'ace-icon fa fa-trash-o red',
            'ui-icon-disk': 'ace-icon fa fa-check green',
            'ui-icon-cancel': 'ace-icon fa fa-times red'
        };
        $(table).find('.ui-pg-div span.ui-icon').each(function () {
            var icon = $(this);
            var $class = $.trim(icon.attr('class').replace('ui-icon', ''));
            if ($class in replacement) icon.attr('class', 'ui-icon ' + replacement[$class]);
        })

    } $scope.modeldata = [
          { id: "1", invdate: new Date(), name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
          { id: "2", invdate: new Date(), name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
          { id: "3", invdate: new Date(), name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
          { id: "4", invdate: new Date(), name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
          { id: "5", invdate: new Date(), name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
          { id: "6", invdate: new Date(), name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
          { id: "7", invdate: new Date(), name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
          { id: "8", invdate: new Date(), name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
          { id: "9", invdate: new Date(), name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
          { id: "10", invdate: new Date(), name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
          { id: "11", invdate: new Date(), name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
          { id: "12", invdate: new Date(), name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
          { id: "13", invdate: new Date(), name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
          { id: "14", invdate: new Date(), name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
          { id: "15", invdate: new Date(), name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" },
          { id: "16", invdate: new Date(), name: "test", note: "note", amount: "200.00", tax: "10.00", total: "210.00" },
          { id: "17", invdate: new Date(), name: "test2", note: "note2", amount: "300.00", tax: "20.00", total: "320.00" },
          { id: "18", invdate: new Date(), name: "test3", note: "note3", amount: "400.00", tax: "30.00", total: "430.00" }
    ];
	$scope.loadrecord=function(){
	 $scope.gridapi.insert($scope.modeldata);
	}
		//Do Your Code here
});
	
	
