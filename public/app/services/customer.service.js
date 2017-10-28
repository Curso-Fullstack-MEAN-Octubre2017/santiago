'use strict';

angular.module('customerService', ['rx'])
    .service('customerService', function($resource, $q) { 	

        var Resource = $resource('/api/customers/:id', {id: '@id'}, {
            query: {
                method: "GET",
                params: {},
                isArray: true,
                cache: true
            },
            update: { 
                method:'PUT'
            }
        })

        var customerSource =  new Rx.BehaviorSubject(Resource.query());
        var customerList = customerSource.asObservable();

        this.query = function() {
            return customerList;
        }
        
        this.get = function (id) {
            if (customerList.source.value.find((obj) => obj._id == id)) {
                return customerList.source.value.find((obj) => obj._id == id);
            } else {
                return Resource.get({id:id});
            }
        }
        
        this.save = function (customer) {
            var d = $q.defer();
            if (customer._id) { // PUT
            	Resource.update({ id: customer._id }, {
                    dni: customer.dni,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phone,
                    email: customer.email,
                    note: customer.note,
                    __v: customer.__v
                }, (data) => {
                    customer.__v = customer.__v + 1 // NEW VERSION
                    const ObjIndex = customerList.source.value.findIndex((obj) => obj._id == customer._id);
                    customerList.source.value[ObjIndex].dni = customer.dni; 
                    customerList.source.value[ObjIndex].firstName = customer.firstName;
                    customerList.source.value[ObjIndex].lastName = customer.lastName;
                    customerList.source.value[ObjIndex].phone = customer.phone;
                    customerList.source.value[ObjIndex].email = customer.email;
                    customerList.source.value[ObjIndex].note = customer.note;
                    customerList.source.value[ObjIndex].__v = customer.__v;
                    d.resolve (customer);
                }, (err) => {
                    d.reject(err);
                });
            } else { // SAVE
            	Resource.save({}, {
                    dni: customer.dni,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phone,
                    email: customer.email,
                    note: customer.note
                }, (data) => {
                    customerList.source.value.unshift(data)
                    d.resolve (data);
                },(err) => {
                    d.reject(err);
                });
            }
            return d.promise;
        }
        
        this.delete = function (customer) {
            var d = $q.defer();
        	Resource.delete({ id: customer._id }, (data) => {
                const index = customerList.source.value.indexOf(customer);
                customerList.source.value.splice(index, 1);
                d.resolve(data);
            }, (err) => {
                d.reject(err);
            });
            return d.promise;
        }

    });