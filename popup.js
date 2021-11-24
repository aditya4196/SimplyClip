/*
MIT License
Copyright (c) 2021 lalit10
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const checkbox = document.getElementById('dark_mode')
checkbox.addEventListener('click',checkMode)


let _clipboardList = document.querySelector("#clipboard_list");
let addButton = document.getElementById('add-btn');

addButton.addEventListener('click', (event) => {
        let textitem = ''
        let emptyDiv = document.getElementById('empty-div');
        let downloadDiv1 = document.getElementById('download-btn1');
        let downloadDiv2 = document.getElementById('download-btn2');
        let searchInput = document.getElementById('searchText');
        
        emptyDiv.classList.add('hide-div');
        downloadDiv1.style.display = 'block';
        downloadDiv2.style.display = 'block';
        document.getElementsByClassName('doc')[0].addEventListener('click', (event) => {
            downloadClipboardTextAsDoc()
        })
        document.getElementsByClassName('csv')[0].addEventListener('click', (event) => {
            downloadClipboardTextAsCsv()
        })
        searchInput.style.display = 'block';
        searchInput.addEventListener('keyup', () => {
            searchClipboardText();
        })
        chrome.storage.sync.get(['list'], text => {
            let list = text.list;
            list == undefined && (list = []);
            list.unshift("");
            chrome.storage.sync.set({ 'list': list })
        })
        chrome.storage.sync.get(['listURL'], url => {
            let urlList = url.listURL;
            urlList == undefined && (urlList = []);
            urlList.unshift("");
            chrome.storage.sync.set({ 'listURL': urlList })
        })
        chrome.storage.sync.get(['originalList'], original => {
            let originalList = original.originalList;
            originalList == undefined && (originalList = []);
            originalList.unshift("");
            chrome.storage.sync.set({ 'originalList': originalList })
        })
        addClipboardListItem(textitem)
    }
)
/**
 * Gets the copied text from storage and calls addClipboardListItem function to populate list in the pop-up
 * @example
 *  getClipboardText()
 */
function getClipboardText() {
    chrome.storage.sync.get(['list'], clipboard => {
        let list = clipboard.list;
        let emptyDiv = document.getElementById('empty-div');
        let downloadDiv1 = document.getElementById('download-btn1');
        let downloadDiv2 = document.getElementById('download-btn2');
        let searchInput = document.getElementById('searchText');
        let deleteAll = document.getElementById('delete-btn');
        if (list === undefined || list.length === 0) {
            emptyDiv.classList.remove('hide-div');
            downloadDiv1.style.display = 'none';
            downloadDiv2.style.display = 'none';
            searchInput.style.display = 'none';
            deleteAll.style.display = 'none';
        }
        else {
            emptyDiv.classList.add('hide-div');
            downloadDiv1.style.display = 'block';
            downloadDiv2.style.display = 'block';
            deleteAll.style.display = 'block';
            document.getElementsByClassName('doc')[0].addEventListener('click', (event) => {
                downloadClipboardTextAsDoc()
            })
            document.getElementsByClassName('csv')[0].addEventListener('click', (event) => {
                downloadClipboardTextAsCsv()
            })
            searchInput.style.display = 'block';
            searchInput.addEventListener('keyup', () => {
                searchClipboardText();
            })
            deleteAll.addEventListener('click',() => {
                deleteAllText();
            })
            if (typeof list !== undefined)
                list.forEach(item => {
                    addClipboardListItem(item)
                });
        }
    });
}
/**
 * Gets the source URL and the image url for the copied image/text
 * @param {*} textContent
 * @returns
 */
function getThumbnail(textContent) {
    let ind = textContent.indexOf('https://www.youtube.com/');
    if (ind === 0) {
        let videoId = "";
        let idIndex = textContent.indexOf('watch?v=');
        let endIndex = textContent.indexOf('&');
        if (endIndex !== -1)
            videoId = textContent.substring(idIndex + 8, endIndex);
        else
            videoId = textContent.substring(idIndex + 8, textContent.length);
        let url = `https://img.youtube.com/vi/${videoId}/1.jpg`;
        return {
            sourceUrl: textContent,
            imageUrl: url,
            isVideo: true,
        };
    }
    else {
        let ind = textContent.indexOf('http');
        if (ind === 0) {
            let url = new URL(textContent);
            let ans = "https://favicons.githubusercontent.com/" + url.hostname;
            return {
                sourceUrl: textContent,
                imageUrl: ans,
                isVideo: false
            }
        }
    }
    return {
        sourceUrl: "",
        imageUrl: ""
    }
        ;
}
/**
 * Creates an HTML li element and adds the input text, icon to edit, icon to delete
 * Contains click event listeners for edit and delete icon
 * @param {*} text
 * @example
 * addClipboardListItem("123")
 */
