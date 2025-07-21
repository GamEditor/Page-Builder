class Component {
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
    constructor(parentDiv, width, height, left, top) {
        this.ComponentId = new Date().valueOf()
        this.ParentDiv = parentDiv
        this.Width = width
        this.Height = height
        this.Left = left
        this.Top = top
    }

    getStyle() {
        return `left: ${this.Left}px; top: ${this.Top}px; width: ${this.Width}px; height: ${this.Height}px`
    }
}

class Component_3D extends Component {
    ModelUrl = ''

    constructor() {

    }
}

class Component_Button extends Component {
    Value = 'دکمه'

    constructor(parentDiv, width, height, left, top) {
        super(parentDiv, width, height, left, top)
        let e = `<input data-id="${this.ComponentId}" type="button" class="Component_Button" value="$${this.Value}" style="${this.getStyle()}">`
        this.ParentDiv.append(e)
    }
}

class Component_Image extends Component {
    Src = ''
}

class Component_Link extends Component {
    Href = ''
}

class Component_Text extends Component {
    InnerText = ''
}

class Component_Video extends Component {
    Src = ''
}