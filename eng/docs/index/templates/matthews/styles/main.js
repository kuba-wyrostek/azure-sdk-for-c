// Use container fluid
var containers = $(".container");
containers.removeClass("container");
containers.addClass("container-fluid");

WINDOW_CONTENTS = window.location.href.split('/');
SELECTED_LANGUAGE = 'c';
STORAGE_ACCOUNT_NAME = 'azuresdkdocs';
BLOB_URI_PREFIX = "https://" + STORAGE_ACCOUNT_NAME + ".blob.core.windows.net/$web?restype=container&comp=list&prefix=" + SELECTED_LANGUAGE + "/";

ATTR1 = '[<span class="hljs-meta">System.ComponentModel.EditorBrowsable</span>]\n<';

// Navbar Hamburger
$(function () {
    $(".navbar-toggle").click(function () {
        $(this).toggleClass("change");
    })
})

// Select list to replace affix on small screens
$(function () {
    var navItems = $(".sideaffix .level1 > li");

    if (navItems.length == 0) {
        return;
    }

    var selector = $("<select/>");
    selector.addClass("form-control visible-sm visible-xs");
    var form = $("<form/>");
    form.append(selector);
    form.prependTo("article");

    selector.change(function () {
        window.location = $(this).find("option:selected").val();
    })

    function work(item, level) {
        var link = item.children('a');

        var text = link.text();

        for (var i = 0; i < level; ++i) {
            text = '&nbsp;&nbsp;' + text;
        }

        selector.append($('<option/>', {
            'value': link.attr('href'),
            'html': text
        }));

        var nested = item.children('ul');

        if (nested.length > 0) {
            nested.children('li').each(function () {
                work($(this), level + 1);
            });
        }
    }

    navItems.each(function () {
        work($(this), 0);
    });
})


$(function () {
    // Inject line breaks and spaces into the code sections
    $(".lang-csharp").each(function () {
        var text = $(this).html();
        text = text.replace(/, /g, ",</br>&#09;&#09");
        text = text.replace(ATTR1, '<');
        $(this).html(text);
    });

    // Add text to empty links
    $("p > a").each(function () {
        var link = $(this).attr('href')
        if ($(this).text() === "") {
            $(this).html(link)
        }
    });
})

function httpGetAsync(targetUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", targetUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function populateOptions(selector, packageName) {
    var versionRequestUrl = BLOB_URI_PREFIX + packageName + "/versions/"

    httpGetAsync(versionRequestUrl, function (responseText) {
        var versionselector = document.createElement("select")
        versionselector.className = 'navbar-version-select'
        if (responseText) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(responseText, "text/xml");

            nameElements = Array.from(xmlDoc.getElementsByTagName('Name'))
            options = []

            for (var i in nameElements) {
                options.push(nameElements[i].textContent.split('/')[3])
            }

            for (var i in options) {
                $(versionselector).append('<option value="' + options[i] + '">' + options[i] + '</option>')
            }
        }
        $(versionselector).val(WINDOW_CONTENTS[6]);
        $(selector).append(versionselector)

        $(versionselector).change(function () {
            targetVersion = $(this).val()
            url = WINDOW_CONTENTS.slice()
            url[6] = targetVersion
            window.location.href = url.join('/')
        });

    })
}


function populateIndexList(selector, packageName) {
    url = BLOB_URI_PREFIX + packageName + "/versions/"

    httpGetAsync(url, function (responseText) {

        var publishedversions = document.createElement("ul")
        if (responseText) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(responseText, "text/xml");

            nameElements = Array.from(xmlDoc.getElementsByTagName('Name'))
            options = []

            for (var i in nameElements) {
                options.push(nameElements[i].textContent.split('/')[3])
            }

            for (var i in options) {
                $(publishedversions).append('<li><a href="' + getPackageUrl(SELECTED_LANGUAGE, packageName, options[i]) + '" target="_blank">' + options[i] + '</a></li>')
            }
        }
        else {
            $(publishedversions).append('<li>No discovered versions present in blob storage.</li>')
        }
        $(selector).after(publishedversions)
    })
}

function getPackageUrl(language, package, version) {
    return "https://" + STORAGE_ACCOUNT_NAME + ".blob.core.windows.net/$web/" + language + "/" + package + "/" + version + "/index.html";
}

// Populate Versions
$(function () {
    if (WINDOW_CONTENTS.length < 7 && WINDOW_CONTENTS[WINDOW_CONTENTS.length - 1] != 'index.html') {
        console.log("Run PopulateList")

        $('h4').each(function () {
            var pkgName = $(this).text()
            populateIndexList($(this), pkgName)
        })
    }

    if (WINDOW_CONTENTS.length > 7) {
        var pkgName = WINDOW_CONTENTS[5]
        populateOptions($('#navbar'), pkgName)
    }
})