function addClipboardListItem(text) {
    let { sourceUrl, imageUrl, isVideo } = getThumbnail(text);
    let listItem = document.createElement("li"),
        listDiv = document.createElement("div"),
        deleteDiv = document.createElement("div"),
        editDiv = document.createElement("div"),
        contentDiv = document.createElement("div"),
        editImage = document.createElement("img"),
        upArrowImage = document.createElement("img"),
        downArrowImage = document.createElement("img"),
        upArrowDiv = document.createElement("div"),
        downArrowDiv = document.createElement("div");

    editImage.setAttribute("data-toggle", "tooltip");
    editImage.setAttribute("data-placement", "bottom");
    editImage.setAttribute("title", "Click to edit the text entry!");

    let deleteImage = document.createElement("img");
    deleteImage.setAttribute("data-toggle", "tooltip");
    deleteImage.setAttribute("data-placement", "bottom");
    deleteImage.setAttribute("title", "Click to delete the text entry!");

    upArrowImage.setAttribute("data-toggle", "tooltip");
    upArrowImage.setAttribute("data-placement", "bottom");
    upArrowImage.setAttribute("title", "Click to move up the text entry!");

    downArrowImage.setAttribute("data-toggle", "tooltip");
    downArrowImage.setAttribute("data-placement", "bottom");
    downArrowImage.setAttribute("title", "Click to move down the text entry!");

    let listPara = document.createElement("p");
    let listText = document.createTextNode(text);
    listPara.setAttribute("data-toggle", "tooltip");
    listPara.setAttribute("data-placement", "bottom");
    listPara.setAttribute("title", "Click to copy the below text:\n" + text);
    let popupLink = document.createElement('a');
    let imagePopup = document.createElement('img');
    prevText = text;

    if (imageUrl.length > 0) {
        console.log("IMage Url found")
        imagePopup.src = imageUrl;
        if (!isVideo) {
            imagePopup.style.width = '32px'
            imagePopup.style.height = '32px';

        }
        else {
            imagePopup.style['margin-left'] = '0px';
            imagePopup.style['margin-top'] = '0px';
            listPara.style['max-width'] = '12rem'
        }
        popupLink.href = sourceUrl;
        popupLink.target = '_blank';
        popupLink.appendChild(imagePopup);
        listDiv.appendChild(popupLink);

    }

    listPara.appendChild(listText)
    listDiv.appendChild(listPara);
    listPara.addEventListener('focusout', (event) => {
        event.target.setAttribute("contenteditable", "false");
        listPara.style.height = '4em';
        listPara.style.whiteSpace = 'inherit'
        newText = event.target.textContent;
        chrome.storage.sync.get(['list'], clipboard => {
            let list = clipboard.list;
            let index = list.indexOf(prevText);
            list[index] = newText;
            chrome.storage.sync.set({ 'list': list }, () => { console.log("Text updated"); });
        })
    })
    listDiv.classList.add("list-div");
    contentDiv.appendChild(listDiv);
    editImage.src = './images/pencil.png';
    editImage.classList.add("edit");
    deleteImage.src = './images/delete-note.png';
    deleteImage.classList.add("delete");
    upArrowImage.src = './images/upArrow.png';
    upArrowImage.classList.add("upArrow");
    downArrowImage.src = '/images/downArrow.png';
    downArrowImage.classList.add("downArrow");

    editDiv.appendChild(editImage);
    contentDiv.appendChild(editDiv);
    deleteDiv.appendChild(deleteImage);
    contentDiv.appendChild(deleteDiv);

    upArrowDiv.appendChild(upArrowImage);
    contentDiv.appendChild(upArrowDiv);
    downArrowDiv.appendChild(downArrowImage);
    contentDiv.appendChild(downArrowDiv);

    contentDiv.classList.add("content");
    listItem.appendChild(contentDiv);

    _clipboardList.appendChild(listItem);
    editImage.addEventListener('click', (event) => {
        console.log("Edit button clicked");
        prevText = listPara.textContent;
        console.log(prevText);
        listPara.setAttribute("contenteditable", "true");

        listPara.style.height = 'auto';
        listPara.style.whiteSpace = 'break-spaces';
        listPara.focus();
        // listDiv.style.borderColor = "red";
        // listPara.style.backgroundColor = "grey"
        // listPara.style.height = "100px"
        //listPara.focus();
    })
    deleteImage.addEventListener('click', (event) => {
        console.log("Delete clicked");
        chrome.storage.sync.get(['list'], clipboard => {
            let list = clipboard.list;
            let index = list.indexOf(text);
            list.splice(index, 1);
            _clipboardList.innerHTML = "";
            chrome.storage.sync.get(['listURL'], url => {
                let urlList = url.listURL;
                urlList.splice(index, 1);
                chrome.storage.sync.set({ 'listURL': urlList })
            })
            chrome.storage.sync.get(['originalList'], original => {
                let originalList = original.originalList;
                originalList.splice(index, 1);
                chrome.storage.sync.set({ 'originalList': originalList })
            })
            chrome.storage.sync.set({ 'list': list }, () => getClipboardText());
        })
    })

        upArrowImage.addEventListener('click', (event) => {
        console.log("Up arrow clicked");
        chrome.storage.sync.get(['list'], clipboard => {
            let list = clipboard.list;
            let index = list.indexOf(text);
            if(index != 0){
                let temp=list[index];
                list[index]=list[index-1];
                list[index-1]=temp;
                _clipboardList.innerHTML = "";
            }

            chrome.storage.sync.get(['listURL'], url => {
                let urlList = url.listURL;
                if(index != 0){
                    let temp=urlList[index];
                    urlList[index]=urlList[index-1];
                    urlList[index-1]=temp;
                    chrome.storage.sync.set({ 'listURL': urlList });
                }
            })

            chrome.storage.sync.get(['originalList'], original => {
                let originalList = original.originalList;
                if(index != 0){
                    let temp=originalList[index];
                    originalList[index]=originalList[index-1];
                    originalList[index-1]=temp;
                    chrome.storage.sync.set({ 'originalList': originalList });
                }
            })

            if(index!=0)
                chrome.storage.sync.set({ 'list': list }, () => getClipboardText());
        })
    })

    listDiv.addEventListener('click', (event) => {
        let { textContent } = event.target;
        navigator.clipboard.writeText(textContent)
            .then(() => {
                console.log(`Text saved to clipboard`);
                chrome.storage.sync.get(['list'], clipboard => {
                    let list = clipboard.list;
                    let index = list.indexOf(textContent);
                    if (index !== -1)
                        list.splice(index, 1);

                    list.unshift(textContent);
                    _clipboardList.innerHTML = "";
                    chrome.storage.sync.set({ 'list': list }, () => getClipboardText());
                });
            });
        let x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    });
}


