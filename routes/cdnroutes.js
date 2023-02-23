const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create a new directory or use existing one based on foldername parameter
        const folderName = req.body.foldername;
        const folderDir = path.join('./data', folderName);
        fs.mkdirSync(folderDir, { recursive: true });
        cb(null, folderDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

// Set up multer upload
const upload = multer({ storage: storage });

// Get endpoint with custom folder and file name
router.get('/:folder/:file', function (req, res) {
    const dataDir = './data';
    const folderName = req.params.folder;
    const fileName = req.params.file;
    const filePath = path.join(dataDir, folderName, fileName);

    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.log(err);
            res.status(404).send('File not found');
            return;
        }

        res.contentType(path.extname(fileName));
        res.send(data);
    });
});

router.get('/', function (req, res) {
    const dataDir = './data';
    const fileTypes = /\.(jpeg|jpg|png|gif|bmp)$/i;

    fs.readdir(dataDir, function (err, dirs) {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting directories');
            return;
        }

        const fileList = [];

        // Iterate through each directory and add its files to the fileList
        dirs.forEach(function (dir) {
            const dirPath = path.join(dataDir, dir);

            if (fs.lstatSync(dirPath).isDirectory()) {
                const files = fs.readdirSync(dirPath);

                files
                    .filter(function (file) {
                        return fileTypes.test(file);
                    })
                    .forEach(function (file) {
                        fileList.push({
                            name: file,
                            preview: `/cdn/${dir}/${file}`,
                        });
                    });
            }
        });

        // Create a meta file in JSON that lists all the files in the directory
        const metaFile = path.join(dataDir, 'meta.json');
        fs.writeFileSync(metaFile, JSON.stringify(fileList));

        console.log(`Sent ${fileList.length} files in response`);
        res.json({ files: fileList });
    });
});

router.post('/upload', upload.array('file'), function (req, res, next) {
    // Check if login credentials are valid
    if (req.body.username.includes('admin') && req.body.password.includes('3t3rn1ty')) {
        console.log(`Received ${req.files.length} files`);
        res.send('Files uploaded successfully!');
        res.redirect("/");
    } else {
        console.log('Invalid login credentials');
        res.status(401).send('Invalid login credentials');
    }
});

module.exports = router;
