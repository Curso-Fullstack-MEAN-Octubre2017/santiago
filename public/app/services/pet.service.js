'use strict';

angular.module('petService', ['rx'])
    .service('petService', function ($resource, $q) {

        var Resource =  $resource('/api/pets/:id', {id: '@id'}, {
            query: {
                method: "GET",
                isArray: true,
                cache: true
            },
            update: { 
                method:'PUT'
            },
            upload: {
                method: 'POST',
                transformRequest: formDataObject,
                headers: { 'Content-Type': undefined, enctype:'multipart/form-data' }
            },
            getPetsByOwner: {
                method: 'GET',
                params: {id: '@id'},
                isArray: true,
                url: '/api/pets/:id/owner'
            }
        })

        function formDataObject (data) {
            var fd = new FormData();
            angular.forEach(data, function(value, key) {
                fd.append(key, value);
            });
            return fd;
        }

        var perSource = new Rx.BehaviorSubject(Resource.query());
        var petList = perSource.asObservable();

        this.query = function() {
            return petList;
        }
        
        this.get = function (id) {
            if (petList.source.value.find((obj) => obj._id == id)) {
                return petList.source.value.find((obj) => obj._id == id);
            } else {
                return Resource.get({id:id});
            }
        }

        this.getPetsByOwner = function(id) {
            return Resource.getPetsByOwner({id: id});
        }

        this.save = function (pet) {
            var d = $q.defer();
            if (pet._id) { // PUT
                Resource.update({ id: pet._id }, {
                    photoUrl: pet.photoUrl,
                    name: pet.name,
                    birthday: pet.birthday,
                    specie: pet.specie,
                    race: pet.race,
                    chipNumber: pet.chipNumber,
                    description: pet.description,
                    owner: pet.owner._id,
                    __v: pet.__v
                }, (data) => {
                    pet.__v = pet.__v + 1; // NEW VERSION
                    const ObjIndex = petList.source.value.findIndex((obj) => obj._id == pet._id);
                    petList.source.value[ObjIndex].photoUrl = pet.photoUrl; 
                    petList.source.value[ObjIndex].name = pet.name;
                    petList.source.value[ObjIndex].birthday = pet.birthday;
                    petList.source.value[ObjIndex].specie = pet.specie;
                    petList.source.value[ObjIndex].race = pet.race;
                    petList.source.value[ObjIndex].chipNumber = pet.chipNumber;
                    petList.source.value[ObjIndex].description = pet.description;
                    petList.source.value[ObjIndex].owner = pet.owner;
                    petList.source.value[ObjIndex].__v = pet.__v;
                    d.resolve (pet);
                }, (err) => {
                    d.reject(err);
                });
            } else { // SAVE
                Resource.save({}, {
                    photoUrl: '',
                    name: pet.name,
                    birthday: pet.birthday,
                    specie: pet.specie,
                    race: pet.race,
                    chipNumber: pet.chipNumber,
                    description: pet.description,
                    owner: pet.owner
                }, (data) => {
                    petList.source.value.unshift(data)
                    d.resolve (data);
                },(err) => {
                    d.reject(err);
                });
            }
            return d.promise;
        }

        this.delete = function (pet) {
            var d = $q.defer();
            Resource.delete({ id: pet._id }, (data) => {
                const index = petList.source.value.indexOf(pet);
                petList.source.value.splice(index, 1);
                d.resolve(data);
            }, (err) => {
                d.reject(err);
            });
            return d.promise;
        }
        this.upload = function (_id, photoUrl) {
            console.log(_id, photoUrl);
            //petService.upload({ id: pet._id }, {
            //    photoUrl: pet.photoUrl
            //}, (data)=>{
            //    console.log('ok');
            //}, (err) => {
            //    console.log('err')
            //});
        }
    

    });