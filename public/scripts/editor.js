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
$(function (e) {
    console.log(PROJECT_DATA)
    $('#Page').css({ width: PROJECT_DATA.Page.Width, height: PROJECT_DATA.Page.Height * 2, transform: 'scale(0.4)' })
    $('#Viewport').css({ width: PROJECT_DATA.Page.Width, height: PROJECT_DATA.Page.Height })
})

    (function ($) {
        var isCtrl = false;

        function ctrlCheck(e) {
            if (e.which === 17) {
                isCtrl = e.type === 'keydown' ? true : false;
            }
        }

        function wheelCheck(e, delta) {
            // `delta` will be the distance that the page would have scrolled;
            // might be useful for increasing the SVG size, might not
            if (isCtrl) {
                e.preventDefault();
                yourResizeMethod(delta);
            }
        }

        $(document).
            keydown(ctrlCheck).
            keyup(ctrlCheck).
            mousewheel(wheelCheck);
    }(jQuery));