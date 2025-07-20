const express = require('express'),
    app = express(),
    projectsFolder = `./projects`,
    bodyParser = require('body-parser'),
    fs = require('fs'),
    ejs = require('ejs'),
    multer = require('multer'),
    PORT = process.env.PORT || 8080,
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `${projectsFolder}/${req.params.projectCode}`)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix)
        }
    }),
    upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const views = {
    index: './views/index.ejs',
    editor: './views/editor.ejs',
    err_404: './views/errors/404.ejs',
}

function getViewsBasicContent(cb) {
    let v = Object.entries(views), finishCounter = 0, finish = function () {
        finishCounter++;
        if (finishCounter == v.length) {
            if (cb) {
                cb();
            }
        }
    };

    for (const [key, value] of v) {
        fs.readFile(value, { encoding: 'utf-8' }, function (err, data) {
            if (!err) {
                views[key] = data;
            }
            finish();
        });
    }
}

function getNewProjectCode(req) {
    return new Date().valueOf();
}

function createNewProject(req, cb) {
    let projectCode = getNewProjectCode(req);
    fs.mkdir(`${projectsFolder}/${projectCode}`, function (err) {
        if (!err) {
            fs.writeFile(`${projectsFolder}/${projectCode}/config.json`, '{}', function (err) {
                if (!err) {
                    if (cb) {
                        cb(projectCode);
                    }
                }
            });

        }
    });
}

/**
 * 
 * @param {Number} projectCode 
 * @param {function(Number, String): void} cb 
 */
function fetchProject(projectCode, cb) {
    fs.readFile(`${projectsFolder}/${projectCode}/config.json`, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            if (cb) {
                cb(200, data);
            }
        } else {
            if (cb) {
                cb(404, data);
            }
        }
    });
}

function runApp() {
    app.get('/', function (req, res) {
        res.send(ejs.render(views.index, {}));
    });

    app.get('/editor/edit/:project', function (req, res) {
        fetchProject(req.params.project, function (projectData) {
            res.send(ejs.render(views.editor, { data: projectData }));
        });

    });

    app.post('/api/createNewProject', function (req, res) {
        createNewProject(req, function (projectCode) {
            res.send(projectCode);
        });
    });

    app.post('/api/uploadFile', upload.single('projectFile'), function (req, res) {
        res.send(req.file.filename);
    });

    app.listen(PORT, function (e) {
        console.log(`application is available on http://localhost:${PORT}`);
    });
}

getViewsBasicContent(runApp);