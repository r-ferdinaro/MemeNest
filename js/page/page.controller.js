'use strict';

let gQueryParams = {
    page: '',
    filterBy: ''
}
let gSelectedItem = {
    itemId: '', 
    itemType: '',
    elImg: null
}

// Page rendering functions

function onInit() {
    readQueryParams()
    renderPageContent()
    renderQueryParamsFilters()
}

function renderPageContent() {
    const { page = 'gallery' } = gQueryParams
    const elMainContainer = document.querySelector('.main-content-container')
    const elNavs = document.querySelectorAll('.main-nav a[data-uri]')
    const isGallery = ['gallery', 'memes'].includes(page)

    // render the active page
    elMainContainer.innerHTML = isGallery ? getGallerySection() : getEditorSection()

    // mark active nav link
    elNavs.forEach(a => {
        a.classList.toggle('nav-active', a.dataset.uri === page)
    })

    // show page's label in Mobile view
    const elPageLabel = document.querySelector('.current-page-label')

    if (elPageLabel) elPageLabel.textContent = page.charAt(0).toUpperCase() + page.slice(1)

    if (isGallery) {
        // render gallery content & tags based on gallery type
        document.querySelector('.gallery-content').innerHTML = getGalleryElements()
        renderTags()
        addTagsResizeListener()
        removeResizeListeners()
    } else {
        removeTagsResizeListener()
        onEditorInit()
    }
}

// change page based on nav click
function onPageChange(ev) {
    ev.preventDefault()
    onCloseMenu()

    gQueryParams.page = ev.target.dataset.uri
    gQueryParams.filterBy = ''
    setQueryParams()
    renderPageContent()
}

// click on image/meme to open it in the editor
function onRenderGalleryItem(el = null) {
    if (!el || !['gallery', 'memes'].includes(gQueryParams.page)) return
    
    // Get the id & type of triggered item
    gSelectedItem = {
        itemId: el.dataset.id,    
        itemType: (gQueryParams.page === 'gallery') ? 'image' : 'meme',
        elImg: null
    }

    // update queryParams to editor & update the meme's selectedImageId
    gQueryParams.page = 'editor'
    gQueryParams.filterBy = ''

    // render updated URL & editor with selected item & its type
    setQueryParams()
    renderPageContent()
}

// filter results based on the search bar value
function OnSetSearchFilter(el) {
    gQueryParams.filterBy = el.value
    updateSearchFilter()
}

// toggle tag keyword in/out of the search bar
function onTagFilter(ev) {
    ev.preventDefault()

    const el = ev.currentTarget
    const elSearch = document.querySelector('.search-bar')
    const tagWords = el.getAttribute('value').toLowerCase().split(/\s+/)
    let searchWords = elSearch.value.toLowerCase().split(/\s+/).filter( word => word.length)

    const isTagSelected = tagWords.every( word => searchWords.includes(word))

    if (isTagSelected) {
        // remove tag from search
        searchWords = searchWords.filter(word => !tagWords.includes(word))
    } else {
        // add tag to search filter
        searchWords.push(...tagWords)
    }

    gQueryParams.filterBy = elSearch.value = searchWords.join(' ')
    updateSearchFilter()
}

// reset search bar and tags
function onClearSearchFilter() {
    document.querySelector('.search-bar').value = ''
    gQueryParams.filterBy = ''
    updateSearchFilter()
}

// Sync url, gallery results, and tags per filter
function updateSearchFilter() {
    setQueryParams()
    document.querySelector('.gallery-content').innerHTML = getGalleryElements()
    renderTags()
}

// Tag rendering functions

function renderTags() {
    const elContainer = document.querySelector('.tags-container')
    const elPanel = document.querySelector('.tags-expanded')
    const elExpand = document.querySelector('.expand')

    if (!elContainer) return

    // build the markup for a single tag
    function getTagElement(tag) {
        return `<a
            href="#"
            value="${tag.keyword}"
            class="tag${tag.isSelected ? ' tag-selected' : ''}"
            onclick="onTagFilter(event)"
            >${tag.keyword}</a>`
    }

    const orderedTags = orderTags()

    // render the first 4 tags - in web view (hidden in Mobile view)
    elContainer.innerHTML = orderedTags.slice(0, 4).map(getTagElement).join('')
    // render all tags to panel
    elPanel.innerHTML = orderedTags.map(getTagElement).join('')
    elExpand.classList.toggle('hide', !orderedTags.length)
}

// sort tags by selected, count, alphabetically
function orderTags() {
    const { page, filterBy } = gQueryParams
    const keywordMap = getKeywords(page)
    const searchWords = filterBy.toLowerCase().trim().split(/\s+/)

    return Object.keys(keywordMap)
        .map(keyword => ({
            keyword,
            score: keywordMap[keyword],
            isSelected: searchWords.includes(keyword.toLowerCase())
        }))
        .sort((a, b) => {
            if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1
            if (a.score !== b.score) return b.score - a.score
            return a.keyword.localeCompare(b.keyword)
        })
}

// Show/hide the panel holding the tags that didn't fit the primary row
function onToggleTagsPanel() {
    document.querySelector('.tags-expanded').classList.toggle('open')
}

function addTagsResizeListener() {
    window.addEventListener('resize', renderTags)
}

function removeTagsResizeListener() {
    window.removeEventListener('resize', renderTags)
}


// query params functions

// Read query params from search bar
function readQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)

    gQueryParams.page = queryParams.get('page') || 'gallery'
    gQueryParams.filterBy = queryParams.get('filterBy') || ''
}

// Render queryParams values to filter section
function renderQueryParamsFilters() {
    const { page, filterBy } = gQueryParams
    
    // Early return if irrelevant page or no filter value
    if (page === 'editor' || !filterBy) return
    
    document.querySelector('.search-bar').value = filterBy
}

// Set current query params to the search bar
function setQueryParams() {
    const queryParams = new URLSearchParams()
    const { protocol, host, pathname } = window.location
    const { page = 'gallery', filterBy } = gQueryParams
    
    queryParams.set('page', page)
    if (['gallery', 'memes', 'editor'].includes(page)) {
        if (filterBy) queryParams.set('filterBy', filterBy)
    }
    
    const newUrl = `${protocol}//${host}${pathname}?${queryParams.toString()}`
    window.history.pushState({path: newUrl}, '', newUrl)
}

// Mobile only - Menu visibility functions

// Show/hide nav/filter menu
function onToggleMenu(el) {
    const screen = document.querySelector('.main-screen')
    const isFilter = el.classList.contains('filter-btn')
    const target = document.querySelector(isFilter ? '.tags-expanded' : '.main-nav')
    const isOpen = target.classList.contains('open')

    target.classList.toggle('open', !isOpen)
    screen.classList.toggle('open', !isOpen)
}

// Close nav/filter menu
function onCloseMenu() {
    // .tags-expanded only exists while the gallery page is mounted
    document.querySelectorAll('.main-nav, .tags-expanded, .main-screen')
        .forEach(el => el.classList.remove('open'))
}

