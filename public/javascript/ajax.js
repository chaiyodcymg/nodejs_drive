$(document).ready(function () {

    $('.close').click(function () {
        $('.toast').hide();
    })


    $('#filetoupload').change(function (e) {

        const file = e.target.files[0]
        let size = file.size / 1000
        size > 1024 ? size = (size / 1000).toFixed(2) + ' MB ' : size = size + " KB "
        const formdata = new FormData();
        formdata.append('file', file)
        const xhr = new XMLHttpRequest();
        xhr.open("POST", '<%= pathupload %>')

        xhr.upload.addEventListener('progress', ({ loaded, total }) => {
            $('.toast').show();
            const progress = Math.floor((loaded / total) * 100)
            let filesize = Math.floor(total / 1000)
            filesize > 1024 ? filesize = (loaded / (1000 * 1000)).toFixed(2) + ' MB ' : filesize = filesize + " KB "
            $('#progress-bar-loaded').css('width', progress + '%')
            $('#progress-bar-loaded').text(progress + '%')
            $('.filesize').text(filesize + " / " + size)

            if (loaded == total) {
                $('.success').text("Upload Successfully")
            }

        })
        xhr.send(formdata)

    });
});