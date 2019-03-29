(<any>window).pingbi = []
let pingbi = (<any>window).pingbi

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
                isNeedClean = pingbi.some((v: RegExp) => {
                    return v.test(title.textContent.trim())
                })
                console.log(title.textContent, isNeedClean)
            }
            if (isNeedClean) {
                doClean(dom)
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
                            mutation.previousSibling &&
                            mutation.previousSibling.className == 'List-item'
                        ) {
                            console.log('clear niming')
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

detect()
