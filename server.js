const express = require('express')
const app = express()
const fs = require('fs');
const os = require("os");
const path = require('path')
const port = 3000
const {createDirectory, fileExist} = require("./utils.js")
const bb = require("express-busboy")
bb.extend(app, {
    upload: true,
    path: '/tmp/storageTest',
    allowedPath: /./
});


// CROS FUNCTION --> pour que l'erreur cross n'apparaisse plus
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
const root = path.join(os.tmpdir(), "test")


// Exemple de base
app.post('/', (req, res) => {
    res.send('Hello World!')
    console.log("Got it!")
})


// Function pour récupérer les informations name, isFolder, et size, les mettre en json et les renvoyer
app.get('/api/drive', async (req, res) => {

    const files = await fs.promises.readdir(root);  // Lis tout les fichiers du dossier "os.tmpdir()" qui est égale au dossier tmp
    const json = files.map((file) => {  // Pour chaque file du dossier tmp, crée un tableau avec pour chaque indice un objet valant le retour de la arrow function
        const fileStats = fs.statSync(root + '/' + file); // filestats vaut les stats de chaque fichier dans le dossier tmpdir
        return {
            name: file,
            isFolder: fileStats.isDirectory(),
            size: fileStats.size
        }
    });
    res.json(json);
})


app.get('/api/drive/:name', async (req, res) => {
    const myFile = path.join(root, req.params.name);

    if (await fileExist(myFile) === false) {
        res.sendStatus(404);
        return;
    }

    const fileStats = await fs.promises.stat(myFile);


    if (fileStats.isDirectory() === true) {

        const files = await fs.promises.readdir(myFile);  // Lis tout les fichiers du dossier "os.tmpdir()" qui est égale au dossier tmp
        const json = files.map((file) => {  // Pour chaque file du dossier tmp, crée un tableau avec pour chaque indice un objet valant le retour de la arrow function
            const fileStats = fs.statSync(path.join(myFile, file)); // filestats vaut les stats de chaque fichier dans le dossier tmpdir
            return {
                name: file,
                isFolder: fileStats.isDirectory(),
                size: fileStats.size
            }
        });
        res.json(json);
    } else {
        res.status(200).sendFile(path.join(root, req.params.name))
    }
})


app.post('/api/drive', async (req, res) => {

    const name = req.query.name
    const regex = /^[a-zA-Z]+$/gm

    if (await fileExist(name) === false) {
        if (name.match(regex))
            try {
                await createDirectory(name);
                res.sendStatus(200)
            } catch (err) {
                res.status(404).send('Impossble de créer le dossier : ' + err)
            }
        else {
            res.status(400).send("Le nom de votre fichier/dossier c'est de la merde")
        }
    } else {
        res.status(404).send('Le dossier existe déjà pov con')
    }
})


app.post('/api/drive/:folder', async (req, res) => {
    const name = req.query.name
    const folderName = req.params.folder
    const regex = /^[a-zA-Z]+$/gm


    if (await fileExist(name) === false) {
        if (name.match(regex)) {
            try {
                await createDirectory(name, folderName);
                res.status(200).send("directory created successfully !");
            } catch (err) {
                res.status(404).send("Une erreur est survenue")
            }

        } else {
            res.status(400).send("Mauvais nom de dossier")
        }
    } else {
        res.status(404).send("Dossier déjà existant")
    }
})


app.delete('/api/drive/:name', async (req, res) => {

    const name = req.params.name
    const regex = /^[a-zA-Z]+$/gm
    const myFile = path.join(root, req.params.name);


    if (await fileExist(myFile) === true) {
        if (name.match(regex))
            try {
                await fs.promises.rm(myFile, {recursive: true})
                res.sendStatus(200)
            } catch (err) {
                res.status(404).send('Impossble de supprimer le dossier/fichier : ' + name + ' ' + err)
            }
        else {
            res.status(400).send("Le nom de votre fichier/dossier c'est de la merde")
        }
    }
})


app.delete('/api/drive/:folder/:name', async (req, res) => {
    const name = req.params.name
    const folderName = req.params.folder
    const regex = /^[a-zA-Z]+$/gm
    const myFile = path.join(root, folderName, name);


    if (await fileExist(myFile) === true) {
        if (name.match(regex))
            try {
                await fs.promises.rm(myFile, {recursive: true})
                res.sendStatus(200)
            } catch (err) {
                res.status(404).send('Impossble de supprimer le dossier/fichier : ' + name + ' ' + err + "Le fichier/dossier n'existe pas")
            }
        else {
            res.status(400).send("Le nom de votre fichier/dossier c'est de la merde")
        }
    }
})


app.put('/api/drive', async (req, res) => {
    try {
        await fs.promises.rename(req.files.file.file, path.join(root, req.files.file.filename))
        res.status(200).send("Le fichier à bien été crée")
    } catch {
        res.status(400).send("Aucun fichier présent dans la requête")
    }

})


app.put('/api/drive/:folder', async (req, res) => {
    const folderName = req.params.folder
    try {
        await fs.promises.rename(req.files.file.file, path.join(root, folderName, req.files.file.filename))
        res.status(200).send("Le fichier à bien été crée")
    } catch {
        res.status(400).send("Aucun fichier présent dans la requête")
    }

})


function start() {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })

}

module.exports = {start};
