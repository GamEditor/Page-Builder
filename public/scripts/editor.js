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

function addComponentToPage(componentType, left, top) {
    console.log({ left, top })
    let newComponent
    switch (componentType) {
        case 'Component_3D':
            newComponent = new Component_3D('Page', 100, 40, left, top)
            break

        case 'Component_Button':
            newComponent = new Component_Button('Page', 100, 40, left, top)
            break

        case 'Component_Image':
            newComponent = new Component_Image('Page', 100, 40, left, top)
            break

        case 'Component_Link':
            newComponent = new Component_Link('Page', 100, 40, left, top)
            break

        case 'Component_Text':
            newComponent = new Component_Text('Page', 100, 40, left, top)
            break

        case 'Component_Video':
            newComponent = new Component_Video('Page', 100, 40, left, top)
            break
    }

    PROJECT_DATA.Components.push(newComponent)
}

let isAddingComponent = false
function setupComponentAdderButtons() {
    $('.ComponentAdder').on('click', function (e) {
        if (!isAddingComponent) {
            let componentType = $(this).attr('data-type')
            $('#Page').addClass('addingNewComponent')
            $('#Page.addingNewComponent').one('click', function (e) {
                console.log(e)

                $(this).removeClass('addingNewComponent')
                addComponentToPage(componentType, e.offsetX, e.offsetY)
            })
        }
    })
}

let zoomLevel = 1
const zoomSpeed = 0.1
document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) {
        e.preventDefault()

        if (e.deltaY < 0) {
            zoomLevel += zoomSpeed
        } else {
            zoomLevel -= zoomSpeed
        }

        zoomLevel = Math.min(Math.max(zoomLevel, 0.2), 1)

        const target = document.getElementById('Page')
        if (target) {
            target.style.transform = `scale(${zoomLevel})`
            target.style.transformOrigin = 'center center'
        }
    }
}, { passive: false })

$(function (e) {
    console.log(PROJECT_DATA)

    let componentsAdderElements =
        `
        <div class="ComponentAdder cupo pd4-10" data-type="${Component_3D.name}">${Component_3D.getType()}</div>
        <div class="ComponentAdder cupo pd4-10" data-type="${Component_Button.name}">${Component_Button.getType()}</div>
        <div class="ComponentAdder cupo pd4-10" data-type="${Component_Image.name}">${Component_Image.getType()}</div>
        <div class="ComponentAdder cupo pd4-10" data-type="${Component_Link.name}">${Component_Link.getType()}</div>
        <div class="ComponentAdder cupo pd4-10" data-type="${Component_Text.name}">${Component_Text.getType()}</div>
        <div class="ComponentAdder cupo pd4-10" data-type="${Component_Video.name}">${Component_Video.getType()}</div>
        `
    $('#ComponentsAdderComponentsContainer').html(componentsAdderElements)
    setupComponentAdderButtons()

    $('#Page').css({
        width: PROJECT_DATA.Page.Width,
        height: PROJECT_DATA.Page.Height * 2,
        direction: PROJECT_DATA.Page.Direction,
        'background-color': PROJECT_DATA.Page.BackgroundColor,
        // transform: 'scale(0.4)',
    })
    $('#Viewport').css({ width: PROJECT_DATA.Page.Width, height: PROJECT_DATA.Page.Height })
})