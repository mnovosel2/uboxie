//initialize app namespace
var Uboxie = {};
Uboxie.Helpers = {
    createDynamicScrollbar: function(container, active, config) {
        var activeElement=$(container).find(active);
        if ($(container).parent('.slimScrollDiv').size() > 0) {
            config.wheelStep=10;
            $(container).parent().replaceWith($(container));    
            if (activeElement.length > 0) {
                config.start=$(active);
                $(container).slimScroll(config);
            } else {
                delete config.start;
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
