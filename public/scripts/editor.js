function uploadToServer() {
    let form = document.getElementById('form_fileUploader'),
        formData = new FormData(form),
        xhr = new XMLHttpRequest()

    xhr.open(form.method, form.getAttribute('action'), true)
    xhr.upload.addEventListener('progress', function (ev) {
        let progress = Math.max(ev.loaded / ev.total * 100).toFixed(0)

        if (ev.lengthComputable) {
            console.log(progress + '%')

            if (progress == 100) {
                form.reset()
            }
        } else {
            console.log('0%')
        }
    })
    xhr.send(formData)
}

let zoomLevel = 1 // مقدار اولیه زوم
const zoomSpeed = 0.1
document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) {
        e.preventDefault()

        if (e.deltaY < 0) {
            zoomLevel += zoomSpeed
        } else {
            zoomLevel -= zoomSpeed
        }

        zoomLevel = Math.min(Math.max(zoomLevel, 0.2), 1) // بین 0.5 تا 3

        const target = document.getElementById('EditorArea')
        if (target) {
            target.style.transform = `scale(${zoomLevel})`
            target.style.transformOrigin = 'center center'
        }
    }
}, { passive: false })

$(function (e) {
    console.log(PROJECT_DATA)
    $('#Page').css({
        width: PROJECT_DATA.Page.Width,
        height: PROJECT_DATA.Page.Height * 2,
        direction: PROJECT_DATA.Page.Direction,
        'background-color': PROJECT_DATA.Page.BackgroundColor,
        // transform: 'scale(0.4)',
    })
    $('#Viewport').css({ width: PROJECT_DATA.Page.Width, height: PROJECT_DATA.Page.Height })
})