'use strict';

function getGallerySection() {
    return `
        <section class="gallery">
            <div class="filter-section">
                <input name="photos-search" placeholder="Search" class="search-bar" type="text" oninput="OnSetSearchFilter(this)">
                <div class="btn search-bar-reset" onclick="onClearSearchFilter()"><i class="fa-solid fa-circle-xmark"></i></div>
                <div class="tags-container"></div>
                <button class="expand" onclick="onToggleTagsPanel()" type="button"><i class="fa-solid fa-filter"></i></button>
                <button class="filter-btn" onclick="onToggleMenu(this)" type="button"><i class="fa-solid fa-filter"></i></button>
            </div>

            <div class="tags-expanded"></div>

            <div class="gallery-content"></div>
        </section>`
}

function getEditorSection() {
    return `
        <section class="editor">
            <div class="canvas-area">
                <div class="canvas-container">
                    <canvas height="300"></canvas>
                </div>
            </div>
            <div class="canvas-tools grid">
                <div class="text-tools">
                    <input name="text-input" placeholder="Set text" class="text-input" type="text" oninput="onSetText(this)">
                    <button class="add-text-drawing" onclick="odAddNewTextDrawing()"><i class="fa-solid fa-square-plus"></i></button>
                    <button class="remove-drawing" onclick="onRemoveText()"><i class="fa-solid fa-trash-can"></i></button>
                </div>

                <div class="text-styling">
                    <select class="text-font" name="textFont" id="textFont" onchange="onFontChange(this)">
                        <option value="helvetica" selected>Helvetica</option>
                        <option value="arial">Arial</option>
                        <option value="roboto">Roboto</option>
                        <option value="garamond">Garamond</option>
                        <option value="futura">Futura</option>
                    </select>
                    <div class="font-size-container">
                        <span>Font size <span class="font-size-value" id="fontSizeValue">40</span></span>
                        <input class="font-size-slider" type="range" min="20" max="60" value="40" id="fontSizeSlide" oninput="onUpdateFontSize(this)">
                    </div>
                    <div class="font-colors-container">
                        <span>Stroke color</span>
                        <input class="stroke-color" type="color" value="#000000" onchange="onSetStrokeColor(this)">
                        <span>Fill color</span>
                        <input class="fill-color" type="color" value="#ffffff" onchange="onSetFontColor(this)">
                    </div>
                </div>

                <div class="stickers-container"></div>

                <div class="export-container">
                    <button class="save-meme" onclick="onSaveMeme()">Save <i class="fa-solid fa-floppy-disk"></i></button>
                    <a href="#" class="download-meme btn" onclick="onDownloadMeme(this)" download="meme.png">Download <i class="fa-solid fa-download"></i></a>
                    <form method="POST" enctype="multipart/form-data" onsubmit="onUploadImg(event)">
                        <input name="img" id="imgData" type="hidden" />
                        <button type="submit" class="share-meme btn">Share <i class="fa-brands fa-facebook"></i></button>
                    </form>
                </div>
            </div>
        </section>`
}

// Get images/memes from storage to img tags
function getGalleryElements() {
    const { page, filterBy } = gQueryParams
    const contentArray = getItems(page, filterBy)
    let strHtml = ``
    
    if (contentArray) {
        contentArray.forEach( img => strHtml += `<img data-id="${img.id}" src="${img.url}" onclick="onRenderGalleryItem(this)">`)
    }
    return strHtml
}