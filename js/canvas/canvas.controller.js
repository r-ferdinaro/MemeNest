'use strict';


let gElCanvas
let gCtx

// TODO: should save to localStorage in case user refreshes page ??
let gMeme = {
    id: null,
    selectedImgId: null,
    selectedDrawingIdx: null,
    drawings: []
}
let gBrush
let gOffsetPos = { 
    x: 0, 
    y: 0 
}
let gIsMouseDown = false

// TODO: gMeme should also have a memeId property. Upon save, if no Id - create one. If one exists, update the existing meme. This means I should support editing existing saved memes

function onEditorInit() {
    gElCanvas = document.querySelector('canvas')
	gCtx = gElCanvas.getContext('2d')

    resizeCanvas()
    addEventListeners()
    loadItem()
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

function removeResizeListeners() {
    window.removeEventListener('resize', onResizeCanvas)
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
