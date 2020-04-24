const { admin, db } = require('../utility/admin');
const config = require('../utility/config');
const firebase = require('firebase');

firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../utility/validators');

// Signup user
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    const { valid, errors } = validateSignupData(newUser);

    if(!valid) return res.status(400).json(errors);

    const noImg = 'no-img.png';

    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: 'This handle is already taken'});
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(e => {
            if(e.code === 'auth/email-already-in-use'){
                return res.status(400).json({ email: 'Email already exists' });
            } else {
                res.status(500).json({ error: e.code });
                console.error(e);
            }
        });
};

// Login user
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if(!valid) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch((e) => {
            if(e.code === 'auth/wrong-password'){
                return res
                    .status(403)
                    .json({ general: 'Wrong credentials, please try again' });
            } else res.status(500).json({ error: e.code });
    });
};

// Add user details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.status(200).json({ message: 'Details updated successfully' });
        })
        .catch((e) => {
            console.error(e);
            return res.status(500).json({ error: e.code });
        });
};

// Get own user details
exports.getAuthenticatedUser = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.user.handle}`).get()
        .then((doc) => {
            if(doc.exists) {
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', req.user.handle).get();
            }
        })
        .then((data) => {
            userData.likes = [];
            data.forEach((doc) => {
                userData.likes.push(doc.data());
            });
            return res.status(200).json(userData);
        })
        .catch((e) => {
            console.error(e);
            return res.status(500).json({ error: e.code });
        });
};

// Upload a profile image for user
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageToBeUploaded = {};
    let imageFileName;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }
        console.log(fieldname, file, filename, encoding, mimetype);
        const imageExtention = filename.split('.')[filename.split('.').length -1];
        imageFileName = `${Math.round(Math.random()*10000000).toString()}.${imageExtention}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
        })
        .then(() => {
            return res.status(200).json({ message: 'Image uploaded successfully' });
        })
        .catch((e) => {
            console.error(e);
            return res.status(500).json({ error: e.code });
        });
    });
    busboy.end(req.rawBody);
};