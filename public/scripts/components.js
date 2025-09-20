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
    Direction = ''
    ZIndex = 0

    /**
     * 
     * @param {{Type:String, ParentDiv:String, ComponentId:Number, Width:Number, Height:Number, Left:Number, Top:Number, Src:String, Href:String, Tooltip:String, ModelUrl:String, Value:String, InnerText:String, Direction:String, ZIndex:Number}} stateObject 
     */
    constructor(stateObject) {
        this.Type = stateObject.Type
        this.ParentDiv = stateObject.ParentDiv
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
        this.Direction = stateObject.Direction
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
    Direction = ''
    ZIndex = 0
    #IsOnEditMode = false

    /**
     * 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(stateObject) {
        let _this = this

        this.ComponentId = stateObject.ComponentId ? stateObject.ComponentId : new Date().valueOf()
        this.ParentDiv = document.getElementById(stateObject.ParentDiv)
        this.Width = stateObject.Width ? stateObject.Width : 100
        this.Height = stateObject.Height ? stateObject.Height : 100
        this.Left = stateObject.Left ? stateObject.Left : 0
        this.Top = stateObject.Top ? stateObject.Top : 0
        this.Direction = stateObject.Direction ? stateObject.Direction : 'ltr'
        this.ZIndex = stateObject.ZIndex ? stateObject.ZIndex : 0

        this.Element = $(stateObject.ElemText)
        this.Element.css(this.getStyle())
        this.Element.attr('data-component-id', this.ComponentId)
        $(this.ParentDiv).append(this.Element)

        setTimeout(function () { _this.#setupEvents() }, 10)

        ALL_COMPONENTS_BY_ID[this.ComponentId] = this
    }

    static getComponentById(id) { return ALL_COMPONENTS_BY_ID[id] }
    static getType() { return this.Type }

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

    #reloadComponent() {
        console.log('reload')
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
        console.log({
            left: `${this.Left}px`,
            top: `${this.Top}px`,
            width: `${this.Width}px`,
            height: `${this.Height}px`,
            direction: this.Direction,
            'z-index': this.ZIndex
        })

        return {
            left: `${this.Left}px`,
            top: `${this.Top}px`,
            width: `${this.Width}px`,
            height: `${this.Height}px`,
            direction: this.Direction,
            'z-index': this.ZIndex
        }
    }

    /**
     * 
     * @returns C
     */
    getComponentProperties() {
        return {
            Type: { Type: 'NoEdit', Value: this.Type },
            Width: { Type: 'Number', Value: this.Width },
            Height: { Type: 'Number', Value: this.Height },
            Left: { Type: 'Number', Value: this.Left },
            Top: { Type: 'Number', Value: this.Top },
            Direction: { Type: 'Choice', Value: this.Direction, Values: [{ Value: 'ltr', Text: 'ltr' }, { Value: 'rtl', Text: 'rtl' }] },
            ZIndex: { Type: 'Number', Value: this.ZIndex },
        }
    }

    setValue(key, value) {
        this[key] = value
        this.#reloadComponent()
    }

    #showProperties(ComponentId) {
        let _this = this, propertyElems = '', getPropertyInput = function (key, value) {
            switch (value.Type) {
                case 'NoEdit':
                    return `<div data-type="${value.Type}">${value.Value}</div>`

                case 'Choice':
                    let choiceElems = `<select data-type="${value.Type}" data-key="${key}">`
                    for (let i = 0; i < value.Values.length; i++) {
                        choiceElems += `<option value="${value.Values[i].Value}" ${value.Values[i].Value == value.Value ? 'selected' : ''}>${value.Values[i].Text}</option>`
                    }
                    choiceElems += `</select>`
                    return choiceElems

                case 'String':
                    return `<input data-type="${value.Type}" data-key="${key}" type="text" value="${value.Value}">`

                case 'Number':
                    return `<input data-type="${value.Type}" data-key="${key}" type="number" value="${value.Value}">`

                default: return 'Not Supported Type!'
            }
        }
        for (const [key, value] of Object.entries(this.getComponentProperties())) {
            propertyElems +=
                `<div class="property" data-component-id="${ComponentId}">
                    <div class="key">${key}</div>
                    <div class="value">${getPropertyInput(key, value)}</div>
                </div>`
        }
        $('#ComponentsProperties .container').html(propertyElems)
        $(`.property[data-component-id="${ComponentId}"] .value>input,.property[data-component-id="${ComponentId}"] .value>select`).on('change', function (e) {
            let input = $(this)
            _this.setValue(input.attr('data-key'), input.val())
        })
    }

    #setupEvents() {
        let _this = this

        this.Element.on('click', function (e) {
            e.preventDefault()
            // if (!_this.#IsOnEditMode) {
            _this.#showProperties(_this.ComponentId)

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
}

class Component_3D extends Component {
    ModelUrl = ''

    /**
     * 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(stateObject) {
        stateObject.ModelUrl = stateObject.ModelUrl ? stateObject.ModelUrl : ''
        stateObject.ElemText = `<canvas class="Component Component_3D"></canvas>`
        super(stateObject)
        this.ModelUrl = stateObject.ModelUrl
        this.Type = '3D Object'
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ParentDiv: this.ParentDiv.id,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            ModelUrl: this.ModelUrl
        })
    }

    getComponentProperties() {
        return {
            Type: { Type: 'NoEdit', Value: this.Type },
            Width: { Type: 'Number', Value: this.Width },
            Height: { Type: 'Number', Value: this.Height },
            Left: { Type: 'Number', Value: this.Left },
            Top: { Type: 'Number', Value: this.Top },
            ZIndex: { Type: 'Number', Value: this.ZIndex },
            ModelUrl: { Type: 'String', Value: this.ModelUrl }
        }
    }
}

class Component_Button extends Component {
    Value = ''

    /**
     * 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(stateObject) {
        stateObject.Value = stateObject.Value ? stateObject.Value : 'دکمه'
        stateObject.ElemText = `<input class="Component Component_Button" type="button" value="${stateObject.Value}">`
        super(stateObject)
        this.Value = stateObject.Value
        this.Type = 'Button'
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ParentDiv: this.ParentDiv.id,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            Direction: this.Direction,
            ZIndex: this.ZIndex,
            Value: this.Value
        })
    }

    getComponentProperties() {
        return {
            Type: { Type: 'NoEdit', Value: this.Type },
            Width: { Type: 'Number', Value: this.Width },
            Height: { Type: 'Number', Value: this.Height },
            Left: { Type: 'Number', Value: this.Left },
            Top: { Type: 'Number', Value: this.Top },
            Direction: { Type: 'Choice', Value: this.Direction, Values: [{ Value: 'ltr', Text: 'ltr' }, { Value: 'rtl', Text: 'rtl' }] },
            ZIndex: { Type: 'Number', Value: this.ZIndex },
            Value: { Type: 'String', Value: this.Value }
        }
    }
}

class Component_Image extends Component {
    Src = ''
    Alt = ''

    /**
     * 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(stateObject) {
        stateObject.Src = stateObject.Src ? stateObject.Src : '/images/demoimg.jpg'
        stateObject.Alt = stateObject.Alt ? stateObject.Alt : 'تصویر'
        stateObject.ElemText = `<img class="Component Component_Image" src="${stateObject.Src}">`
        super(stateObject)
        this.Src = stateObject.Src
        this.Alt = stateObject.Alt
        this.Type = 'Image'
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ParentDiv: this.ParentDiv.id,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            Direction: this.Direction,
            ZIndex: this.ZIndex,
            Src: this.Src
        })
    }

    getComponentProperties() {
        return {
            Type: { Type: 'NoEdit', Value: this.Type },
            Width: { Type: 'Number', Value: this.Width },
            Height: { Type: 'Number', Value: this.Height },
            Left: { Type: 'Number', Value: this.Left },
            Top: { Type: 'Number', Value: this.Top },
            Direction: { Type: 'Choice', Value: this.Direction, Values: [{ Value: 'ltr', Text: 'ltr' }, { Value: 'rtl', Text: 'rtl' }] },
            ZIndex: { Type: 'Number', Value: this.ZIndex },
            Src: { Type: 'String', Value: this.Src }
        }
    }
}

class Component_Link extends Component {
    Href = ''
    Tooltip = ''
    InnerText = ''

    /**
     * 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(stateObject) {
        stateObject.Href = stateObject.Href ? stateObject.Href : '#'
        stateObject.Tooltip = stateObject.Tooltip ? stateObject.Tooltip : ''
        stateObject.InnerText = stateObject.InnerText ? stateObject.InnerText : 'لینک'
        stateObject.ElemText = `<a class="Component Component_Link" href="${stateObject.Href}" title="${stateObject.Tooltip}">${stateObject.InnerText}</a>`
        super(stateObject)
        this.Href = stateObject.Href
        this.Tooltip = stateObject.Tooltip
        this.InnerText = stateObject.InnerText
        this.Type = 'Link'
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ParentDiv: this.ParentDiv.id,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            Direction: this.Direction,
            ZIndex: this.ZIndex,
            Href: this.Href,
            Tooltip: this.Tooltip,
            InnerText: this.InnerText
        })
    }

    getComponentProperties() {
        return {
            Type: { Type: 'NoEdit', Value: this.Type },
            Width: { Type: 'Number', Value: this.Width },
            Height: { Type: 'Number', Value: this.Height },
            Left: { Type: 'Number', Value: this.Left },
            Top: { Type: 'Number', Value: this.Top },
            Direction: { Type: 'Choice', Value: this.Direction, Values: [{ Value: 'ltr', Text: 'ltr' }, { Value: 'rtl', Text: 'rtl' }] },
            ZIndex: { Type: 'Number', Value: this.ZIndex },
            Href: { Type: 'String', Value: this.Href },
            Tooltip: { Type: 'String', Value: this.Tooltip },
            InnerText: { Type: 'String', Value: this.InnerText }
        }
    }
}

class Component_Text extends Component {
    InnerText = 'متن شما'

    /**
     * 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(stateObject) {
        stateObject.InnerText = stateObject.InnerText ? stateObject.InnerText : 'متن'
        stateObject.ElemText = `<div class="Component Component_Text">${stateObject.InnerText}</div>`
        super(stateObject)
        this.InnerText = stateObject.InnerText
        this.Type = 'Text'
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ParentDiv: this.ParentDiv.id,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            Direction: this.Direction,
            ZIndex: this.ZIndex,
            InnerText: this.InnerText
        })
    }

    getComponentProperties() {
        return {
            Type: { Type: 'NoEdit', Value: this.Type },
            Width: { Type: 'Number', Value: this.Width },
            Height: { Type: 'Number', Value: this.Height },
            Left: { Type: 'Number', Value: this.Left },
            Top: { Type: 'Number', Value: this.Top },
            Direction: { Type: 'Choice', Value: this.Direction, Values: [{ Value: 'ltr', Text: 'ltr' }, { Value: 'rtl', Text: 'rtl' }] },
            ZIndex: { Type: 'Number', Value: this.ZIndex },
            InnerText: { Type: 'String', Value: this.InnerText }
        }
    }
}

class Component_Video extends Component {
    Src = ''

    /**
     * 
     * @param {ComponentSaveState} stateObject 
     */
    constructor(stateObject) {
        stateObject.Src = stateObject.Src ? stateObject.Src : ''
        stateObject.ElemText = `<video class="Component Component_Video" src="${stateObject.Src}"></video>`
        super(stateObject)
        this.Src = stateObject.Src
        this.Type = 'Video'
    }

    getSaveState() {
        return new ComponentSaveState({
            Type: this.Type,
            ParentDiv: this.ParentDiv.id,
            ComponentId: this.ComponentId,
            Width: this.Width,
            Height: this.Height,
            Left: this.Left,
            Top: this.Top,
            ZIndex: this.ZIndex,
            Src: this.Src
        })
    }

    getComponentProperties() {
        return {
            Type: { Type: 'NoEdit', Value: this.Type },
            Width: { Type: 'Number', Value: this.Width },
            Height: { Type: 'Number', Value: this.Height },
            Left: { Type: 'Number', Value: this.Left },
            Top: { Type: 'Number', Value: this.Top },
            ZIndex: { Type: 'Number', Value: this.ZIndex },
            Src: { Type: 'String', Value: this.Src }
        }
    }
}