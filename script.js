document.getElementById('convertHTMLtoCSV').addEventListener('click', function () {
    setActiveSection('HTMLtoCSV');
});

document.getElementById('convertCSVtoHTML').addEventListener('click', function () {
    setActiveSection('CSVtoHTML');
});

function setActiveSection(activeSectionId) {
    document.querySelectorAll('.chooseConversion').forEach(button => {
        if (button.id === "convert" + activeSectionId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    document.querySelectorAll('.section').forEach(section => {
        if (section.id === activeSectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

setActiveSection('HTMLtoCSV');

var csvContentGlobal = '';

document.getElementById('convertButton').addEventListener('click', function () {
    var htmlContent = document.getElementById('htmlInput').value;
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlContent, 'text/html');
    var table = doc.querySelector('table');

    if (table) {
        var csv = convertTableToCSV(table);
        csv = csv.replace(/<br\s*\/?>/g, '\n');
        csvContentGlobal = csv;

        var csvTextElement = document.getElementById('csvText');
        var downloadButton = document.getElementById('downloadButton');
        var copyCSVButton = document.getElementById('copyCSVButton');
        csvTextElement.classList.remove('pop');
        downloadButton.classList.remove('pop');
        copyCSVButton.classList.remove('pop');
        setTimeout(() => {
            csvTextElement.innerText = csv;
            csvTextElement.classList.add('pop');
            downloadButton.classList.add('pop');
            copyCSVButton.classList.add('pop');
        }, 0);

        downloadButton.style.display = 'block';
        downloadButton.disabled = false;
        copyCSVButton.disabled = false;
    } else {
        alert('Invalid HTML table');
    }
});

document.getElementById('downloadButton').addEventListener('click', function () {
    downloadCSV(csvContentGlobal, 'table.csv');
});

document.getElementById('htmlExampleButton').addEventListener('click', function () {
    document.getElementById('htmlInput').value = `<table>
    <tr>
        <th>Header 1</th>
        <th>Header 2</th>
        <th>Header 3</th>
    </tr>
    <tr>
        <td>Row 1, Cell 1</td>
        <td>Row 1, Cell 2</td>
        <td>Row 1, Cell 3</td>
    </tr>
    <tr>
        <td>Row 2, Cell 1</td>
        <td>Row 2, Cell 2</td>
        <td>Row 2, Cell 3</td>
    </tr>
</table>
    `
});

document.getElementById('csvExampleButton').addEventListener('click', function () {
    document.getElementById('csvInput').value = `"Header 1","Header 2","Header 3"
"Row 1, Cell 1","Row 1, Cell 2","Row 1, Cell 3"
"Row 2, Cell 1","Row 2, Cell 2","Row 2, Cell 3"
    `
});

function convertTableToCSV(table) {
    var rows = table.querySelectorAll('tr');
    var csvContent = '';

    rows.forEach(function (row) {
        var cells = row.querySelectorAll('th, td');
        var rowContent = Array.from(cells).map(cell => {
            let text = cell.innerText;
            text = decodeHtmlEntities(text);
            text = text.replace(/"/g, '""');
            text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
            return `"${text}"`;
        }).join(',');
        csvContent += rowContent + '\r\n';
    });

    return csvContent;
}

function decodeHtmlEntities(text) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

function downloadCSV(csvContent, fileName) {
    var blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    var tempLink = document.createElement("a");
    tempLink.href = URL.createObjectURL(blob);
    tempLink.download = fileName;

    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

document.getElementById('copyCSVButton').addEventListener('click', function () {
    navigator.clipboard.writeText(csvContentGlobal).then(function () {
        alert('CSV copied to clipboard');
    }).catch(function (error) {
        alert('Error copying CSV: ' + error);
    });
});

var generatedHTML = '';
document.getElementById('convertCsvToHtmlButton').addEventListener('click', function () {
    var csvContent = document.getElementById('csvInput').value;
    generatedHTML = convertCSVToHTML(csvContent);

    if (csvContent) {
        var htmlTextElement = document.getElementById('htmlText');
        var copyHTMLButton = document.getElementById('copyHTMLButton');
        htmlTextElement.classList.remove('pop');
        copyHTMLButton.classList.remove('pop');
        setTimeout(() => {
            htmlTextElement.innerHTML = generatedHTML;
            htmlTextElement.classList.add('pop');
            copyHTMLButton.classList.add('pop');
        }, 0);
        copyHTMLButton.disabled = false;
    }
    else {
        alert('Please input valid CSV');
    }

});

document.getElementById('copyHTMLButton').addEventListener('click', function () {
    navigator.clipboard.writeText(generatedHTML).then(function () {
        alert('HTML copied to clipboard');
    }).catch(function (error) {
        alert('Error copying HTML: ' + error);
    });
});

function convertCSVToHTML(csv) {
    var rows = csv.split(/\r?\n/);
    var table = '<table>';

    rows.forEach((row, index) => {
        var cells = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (cells) {
            table += '<tr>';
            cells.forEach(cell => {
                var text = cell.replace(/^"|"$/g, '');
                if (index === 0) {
                    table += `<th>${text}</th>`;
                } else {
                    table += `<td>${text}</td>`;
                }
            });
            table += '</tr>';
        }
    });

    table += '</table>';
    return table;
}