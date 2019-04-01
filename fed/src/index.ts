const STORE_KEY = 'pingbi'
let pingbi: Array<any>
let toolBox: HTMLElement

let JSONEX = {
    stringify: function(obj: any){
        let jsonified: any = {}
        // loop through object and write string and type to newly stored data structure
        for(let i in obj) {
            jsonified[i] = {
                // some voodoo to determine the variable type
                type: Object.prototype.toString.call(obj[i]).split(/\W/)[2],
                value: obj[i].toString()
            }
        }
        return JSON.stringify(jsonified)
    },

    parse: function(json: string){
        let objectified: any = {}
        let obj:any = JSON.parse(json)
        // loop through object, and handle parsing of string according to type
        for(let i in obj) {
            if(obj[i].type == "RegExp"){
                var m = obj[i].value.match(/\/(.*)\/([a-z]+)?/)
                objectified[i] = new RegExp(m[1],m[2]);
            } else if(obj[i].type == "String"){
                objectified[i] = obj[i].value
            } else if(obj[i].type == "Function"){
                // WARNING: this is more or less like using eval
                // All the usual caveats apply - including jailtime
                objectified[i] = new Function("return ("+obj[i].value+")")();
            }
            // ADD MORE TYPE HANDLERS HERE ...
        }

        return objectified

    }
}

function saveCache() {
    console.log('saveCache pingbi', pingbi)
    let _c: any = {}
    for (let key in pingbi) {
        _c[key] = pingbi[key]
    }
    window.localStorage.setItem(STORE_KEY, JSONEX.stringify(_c))
}

function readCache(cache: any) {
    let _c: any = JSONEX.parse(cache)
    _c.length = Object.keys(_c).length
    return Array.from(_c)
}

function render() {
    renderItems()
    saveCache()
}

interface MyWindow extends Window {
    setPingBi(data: Array<any>): void;
    concatPingBi(data: Array<any>): void;
    Gator: Function
}

;(<MyWindow>window).setPingBi = function(data: Array<any>) {
    pingbi = data
    render()
}

;(<MyWindow>window).concatPingBi = function(data: Array<any>) {
    pingbi = pingbi.concat(data)
    render()
}


function initToolBoxItem(data: any, index: number) {
    let item: HTMLElement = document.createElement('div')
    let contentItem: HTMLElement = document.createElement('span')
    let closeItem: HTMLElement = document.createElement('span')
    closeItem.textContent = 'x'
    closeItem.onclick = function() {
        pingbi.splice(index, 1)
        if (item.parentNode) {
            item.parentNode.removeChild(item)
        }
        saveCache()
    }
    closeItem.style.cssText = `
    margin-left: 10px;
    cursor: pointer;
    `
    contentItem.textContent = data
    item.appendChild(contentItem)
    item.appendChild(closeItem)
    return item
}

function renderItems() {
    let items: Array<HTMLElement>
    items = pingbi.map((v, index) => {
        return initToolBoxItem(v, index)
    })
    if (toolBox.children.length > 1) {
        let content = toolBox.children[1]
        content.innerHTML = ''
        items.forEach(v => {
            content.appendChild(v)
        })
    }
}

function initToolBox() {
    let header = document.createElement('div')
    header.textContent = '屏蔽规则'
    let content = document.createElement('div')
    toolBox = document.createElement('div')
    toolBox.appendChild(header)
    toolBox.appendChild(content)
    toolBox.style.cssText = `
position: fixed;
right: 0;
top: 50%;
transform: translateY(-50%);
padding: 30px 10px;
`
    document.body.appendChild(toolBox)
    renderItems()
}

function init() {
    let _cache: any = window.localStorage.getItem(STORE_KEY)
    pingbi = _cache ? readCache(_cache) : []
    initToolBox()
}

function doFilter(dom: any, title: HTMLElement) {
    if (!dom.querySelector('.AuthorInfo-head .filter')) {
        let n: HTMLElement = document.createElement('div')
        n.classList.add('filter')
        n.textContent = '添加到过滤'
        n.style.cssText = `
        cursor: pointer;
        border: 1px solid #ddd;
        padding: 10px;
        margin-left: 10px;
        border-radius: 3px;
        `
        n.onclick = function() {
            (<MyWindow>window).concatPingBi([title.textContent])
        }
        dom.querySelector('.AuthorInfo-head').appendChild(n)
    }
}

function doClean(dom: any) {
    let con = dom.querySelector('.RichContent')
    con.style.display = 'none'
    if (!dom.querySelector('.AuthorInfo-head button')) {
        var toggleBtn = createToggle(con)
        dom.querySelector('.AuthorInfo-head').appendChild(toggleBtn)
    }
}

function clear() {
    let anwsers = document.querySelectorAll('.AnswerItem')
    let anwserArrItems = []
    if (anwsers) {
        anwserArrItems = Array.prototype.slice.call(anwsers)
        anwserArrItems = anwserArrItems.filter((dom: any) => {
            let isNeedClean = false
            let title = dom.querySelector('.AuthorInfo-head .UserLink-link')
            if (title) {
                isNeedClean = pingbi.some((v: any) => {
                    if (v.test) {
                        return v.test(title.textContent.trim())
                    }
                    return v === title.textContent
                })
                console.log(title.textContent, isNeedClean)
            } else {
                if (pingbi.indexOf('~') > -1) {
                    isNeedClean = true
                }
            }
            if (isNeedClean) {
                doClean(dom)
            } else {
                if (title) {
                    doFilter(dom, title)
                }
            }
            return true
        })
    }
}

interface MyButton extends HTMLButtonElement {
    _showed: Boolean
}

function createToggle(dom: any) {
    let btn = document.createElement('button') as MyButton
    btn.innerHTML = 'toggle'
    btn.classList.add('Button')
    btn._showed = false
    btn.style.cssText = `
    margin-left: 10px;
    `
    btn.addEventListener('click', function() {
        console.log('click')
        if (!btn._showed) {
            btn._showed = true
            dom.style.display = null
        } else {
            btn._showed = false
            dom.style.display = 'none'
        }
    })
    return btn
}

function detect() {
    setTimeout(() => {
        var listnode = document.querySelector(
            '#QuestionAnswers-answers > .Card > .ListShortcut > .List'
        )
        if (!listnode) {
            setTimeout(() => {
                detect()
            }, 3000)
        } else {
            var targetNode = listnode.children[1]
            var config = { attributes: false, childList: true, subtree: true }

            var callback = function(mutationsList: any) {
                for (var mutation of mutationsList) {
                    //console.log(mutation)
                    if (mutation.type == 'childList') {
                        if (
                            (mutation.addedNodes && mutation.addedNodes.length > 0) ||
                            (mutation.removedNodes && mutation.removedNodes.length > 0)
                        ) {
                            clear()
                        }
                    }
                }
            }

            var observer = new MutationObserver(callback)

            observer.observe(targetNode, config)

            clear()
        }
    }, 300)
}

init()
detect()

;(<MyWindow>window).Gator(document).on('click', 'button[role=combobox]', () => { 
    console.log('click')
    setTimeout(() => {
        clear()
    }, 0)
})
