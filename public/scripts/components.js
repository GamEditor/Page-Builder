const ALL_COMPONENTS_BY_ID = {}

class ComponentSaveState {
    Type = ''
    ComponentId = 0
    Width = 0
    Height = 0
    Left = 0
    Top = 0
    Src = ''
    Href = ''
    Tooltip = ''
    ModelUrl = ''
    Value = ''
    InnerText = ''
    ZIndex = 0

    /**
     * 
     * @param {{Type:String, ComponentId:Number, Width:Number, Height:Number, Left:Number, Top:Number, Src:String, Href:String, Tooltip:String, ModelUrl:String, Value:String, InnerText:String, ZIndex:Number}} stateObject 
     */
    constructor(stateObject) {
        this.Type = stateObject.Type
        this.ComponentId = stateObject.ComponentId
        this.Width = stateObject.Width
        this.Height = stateObject.Height
        this.Left = stateObject.Left
        this.Top = stateObject.Top
        this.Src = stateObject.Src
        this.Href = stateObject.Href
        this.Tooltip = stateObject.Tooltip
        this.ModelUrl = stateObject.ModelUrl
        this.Value = stateObject.Value
        this.InnerText = stateObject.InnerText
        this.ZIndex = stateObject.ZIndex
    }
}

class Component {
    Type = ''
    ComponentId
    ParentDiv
    Width = 100
    Height = 50
    Left = 0
    Top = 0
    Element // all properties like left, top, width, height, etc can get directly from this attribute and save into related properties
    ZIndex = 0
    #IsOnEditMode = false

    constructor(componentId, parentDiv, elemText, width, height, left, top) {
        let _this = this

        this.ComponentId = componentId ? componentId : new Date().valueOf()
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

        ALL_COMPONENTS_BY_ID[this.ComponentId] = this
    }

    static getComponentById(id) {
        return ALL_COMPONENTS_BY_ID[id]
    }

    #setupEvents() {
        let _this = this

        this.Element.on('click', function (e) {
            e.preventDefault()
            // if (!_this.#IsOnEditMode) {
            _this.setEnableEditMode(true, 'single')
            // }
        })

        let isDragging = false, offsetX, offsetY

        this.Element.on('mousedown', function (e) {
            isDragging = true

            const rect = this.getBoundingClientRect(),
                scale = _this.#getParentScale()

            offsetX = (e.clientX - rect.left) / scale;
            offsetY = (e.clientY - rect.top) / scale;

            _this.Element.css({ opacity: '0.8', 'box-shadow': '0 0 10px rgba(0,0,0,0.5)' })

            e.preventDefault()
        })

        this.ParentDiv.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const scale = _this.#getParentScale(),
                parentRect = _this.ParentDiv.getBoundingClientRect(),
                mouseX = (e.clientX - parentRect.left) / scale,
                mouseY = (e.clientY - parentRect.top) / scale,
                newLeft = mouseX - offsetX,
                newTop = mouseY - offsetY

            _this.setPosition(newLeft, newTop)
        })

        this.ParentDiv.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false
                _this.Element.css({ opacity: '1', 'box-shadow': 'none' })
            }
        })
    }

    /**
     * 
     * @param {Boolean} enabled 
     * @param {'single'|'multiple'} selectionMode 
     */
    setEnableEditMode(enabled, selectionMode) {
        this.#IsOnEditMode = enabled

        if (selectionMode == 'single') {
            let otherComponentElems = $(`.Component`)
            otherComponentElems.removeClass('Editable')
        }

        if (this.#IsOnEditMode) {
            this.Element.addClass('Editable')
            this.#setupResizeHandle(this.#IsOnEditMode)
        } else {
            this.Element.removeClass('Editable')
            this.#setupResizeHandle(this.#IsOnEditMode)
        }
    }

    /**
     * 
     * @returns Number
     */
    #getParentScale() {
        const transform = window.getComputedStyle(this.ParentDiv).transform
        if (transform === 'none') { return 1 }
        const matrix = transform.match(/^matrix\((.+)\)$/)
        return matrix ? parseFloat(matrix[1].split(', ')[0]) : 1
    }

    /**
     * 
     * @param {Boolean} isEditable 
     */
    #setupResizeHandle(isEditable) {
        if (!isEditable) {
            const resizeHandle = document.createElement('div')
            resizeHandle.classList.add('resize-handle')
            this.Element.append(resizeHandle)

            let isResizing = false
            let startX, startY, startWidth, startHeight
            const _this = this

            resizeHandle.addEventListener('mousedown', function (e) {
                e.stopPropagation()
                e.preventDefault()

                const scale = _this.#getParentScale()
                isResizing = true

                startX = e.clientX
                startY = e.clientY
                startWidth = _this.Width
                startHeight = _this.Height

                document.body.style.cursor = 'nwse-resize'
            })
        } else {
            $(this.Element).find('.resize-handle').remove()
        }
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

    setZIndex(zIndex) {
        this.ZIndex = zIndex
    }

    getStyle() {
        return {
            left: `${this.Left}px`,
            top: `${this.Top}px`,
            width: `${this.Width}px`,
            height: `${this.Height}px`,
            'z-index': this.ZIndex
        }
    }

    /**
     * 
     * @param {ComponentSaveState} savedState 
     */
    reload(savedState) {
        this.Type = savedState.Type
        this.ComponentId = savedState.ComponentId
        this.Width = savedState.Width
        this.Height = savedState.Height
        this.Left = savedState.Left
        this.Top = savedState.Top
    }

    static getType() { return this.Type }
}

