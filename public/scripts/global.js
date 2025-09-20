function sendWebRequest(method, url, headers, data, onCompleted) {
    if (method && url) {
        let requestObject = {
            method, url,
            headers,
            success: function (d) { if (onCompleted) { onCompleted(null, d) } },
            error: function (e) { if (onCompleted) { onCompleted(e.responseText, null) } }
        }
        if (method != 'GET') { requestObject.data = data }
        $.ajax(requestObject)
    }
}
function sendJsonRequest(url, data, onCompleted) {
    if (url) {
        $.ajax({
            method: 'POST', url,
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (d) { if (onCompleted) { onCompleted(null, d) } },
            error: function (e) { if (onCompleted) { onCompleted(e, null) } }
        })
    }
}
function getPadNumber(number, maxLength, fillString) { return `${number}`.padStart(maxLength, fillString) }
function getJalaliDateText(date, innerCharachter) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate(), g_d_m, jalaliYear, jalaliMonth, jalaliDay, gy2, days; g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; if (year > 1600) { jalaliYear = 979; year -= 1600 } else { jalaliYear = 0; year -= 621 }
    gy2 = (month > 2) ? (year + 1) : year; days = (365 * year) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) + (parseInt((gy2 + 399) / 400)) - 80 + day + g_d_m[month - 1]; jalaliYear += 33 * (parseInt(days / 12053)); days %= 12053; jalaliYear += 4 * (parseInt(days / 1461)); days %= 1461
    if (days > 365) { jalaliYear += parseInt((days - 1) / 365); days = (days - 1) % 365 } jalaliMonth = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30); jalaliDay = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return `${jalaliYear}${innerCharachter ? innerCharachter : '/'}${getPadNumber(jalaliMonth, 2, '0')}${innerCharachter ? innerCharachter : '/'}${getPadNumber(jalaliDay, 2, '0')}`
}
function getJalaliDateTimeText(date, innerCharachter) { return `${getJalaliDateText(date, innerCharachter)} ${getPadNumber(date.getHours(), 2, '0')}:${getPadNumber(date.getMinutes(), 2, '0')}:${getPadNumber(date.getSeconds(), 2, '0')}` }
function openView(viewSelector) { $(viewSelector).addClass('open') }
function closeView(viewSelector) { $(viewSelector).removeClass('open') }