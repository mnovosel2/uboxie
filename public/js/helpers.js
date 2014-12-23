//initialize app namespace
var Uboxie = {};
Uboxie.Helpers = {
    createDynamicScrollbar: function(container, active, config) {
        console.log(container);
        if ($(container).parent('.slimScrollDiv').size() > 0) {
            $(container).parent().replaceWith($(container));
            if ($(container).find(active) > 0) {
                $(container).slimScroll(config);
            } else {
                console.log('not active');
                $(container).slimScroll(config);
            }
        }
    }
};
//extend jQuery with put and delete
function _ajax_request(url, data, callback, type, method) {
    if (jQuery.isFunction(data)) {
        callback = data;
        data = {};
    }
    return jQuery.ajax({
        type: method,
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
}

jQuery.extend({
    put: function(url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'PUT');
    },
    delete_: function(url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'DELETE');
    }
});
