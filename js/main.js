const url = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

// initial params 
let pdf;
let canvas;
let isPageRendering;
let pageRenderingQueue = null;
let canvasContext;
let totalPages;
let currentPageNum = 1;

// events 
window.addEventListener('load', ()=>{
    isPageRendering = false;
    pageRenderingQueue = null;
    canvas = document.getElementById('pdf-render');
    canvasContext = canvas.getContext("2d");

    // add events 
    initEvents();
    // render first page 
    initPDFRenderer();
})

let upload = document.getElementById('upload-pdf');
let fileInputBtn = document.getElementById('file-input');

upload.addEventListener('click', ()=>{
    fileInputBtn.click();
})

fileInputBtn.addEventListener('change', ()=>{
    // fileInputBtn.click();
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if(file){
        const fileReader = new FileReader();
        fileReader.onload = function (event){
            const arrayBuffer = event.target.result;

            // render the uploaded pdf file 
            renderPDF(arrayBuffer);
        }
        fileReader.readAsArrayBuffer(file);
    }else{
        console.log("No file selected");
    }

})

function renderPDF(arrayBuffer) {
    pdfjsLib.getDocument({data: arrayBuffer}).promise
        .then(pdfData => {
            totalPages = pdfData.numPages;
            let pagesCounter = document.getElementById('page-count');
            pagesCounter.textContent = totalPages;
            // assigning read pdfContent to global variable
            pdf = pdfData;
            renderPage(currentPageNum);
        })
        .catch(error=>{
            // display error 
            const div = document.createElement('div');
            div.className = 'error';
            div.appendChild(document.createTextNode(error.message));
            document.querySelector('body').insertBefore(div, canvas);
            // remove the top bar 
            document.querySelector('.top-bar').style.display = 'none';
        })
}

function initEvents() {
    let prevPageBtn = document.getElementById('prev-page');
    let nextPageBtn = document.getElementById('next-page');
    let goToPage = document.getElementById('go-to-page');
    let inputPageNum = document.getElementById('input-page-num');
    prevPageBtn.addEventListener('click', renderPreviousPage);
    nextPageBtn.addEventListener('click', renderNextPage);
    goToPage.addEventListener('click', goToPageNum);
    
    inputPageNum.addEventListener('keypress', function(event){
        if(event.key === 'Enter'){
            goToPageNum();
        } 
    })
}
// let option = {url};
// init when window is loaded 
function initPDFRenderer() {
    pdfjsLib.getDocument(url).promise
        .then(pdfData => {
            totalPages = pdfData.numPages;
            let pagesCounter = document.getElementById('page-count');
            pagesCounter.textContent = totalPages;
            // assigning read pdfContent to global variable
            pdf = pdfData;
            renderPage(currentPageNum);
        })
        .catch(error=>{
            // display error 
            const div = document.createElement('div');
            div.className = 'error';
            div.appendChild(document.createTextNode(error.message));
            document.querySelector('body').insertBefore(div, canvas);
            // remove the top bar 
            document.querySelector('.top-bar').style.display = 'none';
        })
}

function renderPage(pageNumToRender){
    isPageRendering = true;
    document.getElementById('page-num').textContent = pageNumToRender;
    pdf.getPage(pageNumToRender)
        .then(page => {
            const viewport = page.getViewport({scale:1});
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            let renderContext = {canvasContext, viewport};
            page.render(renderContext).promise
                .then(()=>{
                    isPageRendering = false;
                    if(pageRenderingQueue !== null){
                        renderPage(pageNumToRender);
                        pageRenderingQueue = null;
                    }
                })
        })
}

function renderPageQueue(pageNum){
    if(pageRenderingQueue != null){
        pageRenderingQueue = pageNum;
    }else{
        renderPage(pageNum);
    }
}

function renderNextPage(){
    if(currentPageNum >= totalPages){
        alert("This is the last Page");
        return;
    }
    currentPageNum++;
    renderPageQueue(currentPageNum);
}
function renderPreviousPage(){
    if(currentPageNum <= 1){
        alert("This is the first Page");
        return;
    }
    currentPageNum--;
    renderPageQueue(currentPageNum);
}

function goToPageNum(){
    let numberInput = document.getElementById('input-page-num');
    let pageNumber = parseInt(numberInput.value);
    if(pageNumber){
        if(pageNumber <= totalPages && pageNumber >= 1){
            currentPageNum = pageNumber;
            numberInput.value = "";
            renderPageQueue(pageNumber);
            return;
        }
    }else{
        alert("Enter a valid page number");
    }
}