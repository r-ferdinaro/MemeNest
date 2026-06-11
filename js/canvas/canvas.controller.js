'use strict';


let gElCanvas
let gCtx

// TODO: should save to localStorage in case user refreshes page ??
let gMeme = {
    id: null,
    selectedImgId: null,
    selectedDrawIdx: null,
    drawings: []
}
let gBrush

let gStartPos
let gIsMouseDown = false

// TODO: gMeme should also have a memeId property. Upon save, if no Id - create one. If one exists, update the existing meme. This means I should support editing existing saved memes

// TODO:
// 1. If user came from "nowhere" through the navBar/url, and gMeme is "empty" selectedImgId will be undefined in gMeme; therefore, we will render a blank canvas.
// 2. If user open editor by clicking on an image, selectedImgId will be updated to the image's Id, and the gMeme will initialize with it.
// 3. If user navigated anywhere else then returned back; the same updated meme should be rendered into the canvas.


function onEditorInit() {
    gElCanvas = document.querySelector('canvas')
	gCtx = gElCanvas.getContext('2d')

    resizeCanvas()
    addEventListeners()
    renderMeme()
}

// Register necessary event listeners
function addEventListeners() {
    window.addEventListener('resize', onResizeCanvas)

    gElCanvas.addEventListener('mousedown', onDown)
	gElCanvas.addEventListener('mousemove', onDraw)
	gElCanvas.addEventListener('mouseup', onUp)

    gElCanvas.addEventListener('touchstart', onDown)
	gElCanvas.addEventListener('touchmove', onDraw)
	gElCanvas.addEventListener('touchend', onUp)
}

function onResizeCanvas() {
    resizeCanvas()
}

function onDown(ev) {
    gIsMouseDown = true
    
    gStartPos = getEvPos(ev)
    onDraw(ev)
}

function onDraw(ev) {
	if (!gIsMouseDown) return
    
    const pos = getEvPos(ev)
	draw(pos)
	gStartPos = pos
}

function onUp() {
	gIsMouseDown = false
    gCtx.closePath()
}
