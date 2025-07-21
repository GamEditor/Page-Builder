function openProject(mode, id) { window.open(`/app/${mode}/${id}`, '_self') }
function loadProjectsOnUi() {
    let projetctsElems = ''
    if (PROJECTS.length > 0) {
        for (let i = 0; i < PROJECTS.length; i++) {
            projetctsElems +=
                `<div class="project" data-id="${PROJECTS[i].id}">
                    <div class="projectPreview"></div>
                    <div class="projectDetails">
                        <div class="projectName">${PROJECTS[i].name}</div>
                        <div class="flex">
                            <div class="projectBtn projectBtnView" onclick="openProject('viewer', ${PROJECTS[i].id})">مشاهده</div>
                            <div class="projectBtn projectBtnEdit" onclick="openProject('editor', ${PROJECTS[i].id})">ویرایش</div>
                        </div>
                    </div>
                </div>`
        }
    }
    $('#allProjects').html(projetctsElems)
}

$(function (e) {
    $('select').select2({})

    loadProjectsOnUi()

    $('#btnOpenNewProjectView').on('click', function (e) {
        openView('#newProject')
    })

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