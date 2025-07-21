let isuploading = false    // user can not upload another file when an upload in progress

function uploadToServer() {
    let form = document.getElementById('form_fileUploader'),
        formData = new FormData(form)

    if (!isuploading) {
        isuploading = true

        let xhr = new XMLHttpRequest()
        xhr.open(form.method, form.getAttribute('action'), true)

        xhr.upload.addEventListener('progress', function (ev) {
            let progress = Math.max(ev.loaded / ev.total * 100).toFixed(0)

            if (ev.lengthComputable) {
                console.log(progress + '%')

                if (progress == 100) {
                    form.reset()
                    isuploading = false
                }
            } else {
                console.log('0%')
            }
        })

        xhr.send(formData)
    } else {
        alert('Another file is uploading!')
    }
}