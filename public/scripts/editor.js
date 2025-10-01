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

function saveEditorChanges() {
    let Components = PROJECT_DATA.Components,
        SaveStateOfComponents = []
    for (let i = 0; i < Components.length; i++) {
        try { SaveStateOfComponents.push(Components[i].getSaveState()) } catch (e) { console.log(e) }
    }

    sendJsonRequest(`/api/saveProject/${PROJECT_ID}`, { Components: SaveStateOfComponents, Page: PROJECT_DATA.Page, ModificationDate: new Date().valueOf() }, function (err, data) {
        console.log({ err, data })
    })
}

function updateComponentTreeOnUI() {
    let cmpElems = ''
    for (let i = 0; i < PROJECT_DATA.Components.length; i++) {
        cmpElems +=
            `<div class="ComponentOnTree" data-component-id="${PROJECT_DATA.Components[i].ComponentId}" data-name="${PROJECT_DATA.Components[i].Name}">
                <div class="delete cupo" title="حذف کردن"></div>
            </div>`
    }
    $('#ComponentsTree .container').html(cmpElems)

    $('#ComponentsTree .ComponentOnTree').on('click', function (e) {
        let _this = $(this), ComponentId = _this.attr('data-component-id'), enabledEditMode = true
        if (_this.hasClass('selected')) {
            _this.removeClass('selected')
            enabledEditMode = false
        } else {
            _this.addClass('selected')
            enabledEditMode = true
        }
        Component.getComponentById(ComponentId).Element.trigger('click')
    })

    $('#ComponentsTree .ComponentOnTree .delete').on('click', function (e) {
        let ComponentId = $(this).parent().attr('data-component-id')
        Component.removeOmponentById(ComponentId)
        updateComponentTreeOnUI()
    })
}

function addComponentToPage(ComponentType, Left, Top) {
    switch (ComponentType) {
        case '3D Object': PROJECT_DATA.Components.push(new Component_3D({ ParentDiv: 'Page', Width: 100, Height: 40, Left, Top, Direction: PROJECT_DATA.Page.Direction })); break
        case 'Button': PROJECT_DATA.Components.push(new Component_Button({ ParentDiv: 'Page', Width: 100, Height: 40, Left, Top, Direction: PROJECT_DATA.Page.Direction })); break
        case 'Image': PROJECT_DATA.Components.push(new Component_Image({ ParentDiv: 'Page', Width: 640, Height: 427, Left, Top, Direction: PROJECT_DATA.Page.Direction })); break
        case 'Link': PROJECT_DATA.Components.push(new Component_Link({ ParentDiv: 'Page', Width: 100, Height: 40, Left, Top, Direction: PROJECT_DATA.Page.Direction })); break
        case 'Text': PROJECT_DATA.Components.push(new Component_Text({ ParentDiv: 'Page', Width: 100, Height: 40, Left, Top, Direction: PROJECT_DATA.Page.Direction })); break
        case 'Video': PROJECT_DATA.Components.push(new Component_Video({ ParentDiv: 'Page', Width: 640, Height: 360, Left, Top, Direction: PROJECT_DATA.Page.Direction })); break
    }
    updateComponentTreeOnUI()
}

function loadSavedPage() {
    let Components = PROJECT_DATA.Components
    PROJECT_DATA.Components = []

    for (let i = 0; i < Components.length; i++) {
        switch (Components[i].Type) {
            case '3D Object': PROJECT_DATA.Components.push(new Component_3D(Components[i])); break
            case 'Button': PROJECT_DATA.Components.push(new Component_Button(Components[i])); break
            case 'Image': PROJECT_DATA.Components.push(new Component_Image(Components[i])); break
            case 'Link': PROJECT_DATA.Components.push(new Component_Link(Components[i])); break
            case 'Text': PROJECT_DATA.Components.push(new Component_Text(Components[i])); break
            case 'Video': PROJECT_DATA.Components.push(new Component_Video(Components[i])); break
        }
    }
    updateComponentTreeOnUI()
}

let isAddingComponent = false
function setupComponentAdderButtons() {
    $('.ComponentAdder').on('click', function (e) {
        if (!isAddingComponent) {
            isAddingComponent = true
            let componentType = $(this).attr('data-type')
            $('#Page').addClass('addingNewComponent')
            $('#Page.addingNewComponent').one('click', function (e) {
                console.log(e)
                ///////// fix this part
                ///////// bug: when i click on another component, the new component offsetX and offsetY are calculated due to e.target (component)

                $(this).removeClass('addingNewComponent')
                addComponentToPage(componentType, e.offsetX, e.offsetY)

                isAddingComponent = false
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
        <div class="ComponentAdder cupo pd4-10" data-type="3D Object">3D Model</div>
        <div class="ComponentAdder cupo pd4-10" data-type="Button">Button</div>
        <div class="ComponentAdder cupo pd4-10" data-type="Image">Image</div>
        <div class="ComponentAdder cupo pd4-10" data-type="Link">Link</div>
        <div class="ComponentAdder cupo pd4-10" data-type="Text">Text</div>
        <div class="ComponentAdder cupo pd4-10" data-type="Video">Video</div>
        `
    $('#ComponentsAdder .container').html(componentsAdderElements)
    setupComponentAdderButtons()

    $('#Page').css({
        width: PROJECT_DATA.Page.Width,
        height: PROJECT_DATA.Page.Height * 2,
        direction: PROJECT_DATA.Page.Direction,
        'background-color': PROJECT_DATA.Page.BackgroundColor,
    })
    $('#Viewport').css({ width: PROJECT_DATA.Page.Width, height: PROJECT_DATA.Page.Height })

    $('#btnSaveEditorChanges').on('click', function (e) { saveEditorChanges() })

    const page = document.getElementById('Page')
    let isDragging = false,
        startX = 0, startY = 0,
        origLeft = 0, origTop = 0

    window.addEventListener('contextmenu', function (e) {
        e.preventDefault()
    })

    page.addEventListener('click', function (e) {
        console.log(!$(e.target).hasClass('Component'))

        if (!$(e.target).hasClass('Component')) {
            for (let i = 0; i < PROJECT_DATA.Components.length; i++) {
                PROJECT_DATA.Components[i].setEnableEditMode(false)
            }
        }
    })

    page.addEventListener('contextmenu', function (e) {
        e.preventDefault()
    })

    page.addEventListener('mousedown', function (e) {
        if (e.button !== 2) return // فقط کلیک راست
        e.preventDefault()

        isDragging = true
        startX = e.clientX
        startY = e.clientY

        origLeft = parseInt(window.getComputedStyle(page).left, 10)
        origTop = parseInt(window.getComputedStyle(page).top, 10)

        page.style.cursor = 'grabbing'
    })

    window.addEventListener('mousemove', function (e) {
        if (!isDragging) return

        const dx = e.clientX - startX
        const dy = e.clientY - startY

        page.style.left = `${origLeft + dx}px`
        page.style.top = `${origTop + dy}px`
    })

    window.addEventListener('mouseup', function (e) {
        if (isDragging && e.button === 2) {
            isDragging = false
            page.style.cursor = ''
        }
    })

    loadSavedPage()
})