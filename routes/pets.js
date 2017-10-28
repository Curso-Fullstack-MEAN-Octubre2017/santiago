const Pet = require('../models/pet');
const Customer = require('../models/customer');
const multer = require('multer');

module.exports = (router, io) => {


    router.get('/pets', function (req, res, next) {
        Pet.find({}, (err, pets) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                res.json(pets);
            }
        }).populate({
            path: 'owner',
            model: 'Customer'
        }).sort({ '_id': -1 });
    });

    router.get('/pets/:id', function (req, res, next) {
        Pet.findById({ _id: req.params.id }, (err, pets) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                res.json(pets);
            }
        }).populate({
            path: 'owner',
            model: 'Customer'
        }).sort({ '_id': -1 });
    });

    router.get('/pets/:id/owner', function (req, res, next) {
        Pet.find({ owner: req.params.id }, (err, pets) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                res.json(pets);
            }
        }).populate({
            path: 'owner',
            model: 'Customer'
        }).sort({ '_id': -1 });
    });

    router.post('/pets', (req, res, next) => {
        /*
        if (!req.body.photoUrl) {
          res.json({success: false, message: 'Debes escribir especificar una url para la foto para la Mascota'});
          return;
        }
        if (!req.body.name) {
          res.json({success: false, message: 'Debes escribir un nombre para la Mascota'});
          return;
        }
        if (!req.body.birthday) {
          res.json({success: false, message: 'Debes escribir una fecha para la Mascota'});
          return;
        }
        if (!req.body.specie) {
          res.json({success: false, message: 'Debes escribir una especie para la Mascota'});
          return;
        }
        if (!req.body.race) {
            res.json({success: false, message: 'Debes escribir una raza para la Mascota'});
            return;
        }
        if (!req.body.chipNumber) {
            res.json({success: false, message: 'Debes escribir un numero de chip para la Mascota'});
            return;
        }
        if (!req.body.owner) {
            res.json({success: false, message: 'Debes especificar un dueño para la Mascota'});
            return;
        }
        */

        const pet = new Pet({
            photoUrl: '',
            name: req.body.name,
            birthday: req.body.birthday,
            specie: req.body.specie,
            race: req.body.race,
            chipNumber: req.body.chipNumber,
            description: req.body.description,
            owner: req.body.owner
        });
        pet.save((err) => {
            if (err) {
                res.json({ success: false, message: 'Error!!!' });
            } else {
                pet.populate({
                    path: 'owner',
                    model: 'Customer'
                }, (err, petPopulate)=> {
                    if (err) {
                        res.status(404).json(err);
                    } else {
                        res.json(petPopulate);
                    }
                });
            }
        })
    });

    router.post('/pets/:id', (req, res, next) => {
        const fileName = Date.now();
        const storage = multer.diskStorage({
            destination: './public/uploads/',
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        });
        const upload = multer({ storage: storage }).single('photoUrl');
        upload(req, res, (err) => {
            if (err) {
                res.json({ success: false, message: err });
                return
            } else {
                console.log(req.file);
            }
        })
        console.log(req.file, req.params.id);
        res.json(req.params.id);
    })

    router.put('/pets/:id', (req, res, next) => {
        if (!req.body.name) {
            res.status(404).json({ success: false, message: 'Debes escribir un nombre para el Veterinario' });
            return;
        }

        var version = req.body.__v;
        req.body.__v++;

        Pet.findOneAndUpdate({ _id: req.params.id, __v: version }, req.body, {new : true}, (err, pet) => {
            if (err) {
                res.status(404).json(err);
            } else {
                pet.populate({
                    path: 'owner',
                    model: 'Customer'
                }, (err, petPopulate)=> {
                    if (err) {
                        res.json({ success: false, message: 'Error!!!' });
                    } else {
                        console.log(petPopulate)
                        res.json(petPopulate);
                    }
                });
            }
        })
    });
    return router;
}