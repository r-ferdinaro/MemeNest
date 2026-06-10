'use strict';

const gQueryParams = {
    page: '',
    // TODO: check what is best implementation for filterBy. should it be set as one full string or array.... what's the best approach
    filterBy: '',
    imageId: '',
    memeId: ''
}
const PAGES = ['gallery', 'editor', 'memes', 'about']

// Page rendering functions
function onInit() {
    readQueryParams()
    renderPageContent()
    renderQueryParamsFilters()
}

// TODO: might want to just trigger relevant functions - lets see
// Render desired content to the main section (i think) container
// function might be in services 
function renderPageContent() {
    const { page } = gQueryParams
    const elContainer = document.querySelector('.main-content-container')
    
    let strHtml
    if (['gallery', 'memes'].includes(page)) {
        const galleryContent = getGalleryContent()
        strHtml = `
            <section class="gallery">
                <div class="filter-section">
                    <input name="photos-search" class="search-bar" type="text" oninput="OnSetSearchFilter(this)">
                    <button class="btn search-bar-reset" onclick="onClearSearchFilter(this)">Clear filters</button>
                    <div class="tags-container">
                        <a href="#" value="happy" onclick="onTagFilter(this)">happy</a>
                        <a href="#" value="sad" onclick="onTagFilter(this)">sad</a>
                        <a href="#" value="trump" onclick="onTagFilter(this)">trump</a>
                        <a href="#" value="putin" onclick="onTagFilter(this)">putin</a>
                    </div>
                    <button class="expand">More</button>
                    <button class="filter-btn" onclick="onToggleMenu(this)" type="button"><i class="fa-solid fa-sliders"></i></button>
                </div>
                <div class="gallery-content"> ${galleryContent}</div>
            </section>
        `
    } else if (page === 'editor') {
        strHtml = `
            <section class="editor">
                <div class="canvas-area">
                    <div class="canvas-container">
                        <canvas height="300"></canvas>
                    </div>
                </div>
                <div class="canvas-tools"></div>
            </section>
        `
    } else if (page === 'about') {
        strHtml = ``
    }

    // implementation of the innerHTML that will be inserted to the container
    // elContainer.innerHTML = strHtml.join('')
    elContainer.innerHTML = strHtml
}

// query params functions
// Read query params from search bar
function readQueryParams() {
    const readQueryParams = new URLSearchParams(window.location.search)

    gQueryParams.page = readQueryParams.get('page') || 'gallery'
    
    gQueryParams.filterBy = readQueryParams.get('filterBy') || ''
    gQueryParams.imageId = readQueryParams.get('imageId') || ''
    gQueryParams.memeId = readQueryParams.get('memeId') || ''
}

// Render queryParams values to filter section
function renderQueryParamsFilters() {
    const { page, filterBy } = gQueryParams
    if (!['gallery', 'memes'].includes(page) || !filterBy) return
    
    document.querySelector('.search-bar').value = filterBy
    // TODO: if search content words are part of existing tags, show them first in the list of available tags and change their style so it's obvious
}

// TODO: should be triggered upon changing the page 
// TODO: should be triggered upon changing the search filter values or selecting a specific tag
// Set current query params to the search bar
function setQueryParams() {
    const queryParams = new URLSearchParams()
    const { protocol, host, pathname } = window.location;
    const { page = 'gallery', filterBy, imageId, memeId } = gQueryParams;

    const targetPage = (page === 'editor' && !memeId && !imageId) ? 'gallery' : page
    queryParams.set('page', targetPage)

    switch (targetPage) {
        case 'gallery':
        case 'memes':
            if (filterBy) queryParams.set('filterBy', filterBy);
            break;
        case 'editor':
            if (memeId) queryParams.set('memeId', memeId);
            else if (imageId) queryParams.set('imageId', imageId);
            break;
    }

    const newUrl = `${protocol}//${host}${pathname}?${queryParams.toString()}`
    window.history.pushState({path: newUrl}, '', newUrl)
}

function onToggleMenu(el) {
    const menuTypeClass = el.classList.contains('filter-btn') ? 'filter' : 'nav'
    document.body.classList.add('menu-open', `${menuTypeClass}`);
}

function onCloseMenus() {
    document.body.classList.remove('menu-open', 'filter', 'nav');
}

function onPageChange(ev) {
    ev.preventDefault()

    gQueryParams.page = ev.target.dataset.uri
    setQueryParams()
    renderPageContent()
}

function OnSetSearchFilter(el) {
}

function onTagFilter(el) {
}

function onClearSearchFilter() {
}
