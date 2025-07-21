function sendWebRequest(method, url, data, onCompleted) {
    if (method && url) {
        let requestObject = {
            method, url,
            success: function (d) { if (onCompleted) { onCompleted(null, d) } },
            error: function (e) { if (onCompleted) { onCompleted(e, null) } }
        }
        if (method != 'GET') { requestObject.data = data }
        $.ajax(requestObject)
    }
}
function openView(viewSelector) { $(viewSelector).addClass('open') }
function closeView(viewSelector) { $(viewSelector).removeClass('open') }