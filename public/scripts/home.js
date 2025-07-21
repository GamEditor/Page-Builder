function openProject(mode, id) { window.open(`/app/${mode}/${id}`, '_self') }
function downloadProject(id) {
    sendWebRequest('POST', `/api/download/${id}`, { projectId: id }, function (err, downloadLink) {
        console.log(downloadLink)
    })
}
function loadProjectsOnUi() {
    let projetctsElems =
        `<table>
        <thead>
            <tr>
                <th><div class="tableHeader" data-title="پروژه های شما"></div></th>
                <th></th>
                <th></th>
                <th></th>
                <th><input type="button" id="btnOpenNewProjectView" value="ساختن پروژه جدید"></th>
            </tr>
            <tr>
                <th>پیش نمایش یا #</th>
                <th>نام</th>
                <th>تاریخ ایجاد</th>
                <th>تاریخ آخرین تغییر</th>
                <th>فعالیت های موجود</th>
            </tr>
        </thead>
        <tbody>`
    if (PROJECTS.length > 0) {
        for (let i = 0; i < PROJECTS.length; i++) {
            projetctsElems +=
                `<tr>
                    <td>${i + 1}</td>
                    <td>${PROJECTS[i].Name}</td>
                    <td class="ltr">${getJalaliDateTimeText(new Date(PROJECTS[i].CreationDate))}</td>
                    <td class="ltr">${getJalaliDateTimeText(new Date(PROJECTS[i].ModificationDate))}</td>
                    <td>
                        <div class="btn" onclick="openProject('editor', ${PROJECTS[i].Id})">ویرایش</div>
                        <div class="btn" onclick="openProject('viewer', ${PROJECTS[i].Id})">مشاهده</div>
                        <div class="btn" onclick="downloadProject(${PROJECTS[i].Id})">دانلود خروجی نهایی</div>
                    </td>
                </tr>`
        }
    }
    $('#projectsTable').html(`${projetctsElems}</tbody></table>`)

    $('#btnOpenNewProjectView').on('click', function (e) {
        openView('#newProject')
    })
}

$(function (e) {
    $('select').select2({})

    loadProjectsOnUi()

    $('#btnCreateNewProject').on('click', function (e) {
        sendWebRequest('POST', '/api/createNewProject', { project_Name: $('#project_Name').val(), project_Direction: $('#project_Direction').val() }, function (err, projectId) {
            if (!err) {
                window.open(`/app/editor/${projectId}`, '_self')
            } else {
                alert(err)
            }
        })
    })
})