/**
 * Retrives the copied text from the storage ,
 * generates a doc file and
 * downloads the file
 * @example
 * downloadClipboardTextAsDoc()
 */
function downloadClipboardTextAsDoc(){
    chrome.storage.sync.get(['list'], clipboard => {
        let list = clipboard.list;
        let emptyDiv = document.getElementById('empty-div');
        if (list === undefined || list.length === 0) {
            emptyDiv.classList.remove('hide-div');
            console.log("Nothing to download")
        }
        else {
            var list_of_items = []
            emptyDiv.classList.add('hide-div');
            if (typeof list !== undefined){
                list.forEach(item => {
                    list_of_items = list_of_items + item + "\n\n"
                });
                var link, blob, url;
                blob = new Blob(['\ufeff', list_of_items], {
                    type: 'application/msword'
                });
                url = URL.createObjectURL(blob);
                link = document.createElement('A');
                link.href = url;
                link.download = 'SimplyClip';
                document.body.appendChild(link);
                if (navigator.msSaveOrOpenBlob )
                    navigator.msSaveOrOpenBlob( blob, 'SimplyClip.doc');
                else link.click();  // other browsers
                document.body.removeChild(link);
            }

        }
    });

}

/**
 * Filters the
 * displayed copied text list that matches search text in the search box
 * @example
 * searchClipboardText()
 */
