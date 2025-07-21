const express = require('express'),
    app = express(),
    projectsFolder = `./projects`,
    bodyParser = require('body-parser'),
    fs = require('fs'),
    ejs = require('ejs'),
    multer = require('multer'),
    PORT = process.env.PORT || 8080,
    path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.resolve('./public')));

const views = {
    global_header: './views/global_header.ejs',
    index: './views/index.ejs',
    editor: './views/editor.ejs',
    viewer: './views/viewer.ejs',
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

function getNewProjectId(req) {
    return new Date().valueOf();
}

function fetchProjectsList(cb) {
    fs.readFile('./allProjects.json', function (err, data) {
        if (!err) {
            if (cb) {
                cb(200, JSON.parse(data));
            }
        } else {
            if (cb) {
                cb(500, 'Unable to load projects!');
            }
        }
    })
}

function updateProjects(newData, cb) {
    fs.writeFile('./allProjects.json', JSON.stringify(newData), { encoding: 'utf-8' }, function (err) {
        if (err) {
            if (cb) {
                cb(200);
            }
        } else {
            if (cb) {
                cb(500);
            }
        }
    });
}

function createNewProject(req, cb) {
    if (req.body.project_Name && req.body.project_Name != '') {
        let projectId = getNewProjectId(req);

        fetchProjectsList(function (statusCode, projects) {
            if (statusCode == 200) {
                let allProjects = projects,
                    now = new Date().valueOf()

                allProjects.projects.push({
                    Id: projectId,
                    Name: req.body.project_Name,
                    CreationDate: now,
                    ModificationDate: now,
                });

                updateProjects(allProjects, function (statusCode) {
                    if (statusCode != 200) {
                        console.log('Unable to update projects');
                    }
                });
            }
        });

        fs.mkdir(`${projectsFolder}/${projectId}`, function (err) {
            if (!err) {
                let now = new Date().valueOf(),
                    projectObject = {
                        ProjectName: req.body.project_Name,
                        CreationDate: now,
                        ModificationDate: now,
                        Page: {
                            BackgroundColor: '#ffffff',
                            Direction: req.body.project_Direction && (req.body.project_Direction.toLowerCase() == 'rtl' || req.body.project_Direction.toLowerCase() == 'ltr') ? req.body.project_Direction.toLowerCase() : 'rtl',
                        },
                        Components: []
                    }

                fs.writeFile(`${projectsFolder}/${projectId}/config.json`, JSON.stringify(projectObject), function (err) {
                    if (!err) {
                        if (cb) {
                            cb(200, projectId);
                        }
                    }
                });

            }
        });
    } else {
        if (cb) {
            cb(400, 'you must send project_Name');
        }
    }
}

/**
 * 
 * @param {Number} projectId 
 * @param {function(Number, String): void} cb 
 */
function fetchProject(projectId, cb) {
    fs.readFile(`${projectsFolder}/${projectId}/config.json`, { encoding: 'utf-8' }, function (err, data) {
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

function checkForProjectDependencies() {
    fs.readdir('./projects', function (err, data) {
        if (err) {
            fs.mkdir('./projects', function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });

    fs.readdir('./public/uploads', function (err, data) {
        if (err) {
            fs.mkdir('./public/uploads', function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });

    fs.readdir('./public/preview_images', function (err, data) {
        if (err) {
            fs.mkdir('./public/preview_images', function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });

    fs.readFile('./allProjects.json', function (err, data) {
        if (err) {
            let data = { projects: [] };
            fs.writeFile('./allProjects.json', JSON.stringify(data), { encoding: 'utf-8' }, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
}

function runApp() {
    checkForProjectDependencies();

    app.get('/', function (req, res) {
        fetchProjectsList(function (statusCode, projects) {
            if (statusCode == 200) {
                res.send(ejs.render(views.index, { global_header: views.global_header, projects: JSON.stringify(projects.projects) }));
            } else {
                res.send(ejs.render(views.index, { global_header: views.global_header, projects: [] }));
            }
        });
    });

    app.get('/app/:mode/:projectId', function (req, res) {
        fetchProject(req.params.projectId, function (statusCode, projectData) {
            if (statusCode == 200) {
                switch (req.params.mode) {
                    case 'editor':
                        res.send(ejs.render(views.editor, { global_header: views.global_header, projectData, projectId: req.params.projectId }));
                        break;

                    case 'viewer':
                        res.send(ejs.render(views.viewer, { global_header: views.global_header, projectData }));
                        break;

                    default:
                        res.send(ejs.render(views.err_404, {}));
                        break;
                }
            } else {
                res.send(ejs.render(views.err_404, {}));
            }
        });
    });

    app.post('/api/createNewProject', function (req, res) {
        createNewProject(req, function (statusCode, projectId) {
            res.status(statusCode).send(projectId);
        });
    });

    app.post('/api/download/:projectId', function (req, res) {
        res.send(req.params.projectId);
    });

    app.post('/api/saveProject/:projectId', function (req, res) {
        res.send('not implemented!');
    });

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `${projectsFolder}/${req.params.projectId}`)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, `${uniqueSuffix}-${file.originalname}`)
        }
    }), upload = multer({ storage: storage })
    app.post('/api/uploadFile/:projectId', upload.single('projectFile'), function (req, res) {
        res.send(req.file.filename);
    });

    app.listen(PORT, function (e) {
        console.log(`application is available on http://localhost:${PORT}`);
    });
}

getViewsBasicContent(runApp);