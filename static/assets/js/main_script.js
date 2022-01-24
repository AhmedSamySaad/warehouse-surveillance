window.addEventListener("load", function () {

    document.getElementsByName("iou")[0].addEventListener("change",function(){
        document.getElementsByTagName("output")[1].value = document.getElementsByName("iou")[0].value
    })
    document.getElementsByName("confidence")[0].addEventListener("change",function(){
        document.getElementsByTagName("output")[0].value = document.getElementsByName("confidence")[0].value
    })
var dropRegion = document.getElementsByClassName("detection-container")[0];
var fakeInput = document.createElement("input");
fakeInput.type = "file";
fakeInput.accept = "image/*";
dropRegion.addEventListener('click', function() {
    fakeInput.click();
});
fakeInput.addEventListener("change", function() {
    var files = fakeInput.files;
    handleFiles(files);
});
function handleFiles(files) {
    for (var i = 0, len = files.length; i < len; i++) {
        if (validateImage(files[i]))
            previewAnduploadImage(files[i]);
    }
}
function validateImage(image) {
    // check the type
    var validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (validTypes.indexOf( image.type ) === -1) {
        alert("Invalid File Type");
        return false;
    }

    // check the size
    var maxSizeInBytes = 10e6; // 10MB
    if (image.size > maxSizeInBytes) {
        alert("File too large");
        return false;
    }

    return true;
}
function handleDrop(e) {
    var data = e.dataTransfer,
        files = data.files;

    handleFiles(files)      
}
dropRegion.addEventListener('drop', handleDrop, false);
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function previewAnduploadImage(image) {

    // container
    removeAllChildNodes(dropRegion);
    var preview_container = document.createElement("div");
    preview_container.className = "preview-container";
    preview_container.style["height"] = "100%";
    dropRegion.appendChild(preview_container);
    var preview = document.createElement("div");
    preview.className = "preview";
    preview_container.appendChild(preview);

    // previewing image
    var img = document.createElement("img");
    img.style["height"] = "100%";
    img.setAttribute("width", "800");
    img.setAttribute("height", "600");
    img.setAttribute("id","wh-image")
    preview.appendChild(img);

    // progress overlay
    var overlay = document.createElement("div");
    overlay.className = "overlay";
    preview.appendChild(overlay);


    // read the image...
    var reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    }
    reader.readAsDataURL(image);

    // create FormData
    var formData = new FormData();
    formData.append('image', image);

    // upload the image
    var uploadLocation = './tmp';

    var ajax = new XMLHttpRequest();
    ajax.open("POST", uploadLocation, true);

    ajax.onreadystatechange = function(e) {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                // done!
            } else {
                // error!
            }
        }
    }

    ajax.upload.onprogress = function(e) {

        // change progress
        // (reduce the width of overlay)

        var perc = (e.loaded / e.total * 100) || 100,
            width = 100 - perc;

        overlay.style.width = width;
    }

    ajax.send(formData);

}

$('#detect').click(function(){
    var form = $('#form-data')[0];
    var formData = new FormData(form);
    var request = $.ajax({
        url: "./detect",
        type: "post",
        enctype: 'multipart/form-data',
        data: formData,
        processData: false,
        contentType: false,
    });
    request.done(function(response) {
        $("#wh-image").attr("src","./runs/detect/exp/"+response.filename+"/"+Math.floor(Math.random()*1000));
    });
})

});
