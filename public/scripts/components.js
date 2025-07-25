class Component {
    Type = ''
    ComponentId
    ParentDiv
    Width = 100
    Height = 50
    Left = 0
    Top = 0
    Element // all properties like left, top, with, height, etc can get directly from this attribute and save into related properties

    /**
     * 
     * @param {HTMLElement} parentDiv 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} left 
     * @param {Number} top 
     */
    constructor(parentDiv, elemText, width, height, left, top) {
        this.ComponentId = new Date().valueOf()
        this.ParentDiv = parentDiv
        this.Width = width
        this.Height = height
        this.Left = left
        this.Top = top

        this.Element = $(this.ParentDiv).append(elemText)
        this.Element.css(this.getStyle())
        this.Element.attr('data-component-id', this.ComponentId)

        $(`.Component[data-id="${this.ComponentId}"]`).on('click', function () { })
    }

    setPosition(left, top) {
        this.Left = left
        this.top = top
    }

    setSize(width, height) {
        this.Width = width
        this.Height = height
    }

    getStyle() {
        return { left: `${this.Left}px`, top: `${this.Top}px`, width: `${this.Width}px`, height: `${this.Height}px` }
    }

    getSizeAndPosition() {
        return { Left: this.Left, Top: this.Top, Width: this.Width, Height: this.Height }
    }

    static getType() { return 'Component' }
}

class Component_3D extends Component {
    ModelUrl = ''

    /**
     * 
     * @param {HTMLElement} parentDiv 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} left 
     * @param {Number} top 
     */
    constructor(parentDiv, width, height, left, top) {
        let elemText = `<canvas class="Component Component_3D"></canvas>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return '3D Object' }
}

class Component_Button extends Component {
    Value = 'دکمه'

    constructor(parentDiv, width, height, left, top) {
        super(parentDiv, elemText, width, height, left, top)
        let elemText = `<input class="Component Component_Button" type="button" value="${this.Value}">`
    }

    static getType() { return 'Button' }
}

class Component_Image extends Component {
    Src = ''

    /**
     * 
     * @param {HTMLElement} parentDiv 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} left 
     * @param {Number} top 
     */
    constructor(parentDiv, width, height, left, top) {
        let elemText = `<img class="Component Component_Image" src="">`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Image' }
}

class Component_Link extends Component {
    Href = ''
    Title = 'عنوان لینک'
    Tooltip = 'عنوان tooltip'

    /**
     * 
     * @param {HTMLElement} parentDiv 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} left 
     * @param {Number} top 
     */
    constructor(parentDiv, width, height, left, top) {
        let elemText = `<a class="Component Component_Link" Href="" title="${this.Tooltip}">${this.Title}</a>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Link' }
}

class Component_Text extends Component {
    InnerText = ''

    /**
     * 
     * @param {HTMLElement} parentDiv 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} left 
     * @param {Number} top 
     */
    constructor(parentDiv, width, height, left, top) {
        let elemText = `<div class="Component Component_Text">${this.InnerText}</div>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Text' }
}

class Component_Video extends Component {
    Src = ''

    /**
     * 
     * @param {HTMLElement} parentDiv 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} left 
     * @param {Number} top 
     */
    constructor(parentDiv, width, height, left, top) {
        let elemText = `<video class="Component Component_Text" src=""></video>`
        super(parentDiv, elemText, width, height, left, top)
    }

    static getType() { return 'Video' }
}