class Component_3D extends Component {
    ModelUrl = ''

    /**
     * 
     * @param {*} parentDiv 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(parentDiv, stateObject) {
        const elemText = `<canvas class="Component Component_3D"></canvas>`
        super(stateObject.ComponentId, parentDiv, elemText, stateObject.Width, stateObject.Height, stateObject.Left, stateObject.Top)
        this.Type = '3D Object'
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            ModelUrl: this.ModelUrl
        })
    }
}

class Component_Button extends Component {
    Value = ''

    /**
     * 
     * @param {*} parentDiv 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(parentDiv, stateObject) {
        const elemText = `<input class="Component Component_Button" type="button" ${stateObject.Value ? `value="${stateObject.Value}"` : 'value="دکمه"'}>`
        super(stateObject.ComponentId, parentDiv, elemText, stateObject.Width, stateObject.Height, stateObject.Left, stateObject.Top)
        this.Type = 'Button'
    }

    setValue(value) {
        if (value) { this.Value = value }
        this.Element.val(this.Value)
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            Value: this.Value
        })
    }
}

class Component_Image extends Component {
    Src = ''

    /**
     * 
     * @param {*} parentDiv 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(parentDiv, stateObject) {
        const elemText = `<img class="Component Component_Image" ${stateObject.Src ? `src="${stateObject.Src}"` : 'src="/images/demoimg.jpg"'}>`
        super(stateObject.ComponentId, parentDiv, elemText, stateObject.Width, stateObject.Height, stateObject.Left, stateObject.Top)
        this.Type = 'Image'
    }

    setSource(src) {
        if (src) { this.Src = src }
        this.Element.attr('src', this.Src)
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            Src: this.Src
        })
    }
}

class Component_Link extends Component {
    Href = ''
    Tooltip = ''
    InnerText = ''

    /**
     * 
     * @param {*} parentDiv 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(parentDiv, stateObject) {
        const elemText = `<a class="Component Component_Link" ${stateObject.Href ? `href="${stateObject.Href}"` : 'href=""'} ${stateObject.Tooltip ? `title="${stateObject.Tooltip}"` : 'title=""'}>${stateObject.InnerText ? stateObject.InnerText : 'لینک'}</a>`
        super(stateObject.ComponentId, parentDiv, elemText, stateObject.Width, stateObject.Height, stateObject.Left, stateObject.Top)
        this.Type = 'Link'
    }

    setLink(href, tooltip, innerText) {
        if (href) { this.Href = href }
        this.Element.attr('href', this.Href)

        if (tooltip) { this.Tooltip = tooltip }
        this.Element.attr('title', this.Tooltip)

        if (innerText) { this.InnerText = innerText }
        this.Element.html(this.InnerText)
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            Href: this.Href,
            Tooltip: this.Tooltip,
            InnerText: this.InnerText
        })
    }
}

class Component_Text extends Component {
    InnerText = 'متن شما'

    /**
     * 
     * @param {*} parentDiv 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(parentDiv, stateObject) {
        const elemText = `<div class="Component Component_Text">${stateObject.InnerText ? stateObject.InnerText : 'متن'}</div>`
        super(stateObject.ComponentId, parentDiv, elemText, stateObject.Width, stateObject.Height, stateObject.Left, stateObject.Top)
        this.Type = 'Text'
    }

    setInnerText(text) {
        if (text) { this.InnerText = text }
        this.Element.html(this.InnerText)
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            InnerText: this.InnerText
        })
    }
}

class Component_Video extends Component {
    Src = ''

    /**
     * 
     * @param {*} parentDiv 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(parentDiv, stateObject) {
        const elemText = `<video class="Component Component_Video" ${stateObject.Src ? `src="${stateObject.Src}"` : 'src=""'}></video>`
        super(stateObject.ComponentId, parentDiv, elemText, stateObject.Width, stateObject.Height, stateObject.Left, stateObject.Top)
        this.Type = 'Video'
    }

    setSource(src) {
        if (src) { this.Src = src }
        this.Element.attr('src', this.Src)
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            Src: this.Src
        })
    }
}