function searchClipboardText() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchText");
    filter = input.value.toUpperCase();
    ul = document.getElementById("clipboard_list");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        divElement = li[i].getElementsByClassName("list-div")[0];
        let elementText = divElement.getElementsByTagName('p')[0]
        txtValue = elementText.textContent || elementText.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}


var enabled = false;
var myButton = document.getElementById('toggle-button');

chrome.storage.local.get('enabled', data => {
    var myButton = document.getElementById('toggle-button');
    enabled = !!data.enabled;
    switchButton = document.getElementsByClassName('switch')[0]
    if(enabled==true){
        myButton.checked = enabled
        switchButton.title="Click here to disable saving your copied text!!"
    }
    else{
        myButton.checked = enabled
        switchButton.title="Click here to save your copied text!!"
    }
});

myButton.onchange = () => {
    enabled = !enabled;
    switchButton = document.getElementsByClassName('switch')[0]
    if(enabled==true){
        myButton.checked = enabled
        switchButton.title="Click here to disable saving your copied text!!"
    }
    else{
        myButton.checked = enabled
        switchButton.title="Click here to save your copied text!!"
    }
    chrome.storage.local.set({enabled:enabled});
};


getClipboardText();

/**
 * Retrives the copied text, original copied text and URL of copied text from the storage ,
 * generates a CSV file and
 * downloads the file
 * @example
 * downloadClipboardTextAsCsv()
 */
function downloadClipboardTextAsCsv() {
    let data = [];
    chrome.storage.sync.get(['list'], clipboard => {
        clipboardData = clipboard.list
        chrome.storage.sync.get(['listURL'], url => {
            urlData = url.listURL
            chrome.storage.sync.get(['originalList'], original => {
                originalData = original.originalList
                clipboardData.forEach((d, index) => {
                    let rowData = [];
                    rowData.push(d)
                    rowData.push(originalData[index])
                    rowData.push(urlData[index])
                    data.push(rowData)
                })

                var csv = 'Edited Text,OriginalText,URL\n';
                data.forEach(function (row) {
                    for (let i in row) {
                        row[i] = row[i].replace(/"/g, '""');
                    }

                    csv += '"' + row.join('","') + '"';
                    csv += "\n";
                });

                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
                hiddenElement.target = '_blank';
                hiddenElement.download = 'simplyClip.csv';
                hiddenElement.click();
            })
        })
    })




}
/**
 * Deletes all the text copied in the simplyclip clipboard
 * @example
 * deleteAllText()
 */
function deleteAllText() {
    chrome.storage.sync.set({ 'list': [] }, () => {});
    chrome.storage.sync.set({ 'originalList': [] }, () => {});
    chrome.storage.sync.set({ 'listURL': [] }, () => {});
    getClipboardText();
    var ul = document.getElementById("clipboard_list");
    ul.innerHTML = "";
}

/*
 * Switching to Dark Mode or ligth mode
 */

function checkMode(){
    if (checkbox.checked){
        darkmodeOn()
    }
    else{
        darkmodeOFF()
    }
}

function darkmodeOn(){
    document.body.classList.add('dark_mode')
}

function darkmodeOFF(){
    document.body.classList.remove('dark_mode')
}

var darkmode = false;
var myButton2 = document.getElementById('dark_mode');

chrome.storage.local.get('darkmode', data => {
    var myButton2 = document.getElementById('dark_mode');
    darkmode = !!data.darkmode;
    switchButton = document.getElementsByClassName('switch')[1]
    if(darkmode==true){
        myButton2.checked = darkmode
        darkmodeOn()
        switchButton.title="Click here to close dark mode!!"
    }
    else{
        myButton2.checked = darkmode
        switchButton.title="Click here to enable dark mode!!"
    }
});

myButton2.onchange = () => {
    darkmode = !darkmode;
    switchButton = document.getElementsByClassName('switch')[1]
    if(darkmode==true){
        myButton2.checked = darkmode
        darkmodeOn()
        switchButton.title="Click here to close dark mode!!"
    }
    else{
        myButton2.checked = darkmode
        switchButton.title="Click here to enable dark mode!!"
    }
    chrome.storage.local.set({darkmode:darkmode});
};

/**
 * Text Area height chnage based on input size
 */

let textArea = document.querySelector("#searchText");
textArea.oninput = () => {
    textArea.style.height = (textArea.scrollHeight)+"px";
} 
