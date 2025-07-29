class Component {
    Type = ''
    ComponentId
    ParentDiv
    Width = 100
    Height = 50
    Left = 0
    Top = 0
    Element // all properties like left, top, width, height, etc can get directly from this attribute and save into related properties

    constructor(parentDiv, elemText, width, height, left, top) {
        let _this = this

        this.ComponentId = new Date().valueOf()
        this.ParentDiv = document.getElementById(parentDiv)
        this.Width = width
        this.Height = height
        this.Left = left
        this.Top = top

        this.Element = $(elemText)
        this.Element.css(this.getStyle())
        this.Element.attr('data-component-id', this.ComponentId)
        $(this.ParentDiv).append(this.Element)

        setTimeout(function () { _this.#setupEvents() }, 10)
    }

    #setupEvents() {
        let _this = this

        this.Element.on('click', function (e) {
            e.preventDefault()

            let otherComponentElems = $(`.Component`), elem = $(this)

            otherComponentElems.removeClass('Editable')
            elem.addClass('Editable')
        })

        let isDragging = false, offsetX, offsetY

        this.Element.on('mousedown', function (e) {
            isDragging = true

            const rect = this.getBoundingClientRect(),
                scale = _this.#getCurrentScale()

            offsetX = (e.clientX - rect.left) / scale;
            offsetY = (e.clientY - rect.top) / scale;

            _this.Element.css({ opacity: '0.8', 'box-shadow': '0 0 10px rgba(0,0,0,0.5)' })

            e.preventDefault()
        })

        this.ParentDiv.addEventListener('mousemove', (e) => {
            if (!isDragging) {
                return
            }

            const scale = _this.#getCurrentScale(),
                left = ((e.clientX - offsetX) * (scale + window.scrollX)) / scale,
                top = ((e.clientY - offsetY) * (scale + window.scrollY)) / scale


            _this.setPosition(left, top)
        })

        this.ParentDiv.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false
                _this.Element.css({ opacity: '1', 'box-shadow': 'none' })
            }
        })
    }

    #getCurrentScale() {
        const transform = window.getComputedStyle(this.ParentDiv).transform
        if (transform === 'none') { return 1 }
        const matrix = transform.match(/^matrix\((.+)\)$/)
        return matrix ? parseFloat(matrix[1].split(', ')[0]) : 1
    }

    setPosition(left, top) {
        this.Left = left
        this.Top = top
        this.Element.css({ left: `${left}px`, top: `${top}px` })
    }

    setSize(width, height) {
        this.Width = width
        this.Height = height
        this.Element.css({ width: `${width}px`, height: `${height}px` })
    }

    getStyle() {
        return {
            left: `${this.Left}px`,
            top: `${this.Top}px`,
            width: `${this.Width}px`,
            height: `${this.Height}px`
        }
    }

    getSizeAndPosition() {
        return {
            Left: this.Left,
            Top: this.Top,
            Width: this.Width,
            Height: this.Height
        }
    }

    static getType() { return 'Component' }
}

class Component_3D extends Component {
    ModelUrl = ''

    constructor(parentDiv, width, height, left, top) {
        const elemText = `<canvas class="Component Component_3D"></canvas>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return '3D Object' }
}

class Component_Button extends Component {
    Value = 'دکمه'

    constructor(parentDiv, width, height, left, top) {
        const elemText = `<input class="Component Component_Button" type="button" value="دکمه">`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Button' }
}

class Component_Image extends Component {
    Src = ''

    constructor(parentDiv, width, height, left, top) {
        const elemText = `<img class="Component Component_Image" src="">`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Image' }
}

class Component_Link extends Component {
    Href = ''
    Title = 'عنوان لینک'
    Tooltip = 'عنوان tooltip'

    constructor(parentDiv, width, height, left, top) {
        const elemText = `<a class="Component Component_Link" href="" title="عنوان tooltip">عنوان لینک</a>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Link' }
}

class Component_Text extends Component {
    InnerText = ''

    constructor(parentDiv, width, height, left, top) {
        const elemText = `<div class="Component Component_Text"></div>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Text' }
}

class Component_Video extends Component {
    Src = ''

    constructor(parentDiv, width, height, left, top) {
        const elemText = `<video class="Component Component_Video" src=""></video>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Video' }
}